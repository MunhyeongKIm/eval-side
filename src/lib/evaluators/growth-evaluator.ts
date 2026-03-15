import { EvaluationInput, ScoreResult } from '../types';
import { callAI } from '../ai-client';
import { GROWTH_SYSTEM_PROMPT, buildInputContext } from '../ai-prompts';

export async function evaluateGrowth(input: EvaluationInput): Promise<ScoreResult> {
  const aiResult = await callAI({
    systemPrompt: GROWTH_SYSTEM_PROMPT,
    userPrompt: buildInputContext(input),
    maxScore: 15,
  });

  if (aiResult) {
    const score = Math.min(Math.max(Math.round(aiResult.score), 0), 15);
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

  return evaluateGrowthFallback(input);
}

function evaluateGrowthFallback(input: EvaluationInput): ScoreResult {
  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (input.type === 'github' && input.repoAnalysis) {
    const repo = input.repoAnalysis;

    // Revenue model (5pts)
    const revenueKeywords = ['pricing', 'subscription', 'premium', 'pro', 'enterprise', 'free tier', '요금', '구독', '유료'];
    if (revenueKeywords.some(k => repo.readme.toLowerCase().includes(k))) {
      score += 4;
      strengths.push('수익 모델이 README에 언급됨');
    } else {
      score += 1;
      improvements.push('수익화 전략을 명시');
    }

    // Marketing (5pts)
    if (repo.stars > 50) { score += 3; strengths.push('오가닉 성장 신호 (stars)'); }
    else if (repo.stars > 10) { score += 2; }
    else { score += 1; improvements.push('프로젝트 홍보 활동 필요'); }

    if (repo.topics.length > 0) { score += 1; }
    if (repo.readme.match(/(badge|shield|travis|codecov|npm)/i)) { score += 1; strengths.push('프로젝트 신뢰도 뱃지 사용'); }

    // Growth levers (5pts)
    if (repo.forks > 10) { score += 2; strengths.push('커뮤니티 참여 활발 (forks)'); }
    else { score += 1; }
    const hasContributing = repo.directoryStructure.some(p => p.toLowerCase().includes('contributing'));
    if (hasContributing) { score += 2; strengths.push('기여 가이드 존재'); }
    else { improvements.push('CONTRIBUTING.md 추가로 커뮤니티 참여 유도'); }
    if (repo.openPRs > 0) { score += 1; }

  } else {
    const desc = (input.description || '').toLowerCase();
    const growthKeywords = ['성장', 'growth', '수익', 'revenue', '마케팅', 'marketing', '바이럴', 'viral', '네트워크', 'network', 'saas', '구독', 'freemium'];
    const matched = growthKeywords.filter(k => desc.includes(k));
    score += Math.min(matched.length * 3 + 3, 15);
    if (matched.length > 0) strengths.push(`성장 관련 키워드: ${matched.join(', ')}`);
    else improvements.push('성장 전략과 수익 모델을 설명에 추가');
  }

  score = Math.min(score, 15);
  const percentage = (score / 15) * 100;
  const grade = percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 60 ? 'C' : percentage >= 40 ? 'D' : 'F';

  return { score, maxScore: 15, grade, analysis: `성장 잠재력 분석 완료. 점수: ${score}/15`, strengths, improvements };
}
