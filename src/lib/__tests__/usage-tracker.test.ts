import { describe, it, expect, beforeEach } from 'vitest';

// Re-import to get fresh module state
let checkDailyLimit: typeof import('@/lib/usage-tracker').checkDailyLimit;
let recordUsage: typeof import('@/lib/usage-tracker').recordUsage;
let getUsageStats: typeof import('@/lib/usage-tracker').getUsageStats;

beforeEach(async () => {
  // Reset module state by re-importing
  const mod = await import('@/lib/usage-tracker');
  checkDailyLimit = mod.checkDailyLimit;
  recordUsage = mod.recordUsage;
  getUsageStats = mod.getUsageStats;
});

describe('usage-tracker', () => {
  it('allows usage when under limit', () => {
    const { allowed } = checkDailyLimit();
    expect(allowed).toBe(true);
  });

  it('tracks usage count', () => {
    recordUsage();
    recordUsage();
    const stats = getUsageStats();
    expect(stats.count).toBeGreaterThanOrEqual(2);
    expect(stats.limit).toBe(100);
  });

  it('returns remaining count', () => {
    const { remaining } = checkDailyLimit();
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(100);
  });
});
