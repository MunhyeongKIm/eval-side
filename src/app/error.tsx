'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-red-900/30 border border-red-700 flex items-center justify-center text-3xl">
        !
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
        <p className="text-gray-400 max-w-md">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
      </div>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
      >
        Try Again
      </button>
    </div>
  );
}
