'use client';

import { useState } from 'react';

interface EvalSectionProps {
  title: string;
  score: number;
  maxScore: number;
  analysis: string | null;
}

export default function EvalSection({ title, score, maxScore, analysis }: EvalSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition"
      >
        <span className="font-medium text-white">{title}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{score}/{maxScore}</span>
          <span className="text-gray-500">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="px-4 py-3 bg-gray-950 text-sm text-gray-300 whitespace-pre-wrap">
          {analysis || '분석 결과가 없습니다.'}
        </div>
      )}
    </div>
  );
}
