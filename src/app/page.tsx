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

  return (
    <div className="space-y-8">
      <section className="text-center py-8">
        <h1 className="text-4xl font-bold mb-3">Side Project Evaluator</h1>
        <p className="text-gray-400 text-lg">Submit a project concept or GitHub link and get analysis from 6 different perspectives</p>
      </section>

      {topProjects.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">🏆 Top Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topProjects.map((p, i) => {
              const score = p.evaluation?.totalScore || 0;
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-gray-600 transition block"
                >
                  <div className="text-2xl mb-1">{medals[i]} {p.name}</div>
                  <p className="text-3xl font-bold text-green-400 my-2">
                    {formatDollarValue(calculateDollarValue(score))}
                  </p>
                  <p className="text-sm text-gray-400">{score}/100</p>
                </Link>
              );
            })}
          </div>
          <div className="text-center">
            <Link href="/leaderboard" className="text-yellow-400 hover:text-yellow-300 transition text-sm">
              View Full Leaderboard →
            </Link>
          </div>
        </section>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <SubmitForm />
        </div>
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
          {projects.length === 0 ? (
            <p className="text-gray-500">No projects submitted yet.</p>
          ) : (
            projects.map((p) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
