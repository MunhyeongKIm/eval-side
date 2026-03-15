import { describe, it, expect } from 'vitest';
import {
  calculateDollarValue,
  formatDollarValue,
  formatDealValue,
  getValuationResult,
  VALUATION_TIERS,
} from '@/lib/valuation';

describe('calculateDollarValue', () => {
  it('returns 0 for score 0', () => {
    expect(calculateDollarValue(0)).toBe(0);
  });

  it('returns positive value for positive scores', () => {
    expect(calculateDollarValue(50)).toBeGreaterThan(0);
  });

  it('increases monotonically with score', () => {
    let prev = 0;
    for (let score = 1; score <= 100; score++) {
      const value = calculateDollarValue(score);
      expect(value).toBeGreaterThanOrEqual(prev);
      prev = value;
    }
  });

  it('clamps to 100 for high scores', () => {
    const at100 = calculateDollarValue(100);
    const at150 = calculateDollarValue(150);
    expect(at150).toBe(at100);
  });
});

describe('formatDollarValue', () => {
  it('formats with dollar sign and commas', () => {
    expect(formatDollarValue(1000)).toBe('$1,000');
    expect(formatDollarValue(150000)).toBe('$150,000');
  });

  it('formats zero', () => {
    expect(formatDollarValue(0)).toBe('$0');
  });
});

describe('formatDealValue', () => {
  it('formats millions', () => {
    expect(formatDealValue({ min: 1_000_000, max: 5_000_000 })).toBe('$1.0M - $5.0M');
  });

  it('formats thousands', () => {
    expect(formatDealValue({ min: 30_000, max: 100_000 })).toBe('$30K - $100K');
  });

  it('formats equal min/max as single value', () => {
    expect(formatDealValue({ min: 20_000_000, max: 20_000_000 })).toBe('$20.0M');
  });

  it('formats billions', () => {
    expect(formatDealValue({ min: 1_000_000_000, max: 1_000_000_000 })).toBe('$1.0B');
  });
});

describe('getValuationResult', () => {
  it('returns tier, dollarValue, and comparableCases', () => {
    const result = getValuationResult(60);
    expect(result.tier).toBeDefined();
    expect(result.tier.name).toBe('Growth Project');
    expect(result.dollarValue).toBeGreaterThan(0);
    expect(result.comparableCases.length).toBeGreaterThan(0);
  });

  it('passes dealType and techStack to findComparables', () => {
    const result = getValuationResult(80, ['saas'], 'revenue', ['TypeScript']);
    expect(result.comparableCases.length).toBeGreaterThan(0);
  });
});

describe('VALUATION_TIERS', () => {
  it('covers full 0-100 range without gaps', () => {
    let expectedMin = 0;
    VALUATION_TIERS.forEach((tier) => {
      expect(tier.scoreMin).toBe(expectedMin);
      expectedMin = tier.scoreMax + 1;
    });
    expect(VALUATION_TIERS[VALUATION_TIERS.length - 1].scoreMax).toBe(100);
  });
});
