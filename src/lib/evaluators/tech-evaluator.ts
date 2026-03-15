import { EvaluationInput, ScoreResult } from '../types';
import { callAI } from '../ai-client';
import { TECH_SYSTEM_PROMPT, buildInputContext } from '../ai-prompts';

export async function evaluateTech(input: EvaluationInput): Promise<ScoreResult> {
  const aiResult = await callAI({
    systemPrompt: TECH_SYSTEM_PROMPT,
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

  return evaluateTechFallback(input);
}

function evaluateTechFallback(input: EvaluationInput): ScoreResult {
  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];
  const details: string[] = [];

  if (input.type === 'github' && input.repoAnalysis) {
    const repo = input.repoAnalysis;

    // 1. Tech Stack (5pts)
    if (repo.language) {
      score += 2;
      details.push(`Primary language: ${repo.language}`);
    }
    const depCount = Object.keys(repo.dependencies).length;
    if (depCount > 0 && depCount < 50) {
      score += 1;
      strengths.push(`Well-managed dependencies (${depCount} packages)`);
    } else if (depCount >= 50) {
      improvements.push(`High number of dependencies (${depCount}) - consider pruning`);
    } else {
      improvements.push('No dependency file detected');
    }
    if (repo.hasTypeScript) { score += 2; strengths.push('TypeScript in use'); }

    // 2. Code Quality (5pts)
    if (repo.hasTests) {
      score += 2;
      strengths.push('Test code present');
    } else {
      improvements.push('No test code found - adding tests is recommended');
    }
    if (repo.hasLinting) { score += 1; strengths.push('Linting configuration present'); }
    if (repo.hasCICD) { score += 1; strengths.push('CI/CD pipeline configured'); }
    // strict mode evidence: TypeScript already checked above, award 1pt if ts + linting
    if (repo.hasTypeScript && repo.hasLinting) { score += 1; strengths.push('Strict mode evidence (TypeScript + linting)'); }

    // 3. Architecture (5pts)
    const hasSrcDir = repo.directoryStructure.some(p => p.startsWith('src/'));
    if (hasSrcDir) { score += 2; strengths.push('Source code separated under src/ directory'); }
    else { improvements.push('Consider organizing code under a src/ directory'); }
    const fileCount = repo.directoryStructure.length;
    if (fileCount > 5) { score += 1; strengths.push('Clear file organization'); }
    if (fileCount > 10 && fileCount < 500) { score += 2; }
    else if (fileCount > 0) { score += 1; }

    // 4. Documentation (5pts)
    if (repo.readme.length > 1000) { score += 3; strengths.push('Comprehensive README documentation'); }
    else if (repo.readme.length > 500) { score += 2; strengths.push('Detailed README documentation'); }
    else if (repo.readme.length > 100) {
      score += 1;
      improvements.push('Consider writing a more detailed README');
    } else {
      improvements.push('README is insufficient');
    }
    if (repo.readme.match(/^#{1,3}\s/m)) { score += 1; strengths.push('README has section headers'); }
    if (repo.readme.match(/(install|getting started|quick start)/i)) { score += 1; strengths.push('Install guide present'); }

  } else {
    // Concept evaluation
    const desc = input.description || '';
    if (desc.length > 200) { score += 5; strengths.push('Detailed project description'); }
    else if (desc.length > 100) { score += 3; }
    else if (desc.length > 50) { score += 2; }
    else { score += 1; improvements.push('Write a more specific project description'); }

    const techKeywords = ['api', 'database', 'react', 'node', 'python', 'typescript', 'docker', 'kubernetes', 'aws', 'gcp', 'firebase', 'postgresql', 'mongodb', 'redis', 'graphql', 'rest', 'microservice'];
    const mentionedTech = techKeywords.filter(k => desc.toLowerCase().includes(k));
    if (mentionedTech.length >= 3) {
      score += 8;
      strengths.push(`Specific tech stack mentioned: ${mentionedTech.join(', ')}`);
    } else if (mentionedTech.length >= 1) {
      score += 5;
    } else {
      score += 2;
      improvements.push('Explicitly mention the tech stack you plan to use');
    }

    // Detail level bonus
    if (desc.length > 300 && mentionedTech.length >= 2) { score += 3; }
    else { score += 2; }
  }

  score = Math.min(score, 20);

  const percentage = (score / 20) * 100;
  const grade = percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 60 ? 'C' : percentage >= 40 ? 'D' : 'F';

  return {
    score,
    maxScore: 20,
    grade,
    analysis: details.length > 0 ? details.join('\n') : 'Text-based concept analysis was performed.',
    strengths,
    improvements,
  };
}
