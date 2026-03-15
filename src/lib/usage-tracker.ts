import { checkDailyGlobalLimit, checkHourlyGlobalLimit } from '@/lib/rate-limiter';

const DAILY_LIMIT = 100;
const HOURLY_LIMIT = 30;

/**
 * DB-based usage tracker. Delegates to the DB rate limiter
 * so limits survive deployments and scale across instances.
 */

export async function checkDailyLimit(): Promise<{ allowed: boolean; remaining: number }> {
  return checkDailyGlobalLimit(DAILY_LIMIT);
}

export async function checkHourlyLimit(): Promise<{ allowed: boolean; remaining: number }> {
  return checkHourlyGlobalLimit(HOURLY_LIMIT);
}

export function getUsageStats(): { dailyLimit: number; hourlyLimit: number } {
  return { dailyLimit: DAILY_LIMIT, hourlyLimit: HOURLY_LIMIT };
}
