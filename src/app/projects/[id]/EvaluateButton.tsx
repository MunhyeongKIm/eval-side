'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EvaluateButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      await fetch(`/api/projects/${projectId}/evaluate`, { method: 'POST' });
      router.refresh();
    } catch {
      alert('평가 시작에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleEvaluate}
      disabled={loading}
      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-medium rounded-lg transition"
    >
      {loading ? '평가 시작 중...' : '평가 실행'}
    </button>
  );
}
