import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the rate-limiter module
vi.mock('@/lib/rate-limiter', () => ({
  checkDailyGlobalLimit: vi.fn(),
  checkHourlyGlobalLimit: vi.fn(),
}));

import { checkDailyLimit, checkHourlyLimit, getUsageStats } from '@/lib/usage-tracker';
import { checkDailyGlobalLimit, checkHourlyGlobalLimit } from '@/lib/rate-limiter';

const mockCheckDaily = vi.mocked(checkDailyGlobalLimit);
const mockCheckHourly = vi.mocked(checkHourlyGlobalLimit);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('usage-tracker', () => {
  it('allows usage when under daily limit', async () => {
    mockCheckDaily.mockResolvedValue({ allowed: true, remaining: 99 });
    const result = await checkDailyLimit();
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(99);
    expect(mockCheckDaily).toHaveBeenCalledWith(100);
  });

  it('blocks usage when daily limit exceeded', async () => {
    mockCheckDaily.mockResolvedValue({ allowed: false, remaining: 0 });
    const result = await checkDailyLimit();
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('checks hourly limit for burst protection', async () => {
    mockCheckHourly.mockResolvedValue({ allowed: true, remaining: 29 });
    const result = await checkHourlyLimit();
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(29);
    expect(mockCheckHourly).toHaveBeenCalledWith(30);
  });

  it('returns usage stats with correct limits', () => {
    const stats = getUsageStats();
    expect(stats.dailyLimit).toBe(100);
    expect(stats.hourlyLimit).toBe(30);
  });
});
