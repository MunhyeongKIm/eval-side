import { EvaluationInput, ScoreResult } from '../types';
import { callAI } from '../ai-client';
import { FEASIBILITY_SYSTEM_PROMPT, buildInputContext } from '../ai-prompts';

export async function evaluateFeasibility(input: EvaluationInput): Promise<ScoreResult> {
  const aiResult = await callAI({
    systemPrompt: FEASIBILITY_SYSTEM_PROMPT,
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

  return evaluateFeasibilityFallback(input);
}

function evaluateFeasibilityFallback(input: EvaluationInput): ScoreResult {
  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (input.type === 'github' && input.repoAnalysis) {
    const repo = input.repoAnalysis;

    // Dev difficulty (4pts)
    const fileCount = repo.directoryStructure.length;
    if (fileCount > 10 && fileCount < 500) { score += 3; strengths.push(`관리 가능한 코드 규모 (${fileCount} 파일)`); }
    else if (fileCount <= 10) { score += 2; strengths.push('소규모 프로젝트 - 빠른 개발 가능'); }
    else { score += 1; improvements.push(`대규모 코드베이스 (${fileCount} 파일) - 유지보수 부담`); }

    const depCount = Object.keys(repo.dependencies).length;
    if (depCount < 20) { score += 1; } else { improvements.push('의존성 복잡도 높음'); }

    // Resources (4pts)
    if (repo.license) { score += 2; strengths.push(`오픈소스 라이선스: ${repo.license}`); }
    else { improvements.push('라이선스 명시 필요'); }
    score += 2; // Base: individual developer can work on it

    // Timeline (4pts)
    if (repo.recentCommitCount > 10) { score += 3; strengths.push('활발한 커밋 활동 - 적극적 개발 중'); }
    else if (repo.recentCommitCount > 3) { score += 2; }
    else { score += 1; improvements.push('최근 커밋 활동이 저조함'); }
    if (repo.lastCommitDate) {
      const daysSinceCommit = (Date.now() - new Date(repo.lastCommitDate).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCommit < 30) { score += 1; }
    }

    // Maintainability (3pts)
    if (repo.hasCICD) { score += 1; }
    if (repo.hasTests) { score += 1; }
    if (repo.readme.length > 300) { score += 1; }

  } else {
    const desc = (input.description || '').toLowerCase();
    const feasKeywords = ['mvp', '프로토타입', 'prototype', '간단', 'simple', '빠르게', 'fast', 'lean', '1인', 'solo'];
    const complexKeywords = ['블록체인', 'blockchain', 'ai', 'ml', '머신러닝', 'machine learning', '분산', 'distributed'];

    if (feasKeywords.some(k => desc.includes(k))) { score += 8; strengths.push('실현 가능한 범위 설정'); }
    if (complexKeywords.some(k => desc.includes(k))) { improvements.push('기술적 복잡도가 높은 영역 - 단계적 접근 권장'); }
    else { score += 4; }
    score += 3;
  }

  score = Math.min(score, 15);
  const percentage = (score / 15) * 100;
  const grade = percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 60 ? 'C' : percentage >= 40 ? 'D' : 'F';

  return { score, maxScore: 15, grade, analysis: `실현성 분석 완료. 점수: ${score}/15`, strengths, improvements };
}
