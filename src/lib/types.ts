export interface RepoAnalysis {
  name: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  license: string | null;
  readme: string;
  hasTests: boolean;
  hasCICD: boolean;
  directoryStructure: string[];
  dependencies: Record<string, string>;
  recentCommitCount: number;
  openIssues: number;
  openPRs: number;
  lastCommitDate: string | null;
  createdAt: string;
  updatedAt: string;
  // AI 분석 강화 필드
  languages?: Record<string, number>;
  hasTypeScript?: boolean;
  hasLinting?: boolean;
  commitFrequency?: 'daily' | 'weekly' | 'monthly' | 'inactive';
}

export interface EvaluationInput {
  type: 'concept' | 'github';
  name: string;
  description?: string;
  githubUrl?: string;
  repoAnalysis?: RepoAnalysis;
}

export interface ScoreResult {
  score: number;
  maxScore: number;
  grade: string;
  analysis: string;
  strengths: string[];
  improvements: string[];
}

export interface EvaluationReport {
  totalScore: number;
  verdict: 'PASS' | 'CONDITIONAL_PASS' | 'NEEDS_WORK' | 'FAIL';
  summary: string;
  tech: ScoreResult;
  market: ScoreResult;
  ux: ScoreResult;
  feasibility: ScoreResult;
  growth: ScoreResult;
  risk: ScoreResult;
  topImprovements: string[];
}
