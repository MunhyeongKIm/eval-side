import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const updates = [
    {
      name: 'AI Code Reviewer',
      description:
        'A SaaS that automatically adds AI code reviews to GitHub PRs. Detects code quality, security, and performance issues using GPT-4.',
    },
    {
      name: 'Daily Habit Tracker',
      description:
        'A mobile app for recording daily habits and managing streaks. Built with React Native + Firebase.',
    },
    {
      name: 'Open Source Analytics',
      description:
        'A lightweight web analytics tool for personal projects. Privacy-first, cookie-free tracking.',
    },
  ];

  for (const { name, description } of updates) {
    const result = await prisma.project.updateMany({
      where: { name },
      data: { description },
    });
    console.log(`Updated ${name}: ${result.count} row(s)`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
