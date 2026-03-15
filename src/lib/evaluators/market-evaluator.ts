import { EvaluationInput, ScoreResult } from '../types';

export function evaluateMarket(input: EvaluationInput): ScoreResult {
  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (input.type === 'github' && input.repoAnalysis) {
    const repo = input.repoAnalysis;

    // Market size indicators (5pts)
    if (repo.stars > 100) { score += 5; strengths.push(`높은 관심도 (${repo.stars} stars)`); }
    else if (repo.stars > 20) { score += 3; strengths.push(`성장 중인 관심도 (${repo.stars} stars)`); }
    else if (repo.stars > 0) { score += 1; }
    else { improvements.push('스타 수가 적음 - 홍보 전략 필요'); }

    // Competition & differentiation (5pts)
    if (repo.topics.length > 3) {
      score += 3;
      strengths.push(`명확한 카테고리화 (${repo.topics.join(', ')})`);
    } else if (repo.topics.length > 0) { score += 1; }
    else { improvements.push('토픽/태그 추가로 검색성 향상'); }

    const hasUniqueValue = repo.readme.toLowerCase().match(/(unique|novel|first|unlike|better than|대체|혁신|최초)/);
    if (hasUniqueValue) { score += 2; strengths.push('차별화 포인트가 README에 명시됨'); }

    // PMF indicators (5pts)
    if (repo.forks > 20) { score += 3; strengths.push(`활발한 포크 활동 (${repo.forks})`); }
    else if (repo.forks > 5) { score += 2; }
    else { score += 1; }

    if (repo.openIssues > 5) { score += 2; strengths.push('활발한 이슈 활동 - 사용자 피드백 존재'); }

    // Traction (5pts)
    if (repo.recentCommitCount > 20) { score += 3; strengths.push('활발한 개발 활동'); }
    else if (repo.recentCommitCount > 5) { score += 2; }
    if (repo.forks > 10) { score += 2; }

  } else {
    const desc = (input.description || '').toLowerCase();
    const marketKeywords = ['시장', 'market', '사용자', 'user', '고객', 'customer', '수익', 'revenue', 'b2b', 'b2c', 'saas', '구독', 'subscription', '타겟', 'target'];
    const matched = marketKeywords.filter(k => desc.includes(k));
    if (matched.length >= 3) { score += 10; strengths.push('시장 관련 용어가 풍부함'); }
    else if (matched.length >= 1) { score += 5; }
    else { score += 2; improvements.push('타겟 시장과 사용자층을 구체적으로 명시'); }

    const problemKeywords = ['문제', 'problem', '불편', '해결', 'solve', 'pain point'];
    if (problemKeywords.some(k => desc.includes(k))) {
      score += 5;
      strengths.push('해결하려는 문제가 명확함');
    } else {
      improvements.push('어떤 문제를 해결하는지 명시');
    }

    score += 5;
  }

  score = Math.min(score, 20);
  const percentage = (score / 20) * 100;
  const grade = percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 60 ? 'C' : percentage >= 40 ? 'D' : 'F';

  return {
    score,
    maxScore: 20,
    grade,
    analysis: `시장성 분석 완료. 점수: ${score}/20`,
    strengths,
    improvements,
  };
}
