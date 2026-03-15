import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.project.createMany({
    data: [
      {
        name: 'AI Code Reviewer',
        description: 'A SaaS that automatically adds AI code reviews to GitHub PRs. Detects code quality, security, and performance issues using GPT-4.',
        type: 'concept',
        status: 'completed',
      },
      {
        name: 'Daily Habit Tracker',
        description: 'A mobile app for recording daily habits and managing streaks. Built with React Native + Firebase.',
        githubUrl: 'https://github.com/example/habit-tracker',
        type: 'github',
        status: 'pending',
      },
      {
        name: 'Open Source Analytics',
        description: 'A lightweight web analytics tool for personal projects. Privacy-first, cookie-free tracking.',
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
