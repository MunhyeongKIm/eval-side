import Link from 'next/link';
import SubmitForm from '@/components/SubmitForm';
import ProjectCard from '@/components/ProjectCard';
import { prisma } from '@/lib/prisma';
import { calculateDollarValue, formatDollarValue } from '@/lib/valuation';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const projects = await prisma.project.findMany({
    include: { evaluation: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const topProjects = await prisma.project.findMany({
    where: { status: 'completed', evaluation: { isNot: null } },
    include: { evaluation: true },
    orderBy: { evaluation: { totalScore: 'desc' } },
    take: 3,
  });

  const totalProjects = await prisma.project.count();
  const completedProjects = await prisma.project.count({ where: { status: 'completed' } });

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center pt-12 pb-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          AI-Powered Multi-Agent Analysis
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
          Evaluate Your
          <span className="text-gradient block sm:inline"> Side Project</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Submit a project concept or GitHub repository and get comprehensive analysis
          from 6 specialized AI agents — technical, market, UX, feasibility, growth, and risk.
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{totalProjects}</p>
            <p className="text-xs text-gray-500">Projects Submitted</p>
          </div>
          <div className="w-px h-8 bg-gray-800" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{completedProjects}</p>
            <p className="text-xs text-gray-500">Evaluations Done</p>
          </div>
          <div className="w-px h-8 bg-gray-800" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">6</p>
            <p className="text-xs text-gray-500">AI Agents</p>
          </div>
        </div>
      </section>

      {/* Top Projects */}
      {topProjects.length > 0 && (
        <section className="space-y-5 animate-fade-in-delay-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Top Rated Projects</h2>
            <Link href="/leaderboard" className="text-sm text-gray-400 hover:text-white transition flex items-center gap-1">
              View all
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 4l4 4-4 4" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topProjects.map((p, i) => {
              const score = p.evaluation?.totalScore || 0;
              const medals = ['🥇', '🥈', '🥉'];
              const glows = ['glow-blue', 'glow-purple', 'glow-green'];
              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className={`group bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-gray-600 transition-all duration-300 block ${glows[i]}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{medals[i]}</span>
                    <span className="font-semibold text-white group-hover:text-blue-400 transition">{p.name}</span>
                  </div>
                  <p className="text-3xl font-bold text-gradient-green mb-1">
                    {formatDollarValue(calculateDollarValue(score))}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{score}/100</span>
                    <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 4l4 4-4 4" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Content: Form + Recent Projects */}
      <div className="grid md:grid-cols-3 gap-8 animate-fade-in-delay-2">
        <div className="md:col-span-1">
          <div className="sticky top-24">
            <SubmitForm />
          </div>
        </div>
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
            <span className="text-xs text-gray-600">{projects.length} shown</span>
          </div>
          {projects.length === 0 ? (
            <div className="bg-gray-900/50 rounded-xl p-12 border border-dashed border-gray-800 text-center">
              <p className="text-gray-500 mb-2">No projects submitted yet</p>
              <p className="text-sm text-gray-600">Be the first to submit a project for evaluation!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((p) => (
                <ProjectCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  description={p.description}
                  type={p.type}
                  status={p.status}
                  githubUrl={p.githubUrl}
                  totalScore={p.evaluation?.totalScore}
                  verdict={p.evaluation?.verdict}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
