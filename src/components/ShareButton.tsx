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

  const shareText = `${projectName} scored ${score}/100 (${tierName}) on EvalSide!\nhttps://eval-side.vercel.app/projects/${projectId}`;

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
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleCopyLink}
        className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-all"
        title="Copy link"
      >
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round">
            <path d="M3 8l3 3 7-7" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="5" y="5" width="8" height="8" rx="1.5" />
            <path d="M3 11V3.5A.5.5 0 013.5 3H11" />
          </svg>
        )}
      </button>
      <button
        onClick={handleShareOnX}
        className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-all"
        title="Share on X"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>
    </div>
  );
}
