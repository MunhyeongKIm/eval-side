import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.project.createMany({
    data: [
      {
        name: 'AI Code Reviewer',
        description: 'GitHub PR에 자동으로 AI 코드 리뷰를 달아주는 SaaS. GPT-4 기반으로 코드 품질, 보안, 성능 이슈를 자동 탐지합니다.',
        type: 'concept',
        status: 'completed',
      },
      {
        name: 'Daily Habit Tracker',
        description: '매일 습관을 기록하고 스트릭을 관리하는 모바일 앱. React Native + Firebase 기반.',
        githubUrl: 'https://github.com/example/habit-tracker',
        type: 'github',
        status: 'pending',
      },
      {
        name: 'Open Source Analytics',
        description: '개인 프로젝트를 위한 경량 웹 분석 도구. 프라이버시 중심, 쿠키 없는 추적.',
        type: 'concept',
        status: 'pending',
      },
    ],
  });

  console.log('Seed data created successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
