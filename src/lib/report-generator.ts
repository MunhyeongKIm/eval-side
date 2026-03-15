import { EvaluationReport } from './types';

export function generateMarkdownReport(name: string, report: EvaluationReport): string {
  const date = new Date().toISOString().split('T')[0];

  return `# Side Project Evaluation Report

**Project**: ${name}
**Evaluation Date**: ${date}

---

## Overall Score: ${report.totalScore} / 100

| Area | Score | Grade |
|------|-------|-------|
| Technical Completeness | ${report.tech.score}/${report.tech.maxScore} | ${report.tech.grade} |
| Market Fit | ${report.market.score}/${report.market.maxScore} | ${report.market.grade} |
| User Experience | ${report.ux.score}/${report.ux.maxScore} | ${report.ux.grade} |
| Feasibility | ${report.feasibility.score}/${report.feasibility.maxScore} | ${report.feasibility.grade} |
| Growth Potential | ${report.growth.score}/${report.growth.maxScore} | ${report.growth.grade} |
| Risk Management | ${report.risk.score}/${report.risk.maxScore} | ${report.risk.grade} |

---

## Executive Summary
${report.summary}

---

## Technical Analysis
${report.tech.analysis}
**Strengths**: ${report.tech.strengths.join(', ') || '-'}
**Improvements**: ${report.tech.improvements.join(', ') || '-'}

## Market Analysis
${report.market.analysis}
**Strengths**: ${report.market.strengths.join(', ') || '-'}
**Improvements**: ${report.market.improvements.join(', ') || '-'}

## UX Analysis
${report.ux.analysis}
**Strengths**: ${report.ux.strengths.join(', ') || '-'}
**Improvements**: ${report.ux.improvements.join(', ') || '-'}

## Feasibility Analysis
${report.feasibility.analysis}
**Strengths**: ${report.feasibility.strengths.join(', ') || '-'}
**Improvements**: ${report.feasibility.improvements.join(', ') || '-'}

## Growth Strategy
${report.growth.analysis}
**Strengths**: ${report.growth.strengths.join(', ') || '-'}
**Improvements**: ${report.growth.improvements.join(', ') || '-'}

## Risk Assessment
${report.risk.analysis}
**Strengths**: ${report.risk.strengths.join(', ') || '-'}
**Improvements**: ${report.risk.improvements.join(', ') || '-'}

---

## Top 3 Improvement Recommendations
${report.topImprovements.map((imp, i) => `${i + 1}. ${imp}`).join('\n')}

## Final Verdict: **${report.verdict}**
`;
}
