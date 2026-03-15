import { EvaluationReport } from './types';

export function generateMarkdownReport(name: string, report: EvaluationReport): string {
  const date = new Date().toISOString().split('T')[0];

  return `# 사이드 프로젝트 평가 리포트

**프로젝트**: ${name}
**평가일**: ${date}

---

## 종합 점수: ${report.totalScore} / 100

| 영역 | 점수 | 등급 |
|------|------|------|
| 기술 완성도 | ${report.tech.score}/${report.tech.maxScore} | ${report.tech.grade} |
| 시장 적합성 | ${report.market.score}/${report.market.maxScore} | ${report.market.grade} |
| 사용자 경험 | ${report.ux.score}/${report.ux.maxScore} | ${report.ux.grade} |
| 실현 가능성 | ${report.feasibility.score}/${report.feasibility.maxScore} | ${report.feasibility.grade} |
| 성장 잠재력 | ${report.growth.score}/${report.growth.maxScore} | ${report.growth.grade} |
| 리스크 관리 | ${report.risk.score}/${report.risk.maxScore} | ${report.risk.grade} |

---

## Executive Summary
${report.summary}

---

## 기술 분석
${report.tech.analysis}
**강점**: ${report.tech.strengths.join(', ') || '-'}
**개선점**: ${report.tech.improvements.join(', ') || '-'}

## 시장 분석
${report.market.analysis}
**강점**: ${report.market.strengths.join(', ') || '-'}
**개선점**: ${report.market.improvements.join(', ') || '-'}

## UX 분석
${report.ux.analysis}
**강점**: ${report.ux.strengths.join(', ') || '-'}
**개선점**: ${report.ux.improvements.join(', ') || '-'}

## 실현성 분석
${report.feasibility.analysis}
**강점**: ${report.feasibility.strengths.join(', ') || '-'}
**개선점**: ${report.feasibility.improvements.join(', ') || '-'}

## 성장 전략
${report.growth.analysis}
**강점**: ${report.growth.strengths.join(', ') || '-'}
**개선점**: ${report.growth.improvements.join(', ') || '-'}

## 리스크 평가
${report.risk.analysis}
**강점**: ${report.risk.strengths.join(', ') || '-'}
**개선점**: ${report.risk.improvements.join(', ') || '-'}

---

## Top 3 개선 제안
${report.topImprovements.map((imp, i) => `${i + 1}. ${imp}`).join('\n')}

## 최종 판정: **${report.verdict}**
`;
}
