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
    <Link href={`/projects/${id}`} className="group block bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-gray-700 hover:bg-gray-900/80 transition-all duration-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
            status === 'completed' ? 'bg-green-500' :
            status === 'evaluating' ? 'bg-blue-500 animate-pulse' :
            status === 'failed' ? 'bg-red-500' :
            'bg-gray-600'
          }`} />
          <h3 className="font-semibold text-white group-hover:text-blue-400 transition">{name}</h3>
        </div>
        <Badge value={verdict || status} />
      </div>
      {description && <p className="text-sm text-gray-400 mb-3 line-clamp-2 ml-[18px]">{description}</p>}
      <div className="flex items-center gap-3 text-xs text-gray-500 ml-[18px]">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
          type === 'github'
            ? 'bg-gray-800 text-gray-300'
            : 'bg-purple-500/10 text-purple-400'
        }`}>
          {type === 'github' ? (
            <>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
              GitHub
            </>
          ) : 'Concept'}
        </span>
        {githubUrl && <span className="truncate max-w-[180px] text-gray-600">{githubUrl.replace('https://github.com/', '')}</span>}
        {totalScore !== null && totalScore !== undefined && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-green-400 font-medium text-sm">
              {formatDollarValue(calculateDollarValue(totalScore))}
            </span>
            <span className="text-white font-medium">{totalScore}<span className="text-gray-600">/100</span></span>
          </div>
        )}
      </div>
    </Link>
  );
}
