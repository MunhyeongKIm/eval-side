import { describe, it, expect } from 'vitest';
import { findComparables, COMPARABLE_CASES } from '@/lib/comparables';

describe('findComparables', () => {
  it('returns cases by score proximity', () => {
    const results = findComparables(95);
    expect(results.length).toBeLessThanOrEqual(3);
    // All results should be in/near the 90-100 range
    results.forEach((r) => {
      expect(r.scoreRange[1]).toBeGreaterThanOrEqual(80);
    });
  });

  it('prioritizes tag matching', () => {
    const results = findComparables(80, ['analytics', 'privacy']);
    // Analytics/privacy projects should rank higher
    const hasAnalytics = results.some((r) => r.tags.includes('analytics'));
    expect(hasAnalytics).toBe(true);
  });

  it('filters by dealType when specified', () => {
    const results = findComparables(80, ['saas'], 3, 'revenue');
    // Revenue deal types should be prioritized
    const revenueCount = results.filter((r) => r.dealType === 'revenue').length;
    expect(revenueCount).toBeGreaterThan(0);
  });

  it('considers techStack overlap', () => {
    const results = findComparables(60, undefined, 3, undefined, ['TypeScript', 'Next.js']);
    // Projects with TypeScript/Next.js should rank higher
    const hasTechMatch = results.some(
      (r) => r.techStack?.some((t) => ['TypeScript', 'Next.js'].includes(t)),
    );
    expect(hasTechMatch).toBe(true);
  });

  it('respects limit parameter', () => {
    const results = findComparables(50, undefined, 5);
    expect(results.length).toBeLessThanOrEqual(5);
  });

  it('returns results for edge scores', () => {
    expect(findComparables(0).length).toBeGreaterThan(0);
    expect(findComparables(100).length).toBeGreaterThan(0);
  });
});

describe('COMPARABLE_CASES', () => {
  it('has 84+ cases', () => {
    expect(COMPARABLE_CASES.length).toBeGreaterThanOrEqual(84);
  });

  it('all cases have required dealType field', () => {
    const validTypes = ['acquisition', 'acqui-hire', 'ipo', 'revenue', 'funding', 'portfolio'];
    COMPARABLE_CASES.forEach((c) => {
      expect(validTypes).toContain(c.dealType);
    });
  });

  it('covers all score tiers', () => {
    const tiers = [
      [0, 10], [11, 25], [26, 35], [36, 54], [55, 74], [75, 89], [90, 100],
    ];
    tiers.forEach(([min, max]) => {
      const inTier = COMPARABLE_CASES.filter(
        (c) => c.scoreRange[0] >= min && c.scoreRange[1] <= max,
      );
      expect(inTier.length).toBeGreaterThanOrEqual(2);
    });
  });
});
