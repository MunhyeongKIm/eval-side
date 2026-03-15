import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getValuationResult, formatDollarValue } from '@/lib/valuation';
import Badge from '@/components/Badge';
import DealTypeBadge from '@/components/DealTypeBadge';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Leaderboard | Side Project Evaluator',
  description: 'See how your side project stacks up against others. Browse all evaluated projects ranked by their AI-generated score.',
};

const medals = ['🥇', '🥈', '🥉'] as const;

function getRankStyle(rank: number): string {
  switch (rank) {
    case 0:
      return 'bg-yellow-500/10 border-l-4 border-yellow-500';
    case 1:
      return 'bg-gray-300/10 border-l-4 border-gray-400';
    case 2:
      return 'bg-amber-700/10 border-l-4 border-amber-700';
    default:
      return 'bg-gray-900';
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
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold mb-2">🏆 Leaderboard</h1>
        <p className="text-gray-400">{projects.length} project{projects.length !== 1 ? 's' : ''} evaluated</p>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No projects have been evaluated yet</p>
          <Link href="/" className="text-blue-400 hover:underline">
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm border-b border-gray-800">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4 text-right">Valuation</th>
                <th className="py-3 px-4 text-right">Score</th>
                <th className="py-3 px-4 hidden md:table-cell">Comparable</th>
                <th className="py-3 px-4 text-right">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => {
                const score = project.evaluation?.totalScore || 0;
                const valuation = getValuationResult(score);
                return (
                  <tr
                    key={project.id}
                    className={`${getRankStyle(index)} border-b border-gray-800`}
                  >
                    <td className="py-4 px-4 text-lg">
                      {index < 3 ? medals[index] : index + 1}
                    </td>
                    <td className="py-4 px-4">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-white hover:text-blue-400 transition font-medium"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-green-400 font-bold text-lg">{formatDollarValue(valuation.dollarValue)}</span>
                      <span className="block text-xs text-gray-500">{valuation.tier.name}</span>
                    </td>
                    <td className="py-4 px-4 text-right text-white">
                      {score}<span className="text-gray-500">/100</span>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      {valuation.comparableCases[0] && (
                        <div className="flex items-center gap-2">
                          <DealTypeBadge dealType={valuation.comparableCases[0].dealType} />
                          <span className="text-sm text-gray-300">{valuation.comparableCases[0].name}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
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
