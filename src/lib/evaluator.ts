import { EvaluationInput, EvaluationReport } from './types';
import { evaluateTech } from './evaluators/tech-evaluator';
import { evaluateMarket } from './evaluators/market-evaluator';
import { evaluateUX } from './evaluators/ux-evaluator';
import { evaluateFeasibility } from './evaluators/feasibility-evaluator';
import { evaluateGrowth } from './evaluators/growth-evaluator';
import { evaluateRisk } from './evaluators/risk-evaluator';
import { callAISummary } from './ai-client';
import { SUMMARY_SYSTEM_PROMPT } from './ai-prompts';

export async function evaluateProject(input: EvaluationInput): Promise<EvaluationReport> {
  // Run all 6 evaluations in parallel
  const [tech, market, ux, feasibility, growth, risk] = await Promise.all([
    evaluateTech(input),
    evaluateMarket(input),
    evaluateUX(input),
    evaluateFeasibility(input),
    evaluateGrowth(input),
    evaluateRisk(input),
  ]);

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

  // Try AI summary
  let summary: string | null = null;
  try {
    const summaryInput = `프로젝트: ${input.name}
총점: ${totalScore}/100 (${verdict})

## 개별 평가 결과
- 기술 완성도: ${tech.score}/${tech.maxScore} (${tech.grade}) - ${tech.analysis.slice(0, 200)}
- 시장 적합성: ${market.score}/${market.maxScore} (${market.grade}) - ${market.analysis.slice(0, 200)}
- 사용자 경험: ${ux.score}/${ux.maxScore} (${ux.grade}) - ${ux.analysis.slice(0, 200)}
- 실현 가능성: ${feasibility.score}/${feasibility.maxScore} (${feasibility.grade}) - ${feasibility.analysis.slice(0, 200)}
- 성장 잠재력: ${growth.score}/${growth.maxScore} (${growth.grade}) - ${growth.analysis.slice(0, 200)}
- 리스크 관리: ${risk.score}/${risk.maxScore} (${risk.grade}) - ${risk.analysis.slice(0, 200)}

## 주요 강점
${allStrengths.slice(0, 5).map(s => `- ${s}`).join('\n')}

## 주요 개선점
${allImprovements.slice(0, 5).map(i => `- ${i}`).join('\n')}`;

    summary = await callAISummary(SUMMARY_SYSTEM_PROMPT, summaryInput);
  } catch (e) {
    console.warn('[AI Summary] Failed:', e);
  }

  // Fallback summary
  if (!summary) {
    summary = `프로젝트 "${input.name}"의 종합 평가 결과: ${totalScore}/100점 (${verdict}).
주요 강점: ${allStrengths.slice(0, 3).join(', ') || '특이사항 없음'}.
주요 개선점: ${allImprovements.slice(0, 3).join(', ') || '특이사항 없음'}.`;
  }

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
