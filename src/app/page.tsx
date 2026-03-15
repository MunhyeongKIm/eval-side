import SubmitForm from '@/components/SubmitForm';
import ProjectCard from '@/components/ProjectCard';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const projects = await prisma.project.findMany({
    include: { evaluation: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return (
    <div className="space-y-8">
      <section className="text-center py-8">
        <h1 className="text-4xl font-bold mb-3">사이드 프로젝트 평가기</h1>
        <p className="text-gray-400 text-lg">프로젝트 개념이나 GitHub 링크를 제출하면 6가지 관점에서 분석합니다</p>
      </section>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <SubmitForm />
        </div>
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white">최근 프로젝트</h2>
          {projects.length === 0 ? (
            <p className="text-gray-500">아직 제출된 프로젝트가 없습니다.</p>
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
