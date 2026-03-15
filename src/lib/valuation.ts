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
    scoreMax: 10,
    valueMin: 0,
    valueMax: 500,
    description: 'Personal learning, no market value',
    comparables: ['Tutorial clone project', 'Assignment/practice output'],
  },
  {
    name: 'Portfolio Starter',
    scoreMin: 11,
    scoreMax: 25,
    valueMin: 500,
    valueMax: 3_000,
    description: 'Junior portfolio, $2-5K salary premium',
    comparables: ['Personal blog/portfolio site', 'Hackathon MVP'],
  },
  {
    name: 'Hiring Signal',
    scoreMin: 26,
    scoreMax: 35,
    valueMin: 3_000,
    valueMax: 10_000,
    description: 'Flippa small-scale deal, $5-10K salary premium',
    comparables: ['Flippa small app deal ($3-10K)', 'Open-source tool (GitHub Stars 100+)'],
  },
  {
    name: 'Early Product',
    scoreMin: 36,
    scoreMax: 54,
    valueMin: 10_000,
    valueMax: 40_000,
    description: 'Acquire.com lower tier, early project with users',
    comparables: ['Acquire.com lower-tier deal ($10-40K)', 'Small SaaS (MRR $100-500)'],
  },
  {
    name: 'Growth Project',
    scoreMin: 55,
    scoreMax: 74,
    valueMin: 40_000,
    valueMax: 150_000,
    description: 'Acquire.com mid-tier, revenue-generating stage',
    comparables: ['Acquire.com mid-tier deal ($40-150K)', 'SaaS (MRR $500-3K)', 'Chrome extension (10K+ users)'],
  },
  {
    name: 'Acquisition Target',
    scoreMin: 75,
    scoreMax: 89,
    valueMin: 150_000,
    valueMax: 500_000,
    description: 'Acquire.com upper tier, acqui-hire ($500K-1.5M/person)',
    comparables: ['Acquire.com upper-tier deal ($150-500K)', 'Acqui-hire cases ($500K-1.5M/person)'],
  },
  {
    name: 'Viral / Exit-Ready',
    scoreMin: 90,
    scoreMax: 100,
    valueMin: 500_000,
    valueMax: 2_000_000,
    description: 'Wordle→NYT ($1-5M), strategic acquisition',
    comparables: ['Wordle → NYT acquisition ($1-5M)', 'Figma plugin major deal', 'Strategic acqui-hire'],
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
