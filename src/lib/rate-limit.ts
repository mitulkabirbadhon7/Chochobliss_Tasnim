interface RateLimitRecord {
  tokens: number;
  lastRefill: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

export interface RateLimitConfig {
  maxTokens: number;
  refillIntervalMs: number;
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { maxTokens: 10, refillIntervalMs: 20000 }
): { success: boolean; remaining: number } {
  const now = Date.now();
  let record = memoryStore.get(identifier);

  if (!record) {
    record = {
      tokens: config.maxTokens - 1,
      lastRefill: now,
    };
    memoryStore.set(identifier, record);
    return { success: true, remaining: record.tokens };
  }

  const elapsed = now - record.lastRefill;
  if (elapsed > config.refillIntervalMs) {
    record.tokens = config.maxTokens;
    record.lastRefill = now;
  }

  if (record.tokens > 0) {
    record.tokens -= 1;
    return { success: true, remaining: record.tokens };
  }

  return { success: false, remaining: 0 };
}
