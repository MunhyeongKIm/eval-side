import { prisma } from '@/lib/prisma';

/**
 * DB-based rate limiter using Prisma + PostgreSQL.
 * Survives deployments and works across multiple instances.
 */

function getWindowStart(windowMs: number): Date {
  const now = Date.now();
  const windowStart = now - (now % windowMs);
  return new Date(windowStart);
}

/**
 * Check and increment rate limit for a given key.
 * Returns { allowed, remaining, retryAfterMs }.
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; retryAfterMs: number }> {
  const window = getWindowStart(windowMs);
  const windowEnd = new Date(window.getTime() + windowMs);
  const retryAfterMs = windowEnd.getTime() - Date.now();

  try {
    // Upsert: increment if exists, create if not
    const record = await prisma.rateLimit.upsert({
      where: {
        key_window: { key, window },
      },
      update: {
        count: { increment: 1 },
      },
      create: {
        key,
        window,
        count: 1,
      },
    });

    const allowed = record.count <= maxRequests;
    const remaining = Math.max(0, maxRequests - record.count);

    return { allowed, remaining, retryAfterMs };
  } catch {
    // On DB error, fail open to avoid blocking legitimate users
    console.error('Rate limiter DB error, failing open');
    return { allowed: true, remaining: maxRequests, retryAfterMs: 0 };
  }
}

/**
 * Check daily global evaluation limit.
 */
export async function checkDailyGlobalLimit(
  maxDaily: number
): Promise<{ allowed: boolean; remaining: number }> {
  const result = await checkRateLimit('global:daily', maxDaily, 24 * 60 * 60 * 1000);
  return { allowed: result.allowed, remaining: result.remaining };
}

/**
 * Check hourly global evaluation limit (burst protection).
 */
export async function checkHourlyGlobalLimit(
  maxHourly: number
): Promise<{ allowed: boolean; remaining: number }> {
  const result = await checkRateLimit('global:hourly', maxHourly, 60 * 60 * 1000);
  return { allowed: result.allowed, remaining: result.remaining };
}

/**
 * Clean up expired rate limit records.
 * Call periodically (e.g., after each request or via cron).
 */
export async function cleanupExpiredRecords(): Promise<void> {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // Keep last 24h
    await prisma.rateLimit.deleteMany({
      where: {
        window: { lt: cutoff },
      },
    });
  } catch {
    console.error('Rate limit cleanup failed');
  }
}
