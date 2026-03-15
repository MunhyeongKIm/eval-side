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
          Get an instant AI-powered evaluation of your side project. Our 6 specialized agents analyze
          technical quality, market fit, UX, feasibility, growth potential, and risk — delivering a
          score, dollar valuation, and actionable roadmap.
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

      {/* How It Works */}
      <section className="space-y-8 animate-fade-in-delay-1">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">How It Works</h2>
          <p className="text-sm text-gray-500">Three steps to a comprehensive evaluation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1: Submit */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-400 font-bold text-sm">1</span>
            </div>
            <div className="flex justify-center mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-1">Submit Your Project</h3>
            <p className="text-xs text-gray-500">Paste a GitHub URL or describe your concept in plain text</p>
          </div>

          {/* Step 2: Analysis */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-400 font-bold text-sm">2</span>
            </div>
            <div className="flex justify-center mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-1">6 AI Agents Analyze</h3>
            <p className="text-xs text-gray-500 mb-3">Parallel evaluation from specialized perspectives</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {[
                { label: 'Technical', color: 'text-blue-400' },
                { label: 'Market', color: 'text-green-400' },
                { label: 'UX', color: 'text-pink-400' },
                { label: 'Feasibility', color: 'text-yellow-400' },
                { label: 'Growth', color: 'text-purple-400' },
                { label: 'Risk', color: 'text-red-400' },
              ].map(({ label, color }) => (
                <span
                  key={label}
                  className={`px-2 py-0.5 text-[10px] rounded-full bg-gray-800 border border-gray-700/50 ${color}`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Step 3: Report */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-green-400 font-bold text-sm">3</span>
            </div>
            <div className="flex justify-center mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-1">Get Your Report</h3>
            <p className="text-xs text-gray-500">Score out of 100, dollar valuation estimate, and actionable insights</p>
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

      {/* Main Content: Form + Recent Projects (stacked) */}
      <div className="space-y-8 animate-fade-in-delay-2">
        <SubmitForm />
        <div className="space-y-4">
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
