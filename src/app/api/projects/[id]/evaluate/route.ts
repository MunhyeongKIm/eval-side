import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeRepo } from '@/lib/github-analyzer';
import { evaluateProject } from '@/lib/evaluator';
import { EvaluationInput } from '@/lib/types';
import { checkRateLimit, cleanupExpiredRecords } from '@/lib/rate-limiter';
import { checkDailyLimit, checkHourlyLimit } from '@/lib/usage-tracker';

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_DEFAULT = 5;
const RATE_LIMIT_MAX_AUTHENTICATED = 20;

const API_KEYS = new Set(
  (process.env.API_KEYS || '').split(',').map((k) => k.trim()).filter(Boolean),
);

function getClientIp(request: NextRequest): string {
  // Prefer x-real-ip (set by Vercel's proxy, not spoofable by client)
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  // Fallback to x-forwarded-for first entry
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  return 'unknown';
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const ip = getClientIp(request);

  // API key authentication (optional - relaxes rate limit)
  const apiKey = request.headers.get('x-api-key');
  const isAuthenticated = apiKey != null && API_KEYS.has(apiKey);
  const maxRequests = isAuthenticated ? RATE_LIMIT_MAX_AUTHENTICATED : RATE_LIMIT_MAX_DEFAULT;

  // DB-based per-IP rate limit
  const ipLimit = await checkRateLimit(`ip:${ip}`, maxRequests, RATE_LIMIT_WINDOW_MS);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Too many requests. Please wait before evaluating again.',
        retryAfterMs: ipLimit.retryAfterMs,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(ipLimit.retryAfterMs / 1000)),
        },
      }
    );
  }

  // Hourly global limit check (burst protection)
  const hourlyCheck = await checkHourlyLimit();
  if (!hourlyCheck.allowed) {
    return NextResponse.json(
      { error: '시간당 평가 한도에 도달했습니다. 잠시 후 다시 시도해주세요.', remaining: hourlyCheck.remaining },
      { status: 429 }
    );
  }

  // Daily global limit check
  const dailyCheck = await checkDailyLimit();
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

    // Periodically clean up old rate limit records (non-blocking)
    cleanupExpiredRecords().catch(() => {});

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
