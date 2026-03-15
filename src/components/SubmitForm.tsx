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

  // Reset timestamp when form mounts (page load time)
  useEffect(() => {
    formTimestamp.current = Date.now();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Read honeypot field value
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
    <form onSubmit={handleSubmit} aria-label="Submit new project" className="space-y-4 bg-gray-900 rounded-xl p-6 border border-gray-800">
      <h2 className="text-lg font-semibold text-white">Submit Project</h2>

      {/* Honeypot field - hidden from real users, bots will fill it */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <label htmlFor="_hp_field">Leave this empty</label>
        <input
          type="text"
          id="_hp_field"
          name="_hp_field"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Project Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          placeholder="e.g. AI Code Reviewer"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          placeholder="Describe your project..."
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">GitHub URL (optional)</label>
        <input
          type="url"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          placeholder="https://github.com/user/repo"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !name}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition"
      >
        {loading ? 'Submitting...' : 'Submit Project'}
      </button>
    </form>
  );
}
