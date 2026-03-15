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

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const type = githubUrl ? 'github' : 'concept';

  if (githubUrl && !githubUrl.match(/^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+/)) {
    return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: { name, description, githubUrl, type },
  });

  return NextResponse.json(project, { status: 201 });
}
