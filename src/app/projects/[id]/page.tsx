import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
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
    return { title: 'Project Not Found | EvalSide' };
  }

  const score = project.evaluation?.totalScore;
  const verdict = project.evaluation?.verdict;

  const title = score != null
    ? `${project.name} - ${score}/100 | EvalSide`
    : `${project.name} | EvalSide`;

  const description = score != null && verdict
    ? `${project.name} scored ${score}/100 with a verdict of ${verdict.replace(/_/g, ' ')} on EvalSide.`
    : `View the evaluation report for ${project.name} on EvalSide.`;

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
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
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-600">
        <Link href="/" className="hover:text-gray-400 transition">Home</Link>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4l4 4-4 4" /></svg>
        <span className="text-gray-400 truncate max-w-[200px]">{project.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">{project.name}</h1>
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-blue-400 text-sm mt-1 transition">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
              {project.githubUrl.replace('https://github.com/', '')}
            </a>
          )}
        </div>
        <Badge value={eval_?.verdict || project.status} />
      </div>

      {project.description && (
        <p className="text-gray-400 leading-relaxed">{project.description}</p>
      )}

      {/* Evaluate CTA */}
      {!eval_ && project.status !== 'evaluating' && (
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <h3 className="text-white font-semibold mb-2">Ready to Evaluate</h3>
          <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
            6 AI agents will analyze your project across technical, market, UX, feasibility, growth, and risk dimensions.
          </p>
          <EvaluateButton projectId={project.id} />
        </div>
      )}

      {/* Evaluating state */}
      {project.status === 'evaluating' && (
        <div className="bg-gray-900 rounded-xl p-6 border border-blue-500/20 glow-blue space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 h-3 w-3 bg-blue-500 rounded-full animate-ping opacity-25" />
            </div>
            <span className="text-blue-400 font-medium text-sm">AI agents are analyzing your project...</span>
          </div>
          <div className="space-y-3">
            {['Technical Completeness', 'Market Fit', 'User Experience', 'Feasibility', 'Growth Potential', 'Risk Management'].map((label, i) => (
              <div key={label} className="space-y-1.5" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-700">--</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500/30 rounded-full animate-pulse" style={{ width: `${30 + i * 10}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evaluation results */}
      {eval_ && (
        <>
          {/* Score overview card */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Overall Score</h2>
              <div className="flex items-center gap-3">
                <ShareButton
                  projectName={project.name}
                  score={eval_.totalScore || 0}
                  tierName={getValuationResult(eval_.totalScore || 0).tier.name}
                  projectId={project.id}
                />
                <div className="text-right">
                  <span className="text-3xl font-bold text-white">{eval_.totalScore}</span>
                  <span className="text-lg text-gray-600">/100</span>
                </div>
              </div>
            </div>

            {/* Valuation display */}
            <div className="text-center py-4 mb-6 bg-gray-800/30 rounded-xl">
              {(() => {
                const valuation = getValuationResult(eval_.totalScore || 0);
                return (
                  <>
                    <p className="text-4xl font-bold text-gradient-green mb-1">
                      {formatDollarValue(valuation.dollarValue)}
                    </p>
                    <p className="text-sm text-yellow-400/80 font-medium">{valuation.tier.name}</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">{valuation.tier.description}</p>
                    <div className="mt-2 space-y-0.5">
                      {valuation.tier.comparables.map((c, i) => (
                        <p key={i} className="text-xs text-gray-600">• {c}</p>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Score bars */}
            <div className="space-y-3">
              <ScoreBar label="Technical Completeness" score={eval_.techScore || 0} maxScore={10} />
              <ScoreBar label="Market Fit" score={eval_.marketScore || 0} maxScore={30} />
              <ScoreBar label="User Experience" score={eval_.uxScore || 0} maxScore={10} />
              <ScoreBar label="Feasibility" score={eval_.feasibilityScore || 0} maxScore={10} />
              <ScoreBar label="Growth Potential" score={eval_.growthScore || 0} maxScore={25} />
              <ScoreBar label="Risk Management" score={eval_.riskScore || 0} maxScore={15} />
            </div>
          </div>

          {/* Comparable cases */}
          {(() => {
            const valuation = getValuationResult(eval_.totalScore || 0);
            if (valuation.comparableCases.length === 0) return null;
            return (
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-sm font-semibold text-white mb-4">Similar Project Cases</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {valuation.comparableCases.map((c) => (
                    <div key={c.name} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30 hover:border-gray-700/50 transition">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <DealTypeBadge dealType={c.dealType} />
                          <span className="text-white font-medium text-sm">{c.name}</span>
                        </div>
                        {c.year && <span className="text-[10px] text-gray-600">{c.year}</span>}
                      </div>
                      {c.acquirer && (
                        <p className="text-xs text-gray-500">Acquirer: <span className="text-gray-400">{c.acquirer}</span></p>
                      )}
                      {c.dealValue && (
                        <p className="text-xs text-green-400 font-medium mt-1">Deal: {formatDealValue(c.dealValue)}</p>
                      )}
                      <p className="text-[11px] text-gray-500 mt-1.5">{c.highlights.join(' · ')}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 flex-wrap">
                          {c.techStack?.map((t) => (
                            <span key={t} className="px-1.5 py-0.5 text-[10px] bg-gray-700/50 text-gray-400 rounded">{t}</span>
                          ))}
                        </div>
                        {c.source && (
                          <a href={c.source} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline">source</a>
                        )}
                      </div>
                      {(c.teamSize || c.metrics?.stars || c.revenue) && (
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-600">
                          {c.teamSize && <span>{c.teamSize}p team</span>}
                          {c.metrics?.stars && <span>{c.metrics.stars.toLocaleString()} stars</span>}
                          {c.metrics?.users && <span>{c.metrics.users.toLocaleString()} users</span>}
                          {c.revenue?.mrr && <span>MRR ${c.revenue.mrr.toLocaleString()}</span>}
                          {c.revenue?.arr && <span>ARR ${c.revenue.arr.toLocaleString()}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Executive Summary */}
          {eval_.summary && (
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="12" height="12" rx="2" />
                  <path d="M5 6h6M5 8.5h6M5 11h3" />
                </svg>
                Executive Summary
              </h2>
              <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{eval_.summary}</p>
            </div>
          )}

          {/* Detailed Analysis */}
          <div className="space-y-2">
            <h2 className="font-semibold text-white text-sm uppercase tracking-wider text-gray-400">Detailed Analysis</h2>
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
