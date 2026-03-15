import Link from 'next/link';
import Badge from './Badge';
import { calculateDollarValue, formatDollarValue } from '@/lib/valuation';

interface ProjectCardProps {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  status: string;
  githubUrl?: string | null;
  totalScore?: number | null;
  verdict?: string | null;
}

export default function ProjectCard({ id, name, description, type, status, githubUrl, totalScore, verdict }: ProjectCardProps) {
  return (
    <Link href={`/projects/${id}`} className="block bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-gray-600 transition">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-white">{name}</h3>
        <Badge value={verdict || status} />
      </div>
      {description && <p className="text-sm text-gray-400 mb-3 line-clamp-2">{description}</p>}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>{type === 'github' ? 'GitHub' : 'Concept'}</span>
        {githubUrl && <span className="truncate max-w-[200px]">{githubUrl}</span>}
        {totalScore !== null && totalScore !== undefined && (
          <>
            <span className="ml-auto text-green-400 font-medium text-sm">
              {formatDollarValue(calculateDollarValue(totalScore))}
            </span>
            <span className="text-white font-medium">{totalScore}/100</span>
          </>
        )}
      </div>
    </Link>
  );
}
