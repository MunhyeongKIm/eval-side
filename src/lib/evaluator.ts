import { EvaluationInput, EvaluationReport, ScoreResult } from './types';
import { evaluateTech } from './evaluators/tech-evaluator';
import { evaluateMarket } from './evaluators/market-evaluator';
import { evaluateUX } from './evaluators/ux-evaluator';
import { evaluateFeasibility } from './evaluators/feasibility-evaluator';
import { evaluateGrowth } from './evaluators/growth-evaluator';
import { evaluateRisk } from './evaluators/risk-evaluator';
import { callAISummary } from './ai-client';
import { SUMMARY_SYSTEM_PROMPT } from './ai-prompts';

function applyConsistencyAdjustments(results: {
  tech: ScoreResult;
  market: ScoreResult;
  ux: ScoreResult;
  feasibility: ScoreResult;
  growth: ScoreResult;
  risk: ScoreResult;
}): void {
  const { tech, market, feasibility, growth, risk } = results;

  const pct = (r: ScoreResult) => r.score / r.maxScore;

  // tech < 30% && feasibility > 70% → cap feasibility at 50%
  if (pct(tech) < 0.3 && pct(feasibility) > 0.7) {
    feasibility.score = Math.min(feasibility.score, Math.round(feasibility.maxScore * 0.5));
  }

  // market < 30% && growth > 70% → cap growth at 50%
  if (pct(market) < 0.3 && pct(growth) > 0.7) {
    growth.score = Math.min(growth.score, Math.round(growth.maxScore * 0.5));
  }

  // risk < 30% && average of remaining 5 > 70%
  if (pct(risk) < 0.3) {
    const others = [tech, market, results.ux, feasibility, growth];
    const avgPct = others.reduce((sum, r) => sum + pct(r), 0) / others.length;
    if (avgPct > 0.7) {
      // Deduct 10% from the highest-scoring of the remaining 5
      const highest = others.reduce((max, r) => pct(r) > pct(max) ? r : max, others[0]);
      highest.score = Math.max(0, highest.score - Math.round(highest.maxScore * 0.1));
    }
  }

  // Recalculate grades
  for (const r of [tech, market, results.ux, feasibility, growth, risk]) {
    const percentage = (r.score / r.maxScore) * 100;
    r.grade = percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 60 ? 'C' : percentage >= 40 ? 'D' : 'F';
  }
}

function determineConfidence(input: EvaluationInput, aiSuccessCount: number): 'high' | 'medium' | 'low' {
  if (input.type === 'concept') return 'low';
  if (input.type === 'github' && input.repoAnalysis && aiSuccessCount === 6) return 'high';
  return 'medium';
}

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

  // Cross-consistency validation
  applyConsistencyAdjustments({ tech, market, ux, feasibility, growth, risk });

  const totalScore = tech.score + market.score + ux.score + feasibility.score + growth.score + risk.score;

  // Determine verdict
  let verdict: EvaluationReport['verdict'];
  if (totalScore >= 75) verdict = 'PASS';
  else if (totalScore >= 55) verdict = 'CONDITIONAL_PASS';
  else if (totalScore >= 35) verdict = 'NEEDS_WORK';
  else verdict = 'FAIL';

  // Floor penalty: any area below 25% of maxScore prevents PASS
  const allScores = [tech, market, ux, feasibility, growth, risk];
  const hasFloor = allScores.some(s => s.score / s.maxScore < 0.25);
  if (hasFloor && verdict === 'PASS') {
    verdict = 'CONDITIONAL_PASS';
  }

  // Confidence calculation (AI success inferred from analysis length - fallbacks are short)
  const aiSuccessCount = allScores.filter(s => s.analysis.length > 100).length;
  const confidence = determineConfidence(input, aiSuccessCount);

  // Generate summary
  const allStrengths = [...tech.strengths, ...market.strengths, ...ux.strengths, ...feasibility.strengths, ...growth.strengths, ...risk.strengths];
  const allImprovements = [...tech.improvements, ...market.improvements, ...ux.improvements, ...feasibility.improvements, ...growth.improvements, ...risk.improvements];

  // Try AI summary
  let summary: string | null = null;
  try {
    const summaryInput = `Project: ${input.name}
Total Score: ${totalScore}/100 (${verdict})

## Individual Evaluation Results
- Technical Completeness: ${tech.score}/${tech.maxScore} (${tech.grade}) - ${tech.analysis.slice(0, 200)}
- Market Fit: ${market.score}/${market.maxScore} (${market.grade}) - ${market.analysis.slice(0, 200)}
- User Experience: ${ux.score}/${ux.maxScore} (${ux.grade}) - ${ux.analysis.slice(0, 200)}
- Feasibility: ${feasibility.score}/${feasibility.maxScore} (${feasibility.grade}) - ${feasibility.analysis.slice(0, 200)}
- Growth Potential: ${growth.score}/${growth.maxScore} (${growth.grade}) - ${growth.analysis.slice(0, 200)}
- Risk Management: ${risk.score}/${risk.maxScore} (${risk.grade}) - ${risk.analysis.slice(0, 200)}

## Key Strengths
${allStrengths.slice(0, 5).map(s => `- ${s}`).join('\n')}

## Key Improvements
${allImprovements.slice(0, 5).map(i => `- ${i}`).join('\n')}`;

    summary = await callAISummary(SUMMARY_SYSTEM_PROMPT, summaryInput);
  } catch (e) {
    console.warn('[AI Summary] Failed:', e);
  }

  // Fallback summary
  if (!summary) {
    summary = `Overall evaluation for "${input.name}": ${totalScore}/100 (${verdict}).
Key strengths: ${allStrengths.slice(0, 3).join(', ') || 'None noted'}.
Key improvements: ${allImprovements.slice(0, 3).join(', ') || 'None noted'}.`;
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
    confidence,
  };
}
