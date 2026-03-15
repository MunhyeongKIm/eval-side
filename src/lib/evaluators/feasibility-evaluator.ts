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

  return evaluateFeasibilityFallback(input);
}

function evaluateFeasibilityFallback(input: EvaluationInput): ScoreResult {
  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (input.type === 'github' && input.repoAnalysis) {
    const repo = input.repoAnalysis;

    // Development Complexity (5pts)
    const fileCount = repo.directoryStructure.length;
    if (fileCount > 10 && fileCount < 500) { score += 3; strengths.push(`Manageable codebase size (${fileCount} files)`); }
    else if (fileCount <= 10) { score += 2; strengths.push('Small-scale project - rapid development possible'); }
    else { score += 1; improvements.push(`Large codebase (${fileCount} files) - high maintenance burden`); }
    const depCount = Object.keys(repo.dependencies).length;
    if (depCount < 20) { score += 1; } else { improvements.push('High dependency complexity'); }
    if (repo.license) { score += 1; strengths.push(`Open source license: ${repo.license}`); }

    // Maintainability (5pts)
    if (repo.hasTests) { score += 1; strengths.push('Test code present'); }
    if (repo.hasCICD) { score += 1; strengths.push('CI/CD pipeline configured'); }
    if (repo.hasLinting) { score += 1; strengths.push('Linting configuration present'); }
    const hasSrcDir = repo.directoryStructure.some(p => p.startsWith('src/'));
    if (hasSrcDir) { score += 1; strengths.push('Source code separated under src/ directory'); }
    if (repo.readme.length > 300) { score += 1; }

    // Deployment Readiness (5pts)
    if (repo.hasCICD) { score += 2; }
    const hasDocker = repo.directoryStructure.some(p => p.toLowerCase().includes('dockerfile') || p.toLowerCase().includes('docker-compose'));
    if (hasDocker) { score += 1; strengths.push('Containerization configuration present'); }
    const hasEnvConfig = repo.directoryStructure.some(p => p.toLowerCase().includes('.env') || p.toLowerCase().includes('config'));
    if (hasEnvConfig) { score += 1; strengths.push('Environment configuration present'); }
    // package.json scripts check via dependencies presence
    if (Object.keys(repo.dependencies).length > 0) { score += 1; strengths.push('Package manager scripts available'); }

  } else {
    const desc = (input.description || '').toLowerCase();
    const feasKeywords = ['mvp', 'prototype', 'simple', 'fast', 'lean', 'solo', 'lightweight', 'minimal'];
    const complexKeywords = ['blockchain', 'ai', 'ml', 'machine learning', 'distributed', 'real-time', 'microservices'];

    if (feasKeywords.some(k => desc.includes(k))) { score += 7; strengths.push('Feasible scope established'); }
    else { score += 4; }
    if (complexKeywords.some(k => desc.includes(k))) { improvements.push('High technical complexity area - phased approach recommended'); }
    else { score += 5; }
    score = Math.min(score, 15);
  }

  score = Math.min(score, 15);
  const percentage = (score / 15) * 100;
  const grade = percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 60 ? 'C' : percentage >= 40 ? 'D' : 'F';

  return { score, maxScore: 15, grade, analysis: `Feasibility analysis complete. Score: ${score}/15`, strengths, improvements };
}
