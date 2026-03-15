import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Badge from '@/components/Badge';
import ScoreBar from '@/components/ScoreBar';
import EvalSection from '@/components/EvalSection';
import EvaluateButton from './EvaluateButton';

export const dynamic = 'force-dynamic';

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
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-blue-400">
          평가가 진행중입니다...
        </div>
      )}

      {eval_ && (
        <>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">종합 점수</h2>
              <span className="text-3xl font-bold text-white">{eval_.totalScore}<span className="text-lg text-gray-500">/100</span></span>
            </div>
            <div className="space-y-3">
              <ScoreBar label="기술 완성도" score={eval_.techScore || 0} maxScore={20} />
              <ScoreBar label="시장 적합성" score={eval_.marketScore || 0} maxScore={20} />
              <ScoreBar label="사용자 경험" score={eval_.uxScore || 0} maxScore={15} />
              <ScoreBar label="실현 가능성" score={eval_.feasibilityScore || 0} maxScore={15} />
              <ScoreBar label="성장 잠재력" score={eval_.growthScore || 0} maxScore={15} />
              <ScoreBar label="리스크 관리" score={eval_.riskScore || 0} maxScore={15} />
            </div>
          </div>

          {eval_.summary && (
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="font-semibold text-white mb-2">Executive Summary</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{eval_.summary}</p>
            </div>
          )}

          <div className="space-y-2">
            <h2 className="font-semibold text-white">상세 분석</h2>
            <EvalSection title="기술 완성도" score={eval_.techScore || 0} maxScore={20} analysis={eval_.techAnalysis} />
            <EvalSection title="시장 적합성" score={eval_.marketScore || 0} maxScore={20} analysis={eval_.marketAnalysis} />
            <EvalSection title="사용자 경험" score={eval_.uxScore || 0} maxScore={15} analysis={eval_.uxAnalysis} />
            <EvalSection title="실현 가능성" score={eval_.feasibilityScore || 0} maxScore={15} analysis={eval_.feasibilityAnalysis} />
            <EvalSection title="성장 잠재력" score={eval_.growthScore || 0} maxScore={15} analysis={eval_.growthAnalysis} />
            <EvalSection title="리스크 관리" score={eval_.riskScore || 0} maxScore={15} analysis={eval_.riskAnalysis} />
          </div>
        </>
      )}
    </div>
  );
}
