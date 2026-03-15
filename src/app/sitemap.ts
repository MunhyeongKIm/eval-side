import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await prisma.project.findMany({ select: { id: true, updatedAt: true } });
  const projectUrls = projects.map((p) => ({
    url: `https://eval-side.vercel.app/projects/${p.id}`,
    lastModified: p.updatedAt,
  }));
  return [
    { url: 'https://eval-side.vercel.app', lastModified: new Date() },
    { url: 'https://eval-side.vercel.app/leaderboard', lastModified: new Date() },
    ...projectUrls,
  ];
}
