import { EvaluationInput, ScoreResult } from '../types';
import { callAI } from '../ai-client';
import { MARKET_SYSTEM_PROMPT, buildInputContext } from '../ai-prompts';

export async function evaluateMarket(input: EvaluationInput): Promise<ScoreResult> {
  const aiResult = await callAI({
    systemPrompt: MARKET_SYSTEM_PROMPT,
    userPrompt: buildInputContext(input),
    maxScore: 20,
  });

  if (aiResult) {
    let score = Math.round(aiResult.score);
    if (aiResult.subscores) {
      const subTotal = Object.values(aiResult.subscores).reduce((a, b) => a + b, 0);
      score = Math.round(subTotal);
    }
    score = Math.min(Math.max(score, 0), 20);
    const percentage = (score / 20) * 100;
    const grade = percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 60 ? 'C' : percentage >= 40 ? 'D' : 'F';
    return {
      score,
      maxScore: 20,
      grade,
      analysis: aiResult.analysis,
      strengths: aiResult.strengths,
      improvements: aiResult.improvements,
    };
  }

  return evaluateMarketFallback(input);
}

function evaluateMarketFallback(input: EvaluationInput): ScoreResult {
  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (input.type === 'github' && input.repoAnalysis) {
    const repo = input.repoAnalysis;

    // Problem Definition (5pts)
    if (repo.description && repo.description.length > 30) { score += 2; }
    const hasUniqueValue = repo.readme.toLowerCase().match(/(unique|novel|first|unlike|better than|alternative|innovation|revolutionary)/);
    if (hasUniqueValue) { score += 3; strengths.push('Differentiating value proposition stated in README'); }
    else { improvements.push('State a clear differentiating value proposition in your README'); }

    // Competitive Differentiation (5pts)
    if (repo.topics.length > 3) {
      score += 2;
      strengths.push(`Clear categorization (${repo.topics.join(', ')})`);
    } else if (repo.topics.length > 0) { score += 1; }
    else { improvements.push('Add topics/tags to improve discoverability'); }
    if (hasUniqueValue) { score += 3; }
    else { score += 1; }

    // Traction (5pts)
    if (repo.stars > 100) { score += 5; strengths.push(`High interest level (${repo.stars} stars)`); }
    else if (repo.stars > 50) { score += 4; strengths.push(`Strong interest (${repo.stars} stars)`); }
    else if (repo.stars > 20) { score += 3; strengths.push(`Growing interest (${repo.stars} stars)`); }
    else if (repo.stars > 5) { score += 2; }
    else if (repo.stars > 0) { score += 1; }
    else { improvements.push('Low star count - a promotion strategy is needed'); }

    // Market Size & Timing (5pts)
    score += 3; // Fallback: mid-range market size estimate
    if (repo.recentCommitCount > 20) { score += 2; strengths.push('Active development activity'); }
    else if (repo.recentCommitCount > 5) { score += 1; }

  } else {
    const desc = (input.description || '').toLowerCase();
    const marketKeywords = ['market', 'user', 'customer', 'revenue', 'b2b', 'b2c', 'saas', 'subscription', 'target', 'audience', 'segment', 'demand'];
    const matched = marketKeywords.filter(k => desc.includes(k));
    if (matched.length >= 3) { score += 10; strengths.push('Rich market-related terminology present'); }
    else if (matched.length >= 1) { score += 6; }
    else { score += 2; improvements.push('Specify the target market and user base clearly'); }

    const problemKeywords = ['problem', 'solve', 'pain point', 'challenge', 'issue', 'solution', 'need'];
    if (problemKeywords.some(k => desc.includes(k))) {
      score += 8;
      strengths.push('Problem to be solved is clearly defined');
    } else {
      score += 2;
      improvements.push('Specify what problem this project solves');
    }
  }

  score = Math.min(score, 20);
  const percentage = (score / 20) * 100;
  const grade = percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 60 ? 'C' : percentage >= 40 ? 'D' : 'F';

  return {
    score,
    maxScore: 20,
    grade,
    analysis: `Market analysis complete. Score: ${score}/20`,
    strengths,
    improvements,
  };
}
