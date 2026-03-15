import { EvaluationInput, EvaluationReport } from './types';
import { evaluateTech } from './evaluators/tech-evaluator';
import { evaluateMarket } from './evaluators/market-evaluator';
import { evaluateUX } from './evaluators/ux-evaluator';
import { evaluateFeasibility } from './evaluators/feasibility-evaluator';
import { evaluateGrowth } from './evaluators/growth-evaluator';
import { evaluateRisk } from './evaluators/risk-evaluator';

export function evaluateProject(input: EvaluationInput): EvaluationReport {
  // Run all evaluations (they are synchronous)
  const tech = evaluateTech(input);
  const market = evaluateMarket(input);
  const ux = evaluateUX(input);
  const feasibility = evaluateFeasibility(input);
  const growth = evaluateGrowth(input);
  const risk = evaluateRisk(input);

  const totalScore = tech.score + market.score + ux.score + feasibility.score + growth.score + risk.score;

  // Determine verdict
  let verdict: EvaluationReport['verdict'];
  if (totalScore >= 75) verdict = 'PASS';
  else if (totalScore >= 55) verdict = 'CONDITIONAL_PASS';
  else if (totalScore >= 35) verdict = 'NEEDS_WORK';
  else verdict = 'FAIL';

  // Generate summary
  const allStrengths = [...tech.strengths, ...market.strengths, ...ux.strengths, ...feasibility.strengths, ...growth.strengths, ...risk.strengths];
  const allImprovements = [...tech.improvements, ...market.improvements, ...ux.improvements, ...feasibility.improvements, ...growth.improvements, ...risk.improvements];

  const summary = `프로젝트 "${input.name}"의 종합 평가 결과: ${totalScore}/100점 (${verdict}).
주요 강점: ${allStrengths.slice(0, 3).join(', ') || '특이사항 없음'}.
주요 개선점: ${allImprovements.slice(0, 3).join(', ') || '특이사항 없음'}.`;

  return {
    totalScore,
    verdict,
    summary,
    tech,
    market,
    ux,
    feasibility,
    growth,
    risk,
    topImprovements: allImprovements.slice(0, 3),
  };
}
