import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeRepo } from '@/lib/github-analyzer';
import { evaluateProject } from '@/lib/evaluator';
import { EvaluationInput } from '@/lib/types';
import { checkDailyLimit, recordUsage } from '@/lib/usage-tracker';

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_DEFAULT = 5;
const RATE_LIMIT_MAX_AUTHENTICATED = 20;

const API_KEYS = new Set(
  (process.env.API_KEYS || '').split(',').map((k) => k.trim()).filter(Boolean),
);

interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function checkRateLimit(ip: string, max: number = RATE_LIMIT_MAX_DEFAULT): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    rateLimitMap.set(ip, { timestamps: [now] });
    return true;
  }

  // Remove expired timestamps
  entry.timestamps = entry.timestamps.filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS
  );

  if (entry.timestamps.length >= max) {
    return false;
  }

  entry.timestamps.push(now);
  return true;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';

  // API key authentication (optional - relaxes rate limit)
  const apiKey = request.headers.get('x-api-key');
  const isAuthenticated = apiKey != null && API_KEYS.has(apiKey);
  const rateLimit = isAuthenticated ? RATE_LIMIT_MAX_AUTHENTICATED : RATE_LIMIT_MAX_DEFAULT;

  if (!checkRateLimit(ip, rateLimit)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before evaluating again.' },
      { status: 429 }
    );
  }

  // Daily usage limit check
  const dailyCheck = checkDailyLimit();
  if (!dailyCheck.allowed) {
    return NextResponse.json(
      { error: 'Daily evaluation limit reached. Please try again tomorrow.', remaining: dailyCheck.remaining },
      { status: 429 }
    );
  }

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
        techAnalysis: `${report.tech.analysis}\n\nStrengths: ${report.tech.strengths.join(', ')}\nImprovements: ${report.tech.improvements.join(', ')}`,
        marketScore: report.market.score,
        marketAnalysis: `${report.market.analysis}\n\nStrengths: ${report.market.strengths.join(', ')}\nImprovements: ${report.market.improvements.join(', ')}`,
        uxScore: report.ux.score,
        uxAnalysis: `${report.ux.analysis}\n\nStrengths: ${report.ux.strengths.join(', ')}\nImprovements: ${report.ux.improvements.join(', ')}`,
        feasibilityScore: report.feasibility.score,
        feasibilityAnalysis: `${report.feasibility.analysis}\n\nStrengths: ${report.feasibility.strengths.join(', ')}\nImprovements: ${report.feasibility.improvements.join(', ')}`,
        growthScore: report.growth.score,
        growthAnalysis: `${report.growth.analysis}\n\nStrengths: ${report.growth.strengths.join(', ')}\nImprovements: ${report.growth.improvements.join(', ')}`,
        riskScore: report.risk.score,
        riskAnalysis: `${report.risk.analysis}\n\nStrengths: ${report.risk.strengths.join(', ')}\nImprovements: ${report.risk.improvements.join(', ')}`,
      },
      update: {
        totalScore: report.totalScore,
        verdict: report.verdict,
        summary: report.summary,
        techScore: report.tech.score,
        techAnalysis: `${report.tech.analysis}\n\nStrengths: ${report.tech.strengths.join(', ')}\nImprovements: ${report.tech.improvements.join(', ')}`,
        marketScore: report.market.score,
        marketAnalysis: `${report.market.analysis}\n\nStrengths: ${report.market.strengths.join(', ')}\nImprovements: ${report.market.improvements.join(', ')}`,
        uxScore: report.ux.score,
        uxAnalysis: `${report.ux.analysis}\n\nStrengths: ${report.ux.strengths.join(', ')}\nImprovements: ${report.ux.improvements.join(', ')}`,
        feasibilityScore: report.feasibility.score,
        feasibilityAnalysis: `${report.feasibility.analysis}\n\nStrengths: ${report.feasibility.strengths.join(', ')}\nImprovements: ${report.feasibility.improvements.join(', ')}`,
        growthScore: report.growth.score,
        growthAnalysis: `${report.growth.analysis}\n\nStrengths: ${report.growth.strengths.join(', ')}\nImprovements: ${report.growth.improvements.join(', ')}`,
        riskScore: report.risk.score,
        riskAnalysis: `${report.risk.analysis}\n\nStrengths: ${report.risk.strengths.join(', ')}\nImprovements: ${report.risk.improvements.join(', ')}`,
      },
    });

    await prisma.project.update({
      where: { id },
      data: { status: 'completed' },
    });

    recordUsage();

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
