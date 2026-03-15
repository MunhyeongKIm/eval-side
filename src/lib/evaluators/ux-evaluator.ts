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

  return evaluateUXFallback(input);
}

function evaluateUXFallback(input: EvaluationInput): ScoreResult {
  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (input.type === 'github' && input.repoAnalysis) {
    const repo = input.repoAnalysis;

    // User Flow (5pts)
    const hasDemo = repo.readme.match(/(demo|live|deploy|https?:\/\/[^\s]+\.(app|io|dev|com|net))/i);
    if (hasDemo) { score += 2; strengths.push('Live demo/deployment URL present'); }
    else { improvements.push('Adding a live demo URL is recommended'); }
    if (repo.readme.match(/(screenshot|gif|preview)/i)) { score += 1; strengths.push('Screenshots/preview included'); }
    const installSteps = repo.readme.match(/(install|getting started|quick start)/i);
    if (installSteps) { score += 1; strengths.push('Installation/getting started guide included'); }
    if (hasDemo && installSteps) { score += 1; strengths.push('Clear value delivery path'); }

    // UI Design System (5pts)
    const uiDeps = ['react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'tailwindcss', 'styled-components', 'chakra', 'mui', 'antd'];
    const hasUI = uiDeps.some(d => Object.keys(repo.dependencies).some(k => k.includes(d)));
    if (hasUI) { score += 3; strengths.push('Modern UI framework in use'); }
    else { score += 1; }
    if (Object.keys(repo.dependencies).some(k => k.includes('tailwind') || k.includes('css'))) { score += 1; strengths.push('CSS tooling present'); }
    if (repo.readme.length > 1000) { score += 1; }

    // Accessibility & Polish (5pts)
    if (repo.readme.match(/viewport|responsive/i)) { score += 2; strengths.push('Responsive design mentioned'); }
    if (repo.readme.match(/(error|exception|catch|handle)/i)) { score += 1; strengths.push('Error handling patterns documented'); }
    if (repo.readme.match(/(loading|spinner|skeleton)/i)) { score += 1; strengths.push('Loading states mentioned'); }
    if (repo.readme.match(/(<[a-z]+|aria-|role=|semantic)/i)) { score += 1; strengths.push('Semantic HTML/accessibility evidence'); }

  } else {
    const desc = (input.description || '').toLowerCase();
    const uxKeywords = ['ui', 'ux', 'design', 'interface', 'intuitive', 'mobile', 'responsive', 'accessibility', 'onboarding', 'usability'];
    const matched = uxKeywords.filter(k => desc.includes(k));
    score += Math.min(matched.length * 2 + 3, 15);
    if (matched.length > 0) strengths.push(`UX-related keywords: ${matched.join(', ')}`);
    else improvements.push('Add consideration for user experience in the description');
  }

  score = Math.min(score, 15);
  const percentage = (score / 15) * 100;
  const grade = percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 60 ? 'C' : percentage >= 40 ? 'D' : 'F';

  return { score, maxScore: 15, grade, analysis: `UX analysis complete. Score: ${score}/15`, strengths, improvements };
}
