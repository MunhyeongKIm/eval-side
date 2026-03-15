'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

export default function EvaluateButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      await fetch(`/api/projects/${projectId}/evaluate`, { method: 'POST' });
      router.refresh();
    } catch {
      showToast('Failed to start evaluation.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleEvaluate}
      disabled={loading}
      aria-label="Run AI evaluation"
      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-medium rounded-lg transition"
    >
      {loading ? 'Starting Evaluation...' : 'Run Evaluation'}
    </button>
  );
}
