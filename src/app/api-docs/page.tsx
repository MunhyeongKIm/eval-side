import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Docs | Side Project Evaluator',
  description: 'API documentation for integrating with Side Project Evaluator',
};

const endpoints = [
  {
    method: 'GET',
    path: '/api/projects',
    description: 'List all projects',
    request: null,
    response: `[
  {
    "id": "clx...",
    "name": "My Project",
    "description": "A cool side project",
    "githubUrl": "https://github.com/user/repo",
    "type": "github",
    "status": "completed",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]`,
  },
  {
    method: 'POST',
    path: '/api/projects',
    description: 'Create a new project for evaluation',
    request: `{
  "name": "My Project",           // required, 1-100 chars
  "description": "Description",   // optional, max 2000 chars
  "githubUrl": "https://github.com/user/repo"  // optional
}`,
    response: `{
  "id": "clx...",
  "name": "My Project",
  "status": "pending"
}`,
  },
  {
    method: 'POST',
    path: '/api/projects/[id]/evaluate',
    description: 'Trigger AI evaluation for a project. Rate limited to 5 requests/min per IP.',
    request: null,
    response: `{
  "success": true,
  "evaluation": {
    "totalScore": 65,
    "verdict": "CONDITIONAL_PASS",
    "techScore": 14,
    "marketScore": 12,
    "uxScore": 10,
    "feasibilityScore": 11,
    "growthScore": 9,
    "riskScore": 9,
    "summary": "..."
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/projects/[id]',
    description: 'Get a specific project with its evaluation',
    request: null,
    response: `{
  "id": "clx...",
  "name": "My Project",
  "status": "completed",
  "evaluation": {
    "totalScore": 65,
    "techScore": 14,
    "techAnalysis": "...",
    ...
  }
}`,
  },
];

const methodColors: Record<string, string> = {
  GET: 'bg-green-500/20 text-green-400 border-green-500/30',
  POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export default function ApiDocsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
        <p className="text-gray-400">
          Integrate Side Project Evaluator into your workflow
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Base URL: <code className="bg-gray-800 px-2 py-0.5 rounded text-gray-300">https://eval-side.vercel.app</code>
        </p>
      </div>

      <div className="space-y-6">
        {endpoints.map((ep) => (
          <div key={`${ep.method}-${ep.path}`} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-gray-800">
              <span className={`px-2.5 py-1 text-xs font-bold rounded border ${methodColors[ep.method]}`}>
                {ep.method}
              </span>
              <code className="text-white font-mono text-sm">{ep.path}</code>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-gray-400 text-sm">{ep.description}</p>
              {ep.request && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Request Body</h4>
                  <pre className="bg-gray-800/50 rounded-lg p-3 text-sm text-gray-300 overflow-x-auto">
                    <code>{ep.request}</code>
                  </pre>
                </div>
              )}
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Response</h4>
                <pre className="bg-gray-800/50 rounded-lg p-3 text-sm text-gray-300 overflow-x-auto">
                  <code>{ep.response}</code>
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-bold mb-3">Rate Limits</h2>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>Evaluate endpoint: <span className="text-yellow-400">5 requests/minute</span> per IP</li>
          <li>All other endpoints: No rate limit</li>
          <li>Rate limit exceeded: <code className="bg-gray-800 px-1.5 py-0.5 rounded text-red-400">429 Too Many Requests</code></li>
        </ul>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-bold mb-3">Error Codes</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-400">
            <code className="text-red-400">400</code>
            <span>Invalid request (missing/invalid fields)</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <code className="text-red-400">404</code>
            <span>Project not found</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <code className="text-yellow-400">429</code>
            <span>Rate limit exceeded</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <code className="text-red-400">500</code>
            <span>Internal server error / AI evaluation timeout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
