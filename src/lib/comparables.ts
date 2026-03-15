export interface ComparableCase {
  // existing
  name: string;
  category: string;
  outcome: string;
  scoreRange: [number, number];
  highlights: string[];
  tags: string[];
  // new
  dealType: 'acquisition' | 'acqui-hire' | 'ipo' | 'revenue' | 'funding' | 'portfolio';
  acquirer?: string;
  dealValue?: { min: number; max: number };
  year?: number;
  teamSize?: number;
  techStack?: string[];
  source?: string;
  revenue?: { mrr?: number; arr?: number };
  metrics?: { users?: number; stars?: number };
}

export { COMPARABLE_CASES } from './comparables-data';
import { COMPARABLE_CASES } from './comparables-data';

export function findComparables(
  totalScore: number,
  tags?: string[],
  limit: number = 3,
  dealType?: ComparableCase['dealType'],
  techStack?: string[],
): ComparableCase[] {
  const margin = 15;
  const inRange = COMPARABLE_CASES.filter(
    (c) => totalScore >= c.scoreRange[0] - margin && totalScore <= c.scoreRange[1] + margin,
  );

  const tagSet = tags && tags.length > 0 ? new Set(tags.map((t) => t.toLowerCase())) : null;
  const techSet = techStack && techStack.length > 0 ? new Set(techStack.map((t) => t.toLowerCase())) : null;

  return inRange
    .map((c) => {
      // Score proximity (0-1): closer to the range midpoint = higher
      const mid = (c.scoreRange[0] + c.scoreRange[1]) / 2;
      const maxDist = margin + (c.scoreRange[1] - c.scoreRange[0]) / 2;
      const scoreProximity = 1 - Math.min(Math.abs(totalScore - mid) / maxDist, 1);

      // Tag overlap (0-1)
      const tagOverlap = tagSet
        ? c.tags.filter((t) => tagSet.has(t)).length / Math.max(tagSet.size, 1)
        : 0;

      // Deal type match (0 or 1)
      const dealTypeMatch = dealType && c.dealType === dealType ? 1 : 0;

      // Tech stack overlap (0-1)
      const techStackOverlap = techSet && c.techStack
        ? c.techStack.filter((t) => techSet.has(t.toLowerCase())).length / Math.max(techSet.size, 1)
        : 0;

      const matchScore =
        scoreProximity * 0.3 +
        tagOverlap * 0.3 +
        dealTypeMatch * 0.2 +
        techStackOverlap * 0.2;

      return { case_: c, matchScore };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)
    .map((x) => x.case_);
}
