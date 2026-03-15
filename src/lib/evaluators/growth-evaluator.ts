import { EvaluationInput, ScoreResult } from '../types';
import { callAI } from '../ai-client';
import { GROWTH_SYSTEM_PROMPT, buildInputContext } from '../ai-prompts';

export async function evaluateGrowth(input: EvaluationInput): Promise<ScoreResult> {
  const aiResult = await callAI({
    systemPrompt: GROWTH_SYSTEM_PROMPT,
    userPrompt: buildInputContext(input),
    maxScore: 25,
  });

  if (aiResult) {
    let score = Math.round(aiResult.score);
    if (aiResult.subscores) {
      const subTotal = Object.values(aiResult.subscores).reduce((a, b) => a + b, 0);
      score = Math.round(subTotal);
    }
    score = Math.min(Math.max(score, 0), 25);
    const percentage = (score / 25) * 100;
    const grade = percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 60 ? 'C' : percentage >= 40 ? 'D' : 'F';
    return {
      score,
      maxScore: 25,
      grade,
      analysis: aiResult.analysis,
      strengths: aiResult.strengths,
      improvements: aiResult.improvements,
    };
  }

  return evaluateGrowthFallback(input);
}

function evaluateGrowthFallback(input: EvaluationInput): ScoreResult {
  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (input.type === 'github' && input.repoAnalysis) {
    const repo = input.repoAnalysis;

    // Revenue model (5pts)
    const revenueKeywords = ['pricing', 'subscription', 'premium', 'pro', 'enterprise', 'free tier', 'paid', 'monetize'];
    if (revenueKeywords.some(k => repo.readme.toLowerCase().includes(k))) {
      score += 4;
      strengths.push('Revenue model mentioned in README');
    } else {
      score += 1;
      improvements.push('Specify a monetization strategy');
    }

    // Distribution strategy (5pts)
    if (repo.stars > 50) { score += 3; strengths.push('Organic growth signal (stars)'); }
    else if (repo.stars > 10) { score += 2; }
    else { score += 1; improvements.push('Project promotion activities needed'); }

    if (repo.topics.length > 0) { score += 1; }
    if (repo.readme.match(/(badge|shield|travis|codecov|npm)/i)) { score += 1; strengths.push('Project credibility badges in use'); }

    // Community (5pts)
    if (repo.forks > 10) { score += 2; strengths.push('Active community participation (forks)'); }
    else { score += 1; }
    const hasContributing = repo.directoryStructure.some(p => p.toLowerCase().includes('contributing'));
    if (hasContributing) { score += 2; strengths.push('Contribution guide present'); }
    else { improvements.push('Add CONTRIBUTING.md to encourage community participation'); }
    if (repo.openPRs > 0) { score += 1; }

    // User growth rate (5pts)
    if (repo.recentCommitCount > 20) { score += 3; strengths.push('Active recent development activity'); }
    else if (repo.recentCommitCount > 5) { score += 2; }
    else { score += 1; }
    if (repo.stars > 100) { score += 2; }

    // Retention signals (5pts)
    if (repo.openIssues > 10) { score += 3; strengths.push('Active user feedback'); }
    else if (repo.openIssues > 3) { score += 2; }
    else { score += 1; }
    if (repo.forks > 5) { score += 1; }

  } else {
    const desc = (input.description || '').toLowerCase();
    const growthKeywords = ['growth', 'revenue', 'marketing', 'viral', 'network', 'saas', 'subscription', 'freemium', 'retention', 'monetize', 'scale', 'traction'];
    const matched = growthKeywords.filter(k => desc.includes(k));
    score += Math.min(matched.length * 3 + 5, 25);
    if (matched.length > 0) strengths.push(`Growth-related keywords: ${matched.join(', ')}`);
    else improvements.push('Add growth strategy and revenue model to the description');
  }

  score = Math.min(score, 25);
  const percentage = (score / 25) * 100;
  const grade = percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 60 ? 'C' : percentage >= 40 ? 'D' : 'F';

  return { score, maxScore: 25, grade, analysis: `Growth potential analysis complete. Score: ${score}/25`, strengths, improvements };
}
