import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limiter';

const PROJECT_CREATE_LIMIT = 3; // 3 per minute
const PROJECT_CREATE_WINDOW_MS = 60 * 1000;

function getClientIp(request: NextRequest): string {
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

export async function GET() {
  const projects = await prisma.project.findMany({
    include: { evaluation: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // Rate limit project creation: 3 per minute per IP
  const limit = await checkRateLimit(`create:${ip}`, PROJECT_CREATE_LIMIT, PROJECT_CREATE_WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: '프로젝트 생성 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
        retryAfterMs: limit.retryAfterMs,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(limit.retryAfterMs / 1000)),
        },
      }
    );
  }

  const body = await request.json();
  const { name, description, githubUrl } = body;

  // Honeypot check: if hidden field is filled, reject silently
  if (body._hp_field) {
    // Return fake success to not alert the bot
    return NextResponse.json({ id: 'fake-id', name }, { status: 201 });
  }

  // Timestamp check: reject if form was submitted too quickly (< 2 seconds)
  if (body._ts) {
    const elapsed = Date.now() - Number(body._ts);
    if (elapsed < 2000) {
      return NextResponse.json({ id: 'fake-id', name }, { status: 201 });
    }
  }

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  if (name.trim().length > 100) {
    return NextResponse.json(
      { error: 'name must be 100 characters or fewer' },
      { status: 400 }
    );
  }

  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      return NextResponse.json(
        { error: 'description must be a string' },
        { status: 400 }
      );
    }
    if (description.length > 2000) {
      return NextResponse.json(
        { error: 'description must be 2000 characters or fewer' },
        { status: 400 }
      );
    }
  }

  if (githubUrl !== undefined && githubUrl !== null && githubUrl !== '') {
    if (typeof githubUrl !== 'string') {
      return NextResponse.json(
        { error: 'githubUrl must be a string' },
        { status: 400 }
      );
    }
    if (!githubUrl.match(/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+/)) {
      return NextResponse.json(
        { error: 'githubUrl must be a valid GitHub repository URL starting with https://github.com/' },
        { status: 400 }
      );
    }
  }

  const type = githubUrl ? 'github' : 'concept';

  const project = await prisma.project.create({
    data: { name, description, githubUrl, type },
  });

  return NextResponse.json(project, { status: 201 });
}
