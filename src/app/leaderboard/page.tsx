import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getValuationResult, formatDollarValue } from '@/lib/valuation';
import Badge from '@/components/Badge';
import DealTypeBadge from '@/components/DealTypeBadge';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Leaderboard | EvalSide',
  description: 'See how your side project stacks up against others. Browse all evaluated projects ranked by their AI-generated score.',
};

const medals = ['🥇', '🥈', '🥉'] as const;

function getRankStyle(rank: number): string {
  switch (rank) {
    case 0:
      return 'bg-yellow-500/5 border-l-2 border-yellow-500/50';
    case 1:
      return 'bg-gray-300/5 border-l-2 border-gray-400/50';
    case 2:
      return 'bg-amber-700/5 border-l-2 border-amber-600/50';
    default:
      return 'hover:bg-gray-900/50';
  }
}

export default async function LeaderboardPage() {
  const projects = await prisma.project.findMany({
    where: { status: 'completed', evaluation: { isNot: null } },
    include: { evaluation: true },
    orderBy: { evaluation: { totalScore: 'desc' } },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center pt-8 pb-4 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Leaderboard</h1>
        <p className="text-gray-500 text-sm">
          {projects.length} project{projects.length !== 1 ? 's' : ''} evaluated
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/30 rounded-xl border border-dashed border-gray-800">
          <p className="text-gray-500 mb-4">No projects have been evaluated yet</p>
          <Link href="/" className="text-sm text-blue-400 hover:text-blue-300 transition">
            Submit your first project
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800 animate-fade-in-delay-1">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-900/50">
                <th className="py-3 px-4 w-16">#</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4 text-right">Valuation</th>
                <th className="py-3 px-4 text-right">Score</th>
                <th className="py-3 px-4 hidden md:table-cell">Comparable</th>
                <th className="py-3 px-4 text-right">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {projects.map((project, index) => {
                const score = project.evaluation?.totalScore || 0;
                const valuation = getValuationResult(score);
                return (
                  <tr
                    key={project.id}
                    className={`${getRankStyle(index)} transition-colors`}
                  >
                    <td className="py-3.5 px-4">
                      {index < 3 ? (
                        <span className="text-lg">{medals[index]}</span>
                      ) : (
                        <span className="text-sm text-gray-600 font-mono">{index + 1}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-white hover:text-blue-400 transition font-medium text-sm"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-green-400 font-bold">{formatDollarValue(valuation.dollarValue)}</span>
                      <span className="block text-[10px] text-gray-600">{valuation.tier.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-sm text-white font-medium">{score}</span>
                      <span className="text-gray-600 text-xs">/100</span>
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      {valuation.comparableCases[0] && (
                        <div className="flex items-center gap-2">
                          <DealTypeBadge dealType={valuation.comparableCases[0].dealType} />
                          <span className="text-xs text-gray-400">{valuation.comparableCases[0].name}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge value={project.evaluation?.verdict || 'N/A'} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
