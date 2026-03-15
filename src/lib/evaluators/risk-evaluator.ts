import { EvaluationInput, ScoreResult } from '../types';

export function evaluateRisk(input: EvaluationInput): ScoreResult {
  let score = 15; // Start from max and deduct for risks
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (input.type === 'github' && input.repoAnalysis) {
    const repo = input.repoAnalysis;

    // Tech risk (4pts deductible)
    if (!repo.hasTests) { score -= 2; improvements.push('테스트 부재 - 품질 리스크'); }
    if (!repo.hasCICD) { score -= 1; improvements.push('CI/CD 미설정 - 배포 리스크'); }
    if (Object.keys(repo.dependencies).length > 50) { score -= 1; improvements.push('과도한 의존성 - 보안/유지보수 리스크'); }
    else { strengths.push('의존성 규모 적정'); }

    // Legal risk (4pts deductible)
    if (!repo.license) { score -= 3; improvements.push('라이선스 미명시 - 법적 리스크 높음'); }
    else { strengths.push(`라이선스 명시됨: ${repo.license}`); }

    // Market risk (4pts deductible)
    const daysSinceUpdate = repo.updatedAt ? (Date.now() - new Date(repo.updatedAt).getTime()) / (1000 * 60 * 60 * 24) : 999;
    if (daysSinceUpdate > 180) { score -= 2; improvements.push('6개월 이상 업데이트 없음 - 프로젝트 중단 리스크'); }
    if (repo.recentCommitCount < 3) { score -= 1; improvements.push('최근 커밋 활동 저조'); }
    else { strengths.push('활발한 개발 활동'); }

    // Dependency risk (3pts deductible)
    if (repo.forks < 2 && repo.stars < 5) { score -= 1; improvements.push('커뮤니티 지원 부족 - 키 퍼슨 리스크'); }
    else { strengths.push('커뮤니티 기반 존재'); }

  } else {
    const desc = (input.description || '').toLowerCase();
    const riskKeywords = ['개인정보', 'privacy', '보안', 'security', '결제', 'payment', '의료', 'health', '금융', 'finance', 'legal'];
    const risksFound = riskKeywords.filter(k => desc.includes(k));
    if (risksFound.length > 0) {
      score -= risksFound.length * 2;
      improvements.push(`고위험 영역 포함: ${risksFound.join(', ')} - 규제 준수 필요`);
    }
    if (desc.length < 50) { score -= 3; improvements.push('설명이 부족하여 리스크 평가 어려움'); }
  }

  score = Math.max(Math.min(score, 15), 0);
  const percentage = (score / 15) * 100;
  const grade = percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 60 ? 'C' : percentage >= 40 ? 'D' : 'F';

  return { score, maxScore: 15, grade, analysis: `리스크 분석 완료. 점수: ${score}/15 (높을수록 리스크 낮음)`, strengths, improvements };
}
