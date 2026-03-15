'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

export default function SubmitForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const formTimestamp = useRef<number>(Date.now());

  useEffect(() => {
    formTimestamp.current = Date.now();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const hpValue = formData.get('_hp_field') as string;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || undefined,
          githubUrl: githubUrl || undefined,
          _ts: formTimestamp.current,
          ...(hpValue ? { _hp_field: hpValue } : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit');
      }

      const project = await res.json();
      router.push(`/projects/${project.id}`);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Submit new project" className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M8 3v10M3 8h10" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-white">Submit a Project</h2>
        <span className="text-[10px] text-gray-600 ml-auto hidden sm:block">Free tier: up to 100 evaluations/day</span>
      </div>

      {/* Honeypot field */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <label htmlFor="_hp_field">Leave this empty</label>
        <input type="text" id="_hp_field" name="_hp_field" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Project Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm"
              placeholder="e.g. AI Code Reviewer"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">GitHub URL <span className="normal-case text-gray-600">(optional)</span></label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
              </div>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm"
                placeholder="https://github.com/user/repo"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={2000}
            className="w-full flex-1 px-3 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none text-sm"
            placeholder="What does your project do? Who is it for? What problem does it solve?"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 text-white font-semibold rounded-lg transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Analyzing with 6 AI agents...
          </>
        ) : (
          <>
            Submit for Evaluation
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
