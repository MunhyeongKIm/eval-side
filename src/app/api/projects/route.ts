import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const projects = await prisma.project.findMany({
    include: { evaluation: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, githubUrl } = body;

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
