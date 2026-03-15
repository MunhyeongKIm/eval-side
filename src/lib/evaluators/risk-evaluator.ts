import { EvaluationInput, ScoreResult } from '../types';
import { callAI } from '../ai-client';
import { RISK_SYSTEM_PROMPT, buildInputContext } from '../ai-prompts';

export async function evaluateRisk(input: EvaluationInput): Promise<ScoreResult> {
  const aiResult = await callAI({
    systemPrompt: RISK_SYSTEM_PROMPT,
    userPrompt: buildInputContext(input),
    maxScore: 15,
  });

  if (aiResult) {
    let score = Math.round(aiResult.score);
    if (aiResult.subscores) {
      const subTotal = Object.values(aiResult.subscores).reduce((a, b) => a + b, 0);
      score = Math.round(subTotal);
    }
    score = Math.min(Math.max(score, 0), 15);
    const percentage = (score / 15) * 100;
    const grade = percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 60 ? 'C' : percentage >= 40 ? 'D' : 'F';
    return {
      score,
      maxScore: 15,
      grade,
      analysis: aiResult.analysis,
      strengths: aiResult.strengths,
      improvements: aiResult.improvements,
    };
  }

  return evaluateRiskFallback(input);
}

function evaluateRiskFallback(input: EvaluationInput): ScoreResult {
  let score = 15; // Start from max and deduct for risks
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (input.type === 'github' && input.repoAnalysis) {
    const repo = input.repoAnalysis;

    // Tech risk (4pts deductible)
    if (!repo.hasTests) { score -= 2; improvements.push('No tests - quality risk'); }
    if (!repo.hasCICD) { score -= 1; improvements.push('CI/CD not configured - deployment risk'); }
    if (Object.keys(repo.dependencies).length > 50) { score -= 1; improvements.push('Excessive dependencies - security/maintenance risk'); }
    else { strengths.push('Dependency size is appropriate'); }

    // Legal risk (4pts deductible)
    if (!repo.license) { score -= 3; improvements.push('No license specified - high legal risk'); }
    else { strengths.push(`License specified: ${repo.license}`); }

    // Market risk (4pts deductible)
    const daysSinceUpdate = repo.updatedAt ? (Date.now() - new Date(repo.updatedAt).getTime()) / (1000 * 60 * 60 * 24) : 999;
    if (daysSinceUpdate > 180) { score -= 2; improvements.push('No updates for over 6 months - project abandonment risk'); }
    if (repo.recentCommitCount < 3) { score -= 1; improvements.push('Low recent commit activity'); }
    else { strengths.push('Active development activity'); }

    // Dependency risk (3pts deductible)
    if (repo.forks < 2 && repo.stars < 5) { score -= 1; improvements.push('Insufficient community support - key-person risk'); }
    else { strengths.push('Community base exists'); }

  } else {
    const desc = (input.description || '').toLowerCase();
    const riskKeywords = ['privacy', 'security', 'payment', 'health', 'finance', 'legal', 'compliance', 'regulation', 'gdpr', 'hipaa'];
    const risksFound = riskKeywords.filter(k => desc.includes(k));
    if (risksFound.length > 0) {
      score -= risksFound.length * 2;
      improvements.push(`High-risk areas detected: ${risksFound.join(', ')} - regulatory compliance required`);
    }
    if (desc.length < 50) { score -= 3; improvements.push('Description too brief for reliable risk assessment'); }
  }

  score = Math.max(Math.min(score, 15), 0);
  const percentage = (score / 15) * 100;
  const grade = percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 60 ? 'C' : percentage >= 40 ? 'D' : 'F';

  return { score, maxScore: 15, grade, analysis: `Risk analysis complete. Score: ${score}/15 (higher score = lower risk)`, strengths, improvements };
}
