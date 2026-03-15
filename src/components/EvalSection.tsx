'use client';

import { useState } from 'react';

interface EvalSectionProps {
  title: string;
  score: number;
  maxScore: number;
  analysis: string | null;
}

function getScoreColor(score: number, max: number): string {
  const pct = max > 0 ? (score / max) * 100 : 0;
  if (pct >= 80) return 'text-green-400';
  if (pct >= 60) return 'text-yellow-400';
  if (pct >= 40) return 'text-orange-400';
  return 'text-red-400';
}

export default function EvalSection({ title, score, maxScore, analysis }: EvalSectionProps) {
  const [open, setOpen] = useState(false);
  const scoreColor = getScoreColor(score, maxScore);

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden transition-colors hover:border-gray-700/70">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-3.5 flex items-center justify-between bg-gray-900 hover:bg-gray-900/80 transition group"
      >
        <span className="font-medium text-sm text-white">{title}</span>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium tabular-nums ${scoreColor}`}>
            {score}/{maxScore}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`text-gray-600 group-hover:text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="px-5 py-4 bg-gray-950/50 border-t border-gray-800/50">
          <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {analysis || 'No analysis available.'}
          </div>
        </div>
      )}
    </div>
  );
}
