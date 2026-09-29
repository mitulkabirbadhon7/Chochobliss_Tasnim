import { headers } from "next/headers";
import { Redis } from "@upstash/redis";
import { RateLimitError } from "./errors";

export interface RateLimitConfig {
  maxTokens: number;
  refillRateMs?: number;
  refillIntervalMs?: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

interface InMemoBucket {
  tokens: number;
  lastRefill: number;
}

// Global in-memory storage for token buckets across instances
const globalMemoryStore = new Map<string, InMemoBucket>();

/**
 * Token Bucket Rate Limiter
 *
 * Requirements:
 * - Maximum capacity: 10 tokens
 * - Refill rate: 1 token every 2 seconds (2000 ms)
 * - Gradual refill (tokens accumulate over time, not fixed window reset)
 * - Returns 429 when exhausted
 * - Uses Upstash Redis when configured; falls back gracefully to in-memory store.
 */
export class TokenBucketRateLimiter {
  private static instance: TokenBucketRateLimiter;
  private readonly capacity: number = 10;
  private readonly refillRateMs: number = 2000; // 1 token every 2 seconds
  private redisClient: Redis | null = null;

  constructor(config?: Partial<RateLimitConfig>) {
    if (config?.maxTokens != null) this.capacity = config.maxTokens;
    if (config?.refillRateMs != null) {
      this.refillRateMs = config.refillRateMs;
    } else if (config?.refillIntervalMs != null) {
      this.refillRateMs = config.refillIntervalMs;
    }

    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (redisUrl && redisToken) {
      try {
        this.redisClient = new Redis({
          url: redisUrl,
          token: redisToken,
        });
      } catch {
        this.redisClient = null;
      }
    }
  }

  public static getInstance(): TokenBucketRateLimiter {
    if (!TokenBucketRateLimiter.instance) {
      TokenBucketRateLimiter.instance = new TokenBucketRateLimiter();
    }
    return TokenBucketRateLimiter.instance;
  }

  /**
   * Consumes tokens for a given identifier using the token bucket algorithm.
   */
  public async consume(
    identifier: string,
    tokensRequested = 1,
    now: number = Date.now()
  ): Promise<RateLimitResult> {
    if (this.redisClient) {
      try {
        return await this.consumeRedis(identifier, tokensRequested, now);
      } catch (err) {
        if (process.env.NODE_ENV !== "test") {
          console.warn("[RateLimiter] Upstash Redis unreachable, falling back to in-memory:", err);
        }
      }
    }

    return this.consumeMemory(identifier, tokensRequested, now);
  }

  /**
   * In-memory token bucket implementation with gradual token refill.
   */
  public consumeMemory(
    identifier: string,
    tokensRequested = 1,
    now: number = Date.now()
  ): RateLimitResult {
    let bucket = globalMemoryStore.get(identifier);

    if (!bucket) {
      bucket = {
        tokens: this.capacity,
        lastRefill: now,
      };
      globalMemoryStore.set(identifier, bucket);
    } else {
      // Calculate gradual refill
      const elapsed = Math.max(0, now - bucket.lastRefill);
      const tokensToAdd = Math.floor(elapsed / this.refillRateMs);

      if (tokensToAdd > 0) {
        bucket.tokens = Math.min(this.capacity, bucket.tokens + tokensToAdd);
        bucket.lastRefill += tokensToAdd * this.refillRateMs;
      }
    }

    if (bucket.tokens >= tokensRequested) {
      bucket.tokens -= tokensRequested;
      return {
        success: true,
        remaining: bucket.tokens,
        retryAfterSeconds: 0,
      };
    }

    // Bucket exhausted
    const timeUntilNextToken = this.refillRateMs - (now - bucket.lastRefill);
    const retryAfter = Math.max(1, Math.ceil(timeUntilNextToken / 1000));

    return {
      success: false,
      remaining: bucket.tokens,
      retryAfterSeconds: retryAfter,
    };
  }

  /**
   * Redis-backed atomic token bucket using Lua script.
   */
  private async consumeRedis(
    identifier: string,
    tokensRequested: number,
    now: number
  ): Promise<RateLimitResult> {
    if (!this.redisClient) {
      return this.consumeMemory(identifier, tokensRequested, now);
    }

    const key = `ratelimit:tb:${identifier}`;
    const luaScript = `
      local key = KEYS[1]
      local capacity = tonumber(ARGV[1])
      local refillRate = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])
      local requested = tonumber(ARGV[4])

      local data = redis.call('HMGET', key, 'tokens', 'lastRefill')
      local tokens = tonumber(data[1])
      local lastRefill = tonumber(data[2])

      if tokens == nil then
        tokens = capacity
        lastRefill = now
      else
        local elapsed = now - lastRefill
        if elapsed > 0 then
          local tokensToAdd = math.floor(elapsed / refillRate)
          if tokensToAdd > 0 then
            tokens = math.min(capacity, tokens + tokensToAdd)
            lastRefill = lastRefill + (tokensToAdd * refillRate)
          end
        end
      end

      if tokens >= requested then
        tokens = tokens - requested
        redis.call('HMSET', key, 'tokens', tokens, 'lastRefill', lastRefill)
        local ttl = math.ceil((capacity * refillRate) / 1000) + 60
        redis.call('EXPIRE', key, ttl)
        return {1, tokens, 0}
      else
        local timeUntilNext = refillRate - (now - lastRefill)
        local retryAfter = math.max(1, math.ceil(timeUntilNext / 1000))
        return {0, tokens, retryAfter}
      end
    `;

    const result = (await this.redisClient.eval(
      luaScript,
      [key],
      [this.capacity, this.refillRateMs, now, tokensRequested]
    )) as [number, number, number];

    const isSuccess = result[0] === 1;
    return {
      success: isSuccess,
      remaining: result[1],
      retryAfterSeconds: result[2],
    };
  }

  /**
   * Clears memory store (useful for test resets).
   */
  public reset(identifier?: string): void {
    if (identifier) {
      globalMemoryStore.delete(identifier);
    } else {
      globalMemoryStore.clear();
    }
  }
}

/**
 * Extracts client IP safely from Next.js server headers.
 * Never trust client-provided payloads or bodies.
 */
export async function getClientIp(): Promise<string> {
  try {
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
    const realIp = headersList.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }
  } catch {
    // In environments without header context (e.g. tests)
  }
  return "127.0.0.1";
}

export const rateLimiter = TokenBucketRateLimiter.getInstance();

/**
 * Enforces rate limiting or throws RateLimitError with retryAfterSeconds.
 */
export async function enforceRateLimit(actionKey: string, userOrIp?: string): Promise<void> {
  const ip = userOrIp || (await getClientIp());
  const key = `${actionKey}:${ip}`;
  const result = await rateLimiter.consume(key);

  if (!result.success) {
    throw new RateLimitError(
      `Too many requests. Please wait ${result.retryAfterSeconds} seconds before retrying.`,
      result.retryAfterSeconds
    );
  }
}

/**
 * Backward-compatible helper.
 */
export function rateLimit(
  identifier: string,
  config?: Partial<RateLimitConfig>
): { success: boolean; remaining: number } {
  const limiter = config
    ? new TokenBucketRateLimiter(config)
    : TokenBucketRateLimiter.getInstance();
  const res = limiter.consumeMemory(identifier);
  return { success: res.success, remaining: res.remaining };
}
