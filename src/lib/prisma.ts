import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile(".env.local");
  } catch {}
}

// Use sslmode=verify-full to avoid node-postgres pg deprecation warning in dev and production
const connectionString = (process.env.DATABASE_URL || "").replace("sslmode=require", "sslmode=verify-full");

const isNeon = connectionString.includes("neon.tech") || connectionString.includes("sslmode=");
const isProduction = process.env.NODE_ENV === "production";

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString: connectionString || undefined,
    ssl: isNeon || isProduction ? { rejectUnauthorized: false } : undefined,
    max: 10,
  });

// Essential: Prevent unhandled error events from crashing Node.js serverless functions on idle drops
pool.on("error", (err) => {
  console.warn("Neon PostgreSQL pool idle error:", err.message);
});

if (process.env.NODE_ENV !== "production") globalForPrisma.pool = pool;

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
