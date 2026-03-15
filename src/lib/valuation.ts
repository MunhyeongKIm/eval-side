import { findComparables, ComparableCase } from './comparables';

export interface ValuationTier {
  name: string;
  scoreMin: number;
  scoreMax: number;
  valueMin: number;
  valueMax: number;
  description: string;
  comparables: string[];
}

export interface ValuationResult {
  dollarValue: number;
  tier: ValuationTier;
  comparableCases: ComparableCase[];
}

export const VALUATION_TIERS: ValuationTier[] = [
  {
    name: 'Learning Project',
    scoreMin: 0,
    scoreMax: 15,
    valueMin: 0,
    valueMax: 0,
    description: 'Personal learning exercise with no market value yet',
    comparables: ['Tutorial follow-along', 'Course assignment output'],
  },
  {
    name: 'Portfolio Piece',
    scoreMin: 16,
    scoreMax: 30,
    valueMin: 0,
    valueMax: 2_000,
    description: 'Demonstrates skills, may boost hiring prospects by $2-5K salary',
    comparables: ['Personal portfolio site', 'Hackathon demo', 'Open-source hobby tool'],
  },
  {
    name: 'Side Hustle',
    scoreMin: 31,
    scoreMax: 45,
    valueMin: 2_000,
    valueMax: 10_000,
    description: 'Small Flippa-tier asset, potential micro-revenue stream',
    comparables: ['Flippa micro-deal ($1-10K)', 'Chrome extension with 1K+ users', 'Niche blog with traffic'],
  },
  {
    name: 'Early Product',
    scoreMin: 46,
    scoreMax: 60,
    valueMin: 10_000,
    valueMax: 50_000,
    description: 'Real users, early revenue signals, Acquire.com lower tier',
    comparables: ['Acquire.com starter listing ($10-50K)', 'SaaS with MRR $100-500', 'Mobile app with 5K+ downloads'],
  },
  {
    name: 'Growth Stage',
    scoreMin: 61,
    scoreMax: 75,
    valueMin: 50_000,
    valueMax: 150_000,
    description: 'Proven traction, recurring revenue, Acquire.com mid-tier',
    comparables: ['Acquire.com mid-tier ($50-150K)', 'SaaS with MRR $500-2K', 'Tool with 10K+ active users'],
  },
  {
    name: 'Acquisition Target',
    scoreMin: 76,
    scoreMax: 90,
    valueMin: 150_000,
    valueMax: 500_000,
    description: 'Strong product-market fit, scalable revenue, acqui-hire potential',
    comparables: ['Acquire.com upper-tier ($150-500K)', 'Acqui-hire ($300K-1M/engineer)', 'SaaS with MRR $2K-10K'],
  },
  {
    name: 'Breakout / Exit-Ready',
    scoreMin: 91,
    scoreMax: 100,
    valueMin: 500_000,
    valueMax: 2_000_000,
    description: 'Exceptional traction, strategic value, venture-scale potential',
    comparables: ['Wordle → NYT ($1M+)', 'Strategic acquisition', 'Seed-stage valuation equivalent'],
  },
];

function findTier(score: number): ValuationTier {
  const clamped = Math.max(0, Math.min(100, score));
  for (const tier of VALUATION_TIERS) {
    if (clamped >= tier.scoreMin && clamped <= tier.scoreMax) {
      return tier;
    }
  }
  return VALUATION_TIERS[VALUATION_TIERS.length - 1];
}

export function calculateDollarValue(totalScore: number): number {
  if (totalScore <= 0) return 0;
  const clamped = Math.max(0, Math.min(100, totalScore));
  const tier = findTier(clamped);
  const t = tier.scoreMax === tier.scoreMin
    ? 1
    : (clamped - tier.scoreMin) / (tier.scoreMax - tier.scoreMin);
  return Math.round(tier.valueMin + t * (tier.valueMax - tier.valueMin));
}

export function formatDollarValue(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDealValue(deal: { min: number; max: number }): string {
  const format = (v: number): string => {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v}`;
  };
  if (deal.min === deal.max) return format(deal.min);
  return `${format(deal.min)} - ${format(deal.max)}`;
}

export function getValuationResult(
  totalScore: number,
  tags?: string[],
  dealType?: ComparableCase['dealType'],
  techStack?: string[],
): ValuationResult {
  const tier = findTier(Math.max(0, Math.min(100, totalScore)));
  return {
    dollarValue: calculateDollarValue(totalScore),
    tier,
    comparableCases: findComparables(totalScore, tags, 3, dealType, techStack),
  };
}
