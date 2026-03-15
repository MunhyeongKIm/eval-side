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
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center pt-16 pb-8 animate-fade-in hero-gradient relative">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            AI-Powered Multi-Agent Analysis
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 tracking-tight">
            Evaluate Your
            <span className="text-gradient block sm:inline"> Side Project</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Get an instant AI-powered evaluation of your side project. Our 6 specialized agents
            deliver a score, dollar valuation, and actionable roadmap.
          </p>

          {/* Stats */}
          <div className="inline-flex items-center gap-6 sm:gap-10 px-6 py-3 rounded-2xl bg-gray-900/50 border border-gray-800/50">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{totalProjects}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Projects</p>
            </div>
            <div className="w-px h-8 bg-gray-800" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{completedProjects}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Evaluated</p>
            </div>
            <div className="w-px h-8 bg-gray-800" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">6</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">AI Agents</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="animate-fade-in-delay-1">
        <div className="text-center mb-8">
          <p className="text-xs font-medium text-blue-400 uppercase tracking-widest mb-2">Simple Process</p>
          <h2 className="text-2xl font-bold text-white">How It Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector lines (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[calc(33.33%-12px)] w-[calc(33.33%+24px)] h-px bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20" />
          <div className="hidden md:block absolute top-12 right-[calc(33.33%-12px)] w-[calc(33.33%+24px)] h-px bg-gradient-to-r from-purple-500/20 via-green-500/20 to-green-500/10" />

          {/* Step 1 */}
          <div className="bg-gray-900/80 rounded-xl p-6 border border-gray-800 text-center relative">
            <div className="w-10 h-10 rounded-full bg-blue-500/15 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-400 font-bold text-sm">1</span>
            </div>
            <h3 className="font-semibold text-white mb-1.5">Submit Your Project</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Paste a GitHub URL or describe your project concept in plain text</p>
          </div>

          {/* Step 2 */}
          <div className="bg-gray-900/80 rounded-xl p-6 border border-gray-800 text-center relative">
            <div className="w-10 h-10 rounded-full bg-purple-500/15 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-400 font-bold text-sm">2</span>
            </div>
            <h3 className="font-semibold text-white mb-1.5">6 AI Agents Analyze</h3>
            <p className="text-sm text-gray-500 mb-3">Parallel evaluation across all dimensions</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {[
                { label: 'Technical', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                { label: 'Market', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                { label: 'UX', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
                { label: 'Feasibility', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                { label: 'Growth', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
                { label: 'Risk', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
              ].map(({ label, color }) => (
                <span key={label} className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${color}`}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-gray-900/80 rounded-xl p-6 border border-gray-800 text-center relative">
            <div className="w-10 h-10 rounded-full bg-green-500/15 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-green-400 font-bold text-sm">3</span>
            </div>
            <h3 className="font-semibold text-white mb-1.5">Get Your Report</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Score out of 100, dollar valuation, comparable cases, and improvement roadmap</p>
          </div>
        </div>
      </section>

      {/* Submit Form */}
      <section className="animate-fade-in-delay-2">
        <SubmitForm />
      </section>

      {/* Top Projects */}
      {topProjects.length > 0 && (
        <section className="space-y-5 animate-fade-in-delay-2">
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

      {/* Recent Projects */}
      <section className="space-y-4 animate-fade-in-delay-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
          <span className="text-xs text-gray-600">{projects.length} shown</span>
        </div>
        {projects.length === 0 ? (
          <div className="bg-gray-900/50 rounded-xl p-12 border border-dashed border-gray-800 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <p className="text-gray-500 mb-1">No projects submitted yet</p>
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
      </section>

      {/* Bottom CTA */}
      <section className="text-center py-12 border-t border-gray-800/50 animate-fade-in-delay-3">
        <p className="text-sm text-gray-500 mb-3">Built for indie hackers, solo founders, and side project builders</p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13.5 2.5l-11 11M2.5 2.5h11v11" /></svg>
            Open source
          </span>
          <span className="text-gray-800">|</span>
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 2" /></svg>
            Results in ~30 seconds
          </span>
          <span className="text-gray-800">|</span>
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 8h12M6 4l-4 4 4 4" /></svg>
            No sign-up required
          </span>
        </div>
      </section>
    </div>
  );
}
