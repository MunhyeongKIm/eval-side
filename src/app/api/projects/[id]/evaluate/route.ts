import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeRepo } from '@/lib/github-analyzer';
import { evaluateProject } from '@/lib/evaluator';
import { EvaluationInput } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  try {
    await prisma.project.update({
      where: { id },
      data: { status: 'evaluating' },
    });

    // Build evaluation input
    const evalInput: EvaluationInput = {
      type: project.type as 'concept' | 'github',
      name: project.name,
      description: project.description || undefined,
      githubUrl: project.githubUrl || undefined,
    };

    // If GitHub project, analyze the repo
    if (project.type === 'github' && project.githubUrl) {
      try {
        evalInput.repoAnalysis = await analyzeRepo(project.githubUrl);
      } catch (err) {
        console.error('GitHub analysis failed:', err);
        // Fall back to concept evaluation
        evalInput.type = 'concept';
      }
    }

    // Run evaluation with 55s timeout (Vercel 60s limit)
    const report = await Promise.race([
      evaluateProject(evalInput),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Evaluation timeout: exceeded 55 seconds')), 55000)
      ),
    ]);

    // Save results
    await prisma.evaluation.upsert({
      where: { projectId: id },
      create: {
        projectId: id,
        totalScore: report.totalScore,
        verdict: report.verdict,
        summary: report.summary,
        techScore: report.tech.score,
        techAnalysis: `${report.tech.analysis}\n\n강점: ${report.tech.strengths.join(', ')}\n개선점: ${report.tech.improvements.join(', ')}`,
        marketScore: report.market.score,
        marketAnalysis: `${report.market.analysis}\n\n강점: ${report.market.strengths.join(', ')}\n개선점: ${report.market.improvements.join(', ')}`,
        uxScore: report.ux.score,
        uxAnalysis: `${report.ux.analysis}\n\n강점: ${report.ux.strengths.join(', ')}\n개선점: ${report.ux.improvements.join(', ')}`,
        feasibilityScore: report.feasibility.score,
        feasibilityAnalysis: `${report.feasibility.analysis}\n\n강점: ${report.feasibility.strengths.join(', ')}\n개선점: ${report.feasibility.improvements.join(', ')}`,
        growthScore: report.growth.score,
        growthAnalysis: `${report.growth.analysis}\n\n강점: ${report.growth.strengths.join(', ')}\n개선점: ${report.growth.improvements.join(', ')}`,
        riskScore: report.risk.score,
        riskAnalysis: `${report.risk.analysis}\n\n강점: ${report.risk.strengths.join(', ')}\n개선점: ${report.risk.improvements.join(', ')}`,
      },
      update: {
        totalScore: report.totalScore,
        verdict: report.verdict,
        summary: report.summary,
        techScore: report.tech.score,
        techAnalysis: `${report.tech.analysis}\n\n강점: ${report.tech.strengths.join(', ')}\n개선점: ${report.tech.improvements.join(', ')}`,
        marketScore: report.market.score,
        marketAnalysis: `${report.market.analysis}\n\n강점: ${report.market.strengths.join(', ')}\n개선점: ${report.market.improvements.join(', ')}`,
        uxScore: report.ux.score,
        uxAnalysis: `${report.ux.analysis}\n\n강점: ${report.ux.strengths.join(', ')}\n개선점: ${report.ux.improvements.join(', ')}`,
        feasibilityScore: report.feasibility.score,
        feasibilityAnalysis: `${report.feasibility.analysis}\n\n강점: ${report.feasibility.strengths.join(', ')}\n개선점: ${report.feasibility.improvements.join(', ')}`,
        growthScore: report.growth.score,
        growthAnalysis: `${report.growth.analysis}\n\n강점: ${report.growth.strengths.join(', ')}\n개선점: ${report.growth.improvements.join(', ')}`,
        riskScore: report.risk.score,
        riskAnalysis: `${report.risk.analysis}\n\n강점: ${report.risk.strengths.join(', ')}\n개선점: ${report.risk.improvements.join(', ')}`,
      },
    });

    await prisma.project.update({
      where: { id },
      data: { status: 'completed' },
    });

    return NextResponse.json({ message: 'Evaluation completed', totalScore: report.totalScore, verdict: report.verdict });
  } catch (e) {
    console.error('Evaluation error:', e);
    await prisma.project.update({
      where: { id },
      data: { status: 'failed' },
    });
    return NextResponse.json({ error: 'Evaluation failed' }, { status: 500 });
  }
}
