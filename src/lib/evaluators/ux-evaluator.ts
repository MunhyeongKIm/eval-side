import { EvaluationInput, ScoreResult } from '../types';
import { callAI } from '../ai-client';
import { UX_SYSTEM_PROMPT, buildInputContext } from '../ai-prompts';

export async function evaluateUX(input: EvaluationInput): Promise<ScoreResult> {
  const aiResult = await callAI({
    systemPrompt: UX_SYSTEM_PROMPT,
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

  return evaluateUXFallback(input);
}

function evaluateUXFallback(input: EvaluationInput): ScoreResult {
  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (input.type === 'github' && input.repoAnalysis) {
    const repo = input.repoAnalysis;

    // User flow (4pts)
    const hasDemo = repo.readme.match(/(demo|live|deploy|https?:\/\/[^\s]+\.(app|io|dev|com|net))/i);
    if (hasDemo) { score += 3; strengths.push('라이브 데모/배포 URL 존재'); }
    else { score += 1; improvements.push('라이브 데모 URL 추가 권장'); }
    if (repo.readme.match(/(screenshot|스크린샷|gif|preview|미리보기)/i)) { score += 1; strengths.push('스크린샷/미리보기 포함'); }

    // UI design (4pts)
    const uiDeps = ['react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'tailwindcss', 'styled-components', 'chakra', 'mui', 'antd'];
    const hasUI = uiDeps.some(d => Object.keys(repo.dependencies).some(k => k.includes(d)));
    if (hasUI) { score += 3; strengths.push('모던 UI 프레임워크 사용'); }
    else { score += 1; }
    if (Object.keys(repo.dependencies).some(k => k.includes('tailwind') || k.includes('css'))) { score += 1; }

    // Accessibility (4pts)
    if (repo.readme.match(/(i18n|국제화|다국어|localization)/i)) { score += 2; strengths.push('다국어 지원 고려'); }
    if (repo.readme.match(/(responsive|반응형|mobile)/i)) { score += 2; strengths.push('반응형 디자인 고려'); }
    else { improvements.push('반응형 디자인 언급 없음'); }

    // Onboarding (3pts)
    const installSteps = repo.readme.match(/(install|설치|getting started|시작하기|quick start)/i);
    if (installSteps) { score += 2; strengths.push('설치/시작 가이드 포함'); }
    else { improvements.push('시작 가이드(Getting Started) 추가 권장'); }
    if (repo.readme.length > 1000) { score += 1; }

  } else {
    const desc = (input.description || '').toLowerCase();
    const uxKeywords = ['ui', 'ux', '디자인', 'design', '사용자', '인터페이스', 'interface', '직관', 'intuitive', '모바일', 'mobile', '반응형', 'responsive'];
    const matched = uxKeywords.filter(k => desc.includes(k));
    score += Math.min(matched.length * 2 + 3, 15);
    if (matched.length > 0) strengths.push(`UX 관련 키워드: ${matched.join(', ')}`);
    else improvements.push('사용자 경험에 대한 고려를 설명에 추가');
  }

  score = Math.min(score, 15);
  const percentage = (score / 15) * 100;
  const grade = percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 60 ? 'C' : percentage >= 40 ? 'D' : 'F';

  return { score, maxScore: 15, grade, analysis: `UX 분석 완료. 점수: ${score}/15`, strengths, improvements };
}
