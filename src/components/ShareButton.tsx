'use client';

import { useState } from 'react';

interface ShareButtonProps {
  projectName: string;
  score: number;
  tierName: string;
  projectId: string;
}

export default function ShareButton({ projectName, score, tierName, projectId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `🏆 ${projectName} scored ${score}/100 (${tierName}) on Side Project Evaluator!\nCheck it out: https://eval-side.vercel.app/projects/${projectId}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareOnX = () => {
    const encodedText = encodeURIComponent(shareText);
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopyLink}
        className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
      >
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
      <button
        onClick={handleShareOnX}
        className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
      >
        Share on X
      </button>
    </div>
  );
}
