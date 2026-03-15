import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Badge from '@/components/Badge';
import ScoreBar from '@/components/ScoreBar';
import EvalSection from '@/components/EvalSection';
import EvaluateButton from './EvaluateButton';
import { getValuationResult, formatDollarValue, formatDealValue } from '@/lib/valuation';
import DealTypeBadge from '@/components/DealTypeBadge';
import ShareButton from '@/components/ShareButton';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: { name: true, evaluation: { select: { totalScore: true, verdict: true } } },
  });

  if (!project) {
    return { title: 'Project Not Found | Side Project Evaluator' };
  }

  const score = project.evaluation?.totalScore;
  const verdict = project.evaluation?.verdict;

  const title = score != null
    ? `${project.name} - ${score}/100 | Side Project Evaluator`
    : `${project.name} | Side Project Evaluator`;

  const description = score != null && verdict
    ? `${project.name} scored ${score}/100 with a verdict of ${verdict.replace(/_/g, ' ')} on Side Project Evaluator.`
    : `View the evaluation report for ${project.name} on Side Project Evaluator.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { evaluation: true },
  });

  if (!project) notFound();

  const eval_ = project.evaluation;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{project.name}</h1>
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">
              {project.githubUrl}
            </a>
          )}
        </div>
        <Badge value={eval_?.verdict || project.status} />
      </div>

      {project.description && (
        <p className="text-gray-400">{project.description}</p>
      )}

      {!eval_ && project.status !== 'evaluating' && (
        <EvaluateButton projectId={project.id} />
      )}

      {project.status === 'evaluating' && (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-blue-400 font-medium">Evaluation in progress...</span>
          </div>
          <div className="space-y-3">
            {['Technical Completeness', 'Market Fit', 'User Experience', 'Feasibility', 'Growth Potential', 'Risk Management'].map((label) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-700">--/--</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-gray-700 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {eval_ && (
        <>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Overall Score</h2>
              <div className="flex items-center gap-4">
                <ShareButton
                  projectName={project.name}
                  score={eval_.totalScore || 0}
                  tierName={getValuationResult(eval_.totalScore || 0).tier.name}
                  projectId={project.id}
                />
                <span className="text-3xl font-bold text-white">{eval_.totalScore}<span className="text-lg text-gray-500">/100</span></span>
              </div>
            </div>
            <div className="text-center mb-4">
              {(() => {
                const valuation = getValuationResult(eval_.totalScore || 0);
                return (
                  <>
                    <p className="text-4xl font-bold text-green-400">
                      {formatDollarValue(valuation.dollarValue)}
                    </p>
                    <p className="text-sm text-yellow-400/80 font-medium">{valuation.tier.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{valuation.tier.description}</p>
                    <div className="mt-2 space-y-0.5">
                      {valuation.tier.comparables.map((c, i) => (
                        <p key={i} className="text-xs text-gray-600">• {c}</p>
                      ))}
                    </div>
                    {valuation.comparableCases.length > 0 && (
                      <div className="mt-4 border-t border-gray-700 pt-4">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Similar Project Cases</h3>
                        <div className="space-y-3">
                          {valuation.comparableCases.map((c) => (
                            <div key={c.name} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <DealTypeBadge dealType={c.dealType} />
                                  <span className="text-white font-medium text-sm">{c.name}</span>
                                </div>
                                {c.year && <span className="text-xs text-gray-500">{c.year}</span>}
                              </div>
                              {c.acquirer && (
                                <p className="text-xs text-gray-400">Acquirer: <span className="text-gray-300">{c.acquirer}</span></p>
                              )}
                              {c.dealValue && (
                                <p className="text-xs text-green-400 font-medium">Deal: {formatDealValue(c.dealValue)}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">{c.highlights.join(' · ')}</p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1 flex-wrap">
                                  {c.techStack?.map((t) => (
                                    <span key={t} className="px-1.5 py-0.5 text-[10px] bg-gray-700/50 text-gray-400 rounded">{t}</span>
                                  ))}
                                </div>
                                {c.source && (
                                  <a href={c.source} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline">source↗</a>
                                )}
                              </div>
                              {(c.teamSize || c.metrics?.stars || c.revenue) && (
                                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500">
                                  {c.teamSize && <span>👥 {c.teamSize} {c.teamSize === 1 ? 'person' : 'people'}</span>}
                                  {c.metrics?.stars && <span>⭐ {c.metrics.stars.toLocaleString()}</span>}
                                  {c.metrics?.users && <span>👤 {c.metrics.users.toLocaleString()} users</span>}
                                  {c.revenue?.mrr && <span>MRR ${c.revenue.mrr.toLocaleString()}</span>}
                                  {c.revenue?.arr && <span>ARR ${c.revenue.arr.toLocaleString()}</span>}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            <div className="space-y-3">
              <ScoreBar label="Technical Completeness" score={eval_.techScore || 0} maxScore={10} />
              <ScoreBar label="Market Fit" score={eval_.marketScore || 0} maxScore={30} />
              <ScoreBar label="User Experience" score={eval_.uxScore || 0} maxScore={10} />
              <ScoreBar label="Feasibility" score={eval_.feasibilityScore || 0} maxScore={10} />
              <ScoreBar label="Growth Potential" score={eval_.growthScore || 0} maxScore={25} />
              <ScoreBar label="Risk Management" score={eval_.riskScore || 0} maxScore={15} />
            </div>
          </div>

          {eval_.summary && (
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="font-semibold text-white mb-2">Executive Summary</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{eval_.summary}</p>
            </div>
          )}

          <div className="space-y-2">
            <h2 className="font-semibold text-white">Detailed Analysis</h2>
            <EvalSection title="Technical Completeness" score={eval_.techScore || 0} maxScore={10} analysis={eval_.techAnalysis} />
            <EvalSection title="Market Fit" score={eval_.marketScore || 0} maxScore={30} analysis={eval_.marketAnalysis} />
            <EvalSection title="User Experience" score={eval_.uxScore || 0} maxScore={10} analysis={eval_.uxAnalysis} />
            <EvalSection title="Feasibility" score={eval_.feasibilityScore || 0} maxScore={10} analysis={eval_.feasibilityAnalysis} />
            <EvalSection title="Growth Potential" score={eval_.growthScore || 0} maxScore={25} analysis={eval_.growthAnalysis} />
            <EvalSection title="Risk Management" score={eval_.riskScore || 0} maxScore={15} analysis={eval_.riskAnalysis} />
          </div>
        </>
      )}
    </div>
  );
}
