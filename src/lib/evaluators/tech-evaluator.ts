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
    const score = Math.min(Math.max(Math.round(aiResult.score), 0), 20);
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

    // 1. Tech stack (5pts)
    if (repo.language) {
      score += 3;
      details.push(`주요 언어: ${repo.language}`);
    }
    const depCount = Object.keys(repo.dependencies).length;
    if (depCount > 0 && depCount < 50) {
      score += 2;
      strengths.push(`적절한 의존성 관리 (${depCount}개 패키지)`);
    } else if (depCount >= 50) {
      score += 1;
      improvements.push(`의존성이 많음 (${depCount}개) - 정리 필요`);
    } else {
      improvements.push('의존성 파일이 발견되지 않음');
    }

    // 2. Architecture (5pts)
    const dirDepth = repo.directoryStructure.filter(p => p.includes('/')).length;
    if (dirDepth > 10) {
      score += 3;
      strengths.push('잘 구조화된 디렉토리 구성');
    } else if (dirDepth > 3) {
      score += 2;
    } else {
      score += 1;
      improvements.push('디렉토리 구조가 단순함 - 모듈화 고려');
    }
    const hasSrcDir = repo.directoryStructure.some(p => p.startsWith('src/'));
    if (hasSrcDir) { score += 2; strengths.push('src/ 디렉토리로 소스 코드 분리'); }

    // 3. Code quality (5pts)
    if (repo.hasTests) {
      score += 3;
      strengths.push('테스트 코드 존재');
    } else {
      improvements.push('테스트 코드 미발견 - 테스트 추가 권장');
    }
    if (repo.readme.length > 500) {
      score += 2;
      strengths.push('상세한 README 문서');
    } else if (repo.readme.length > 100) {
      score += 1;
      improvements.push('README를 더 상세하게 작성 권장');
    } else {
      improvements.push('README가 부실함');
    }

    // 4. Scalability (5pts)
    if (repo.hasCICD) {
      score += 3;
      strengths.push('CI/CD 파이프라인 구성됨');
    } else {
      improvements.push('CI/CD 미설정 - GitHub Actions 추가 권장');
    }
    if (repo.forks > 5) { score += 1; }
    if (repo.stars > 10) { score += 1; }

  } else {
    // Concept evaluation
    const desc = input.description || '';
    if (desc.length > 200) { score += 5; strengths.push('상세한 프로젝트 설명'); }
    else if (desc.length > 50) { score += 3; }
    else { score += 1; improvements.push('프로젝트 설명을 더 구체적으로 작성'); }

    const techKeywords = ['api', 'database', 'react', 'node', 'python', 'typescript', 'docker', 'kubernetes', 'aws', 'gcp', 'firebase', 'postgresql', 'mongodb', 'redis', 'graphql', 'rest', 'microservice'];
    const mentionedTech = techKeywords.filter(k => desc.toLowerCase().includes(k));
    if (mentionedTech.length >= 3) {
      score += 8;
      strengths.push(`구체적 기술 스택 언급: ${mentionedTech.join(', ')}`);
    } else if (mentionedTech.length >= 1) {
      score += 5;
    } else {
      score += 2;
      improvements.push('사용할 기술 스택을 명시적으로 언급');
    }

    score += 5; // Base score for having a concept
  }

  score = Math.min(score, 20);

  const percentage = (score / 20) * 100;
  const grade = percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 60 ? 'C' : percentage >= 40 ? 'D' : 'F';

  return {
    score,
    maxScore: 20,
    grade,
    analysis: details.length > 0 ? details.join('\n') : '텍스트 기반 개념 분석이 수행되었습니다.',
    strengths,
    improvements,
  };
}
