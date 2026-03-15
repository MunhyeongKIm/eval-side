import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Docs | EvalSide',
  description: 'API documentation for integrating with EvalSide',
};

const endpoints = [
  {
    method: 'GET',
    path: '/api/projects',
    description: 'List all projects with their evaluations, ordered by creation date.',
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
    description: 'Create a new project for evaluation. Rate limited to 3 requests/min per IP.',
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
    description: 'Trigger AI evaluation for a project. Rate limited to 5 requests/min per IP (20 with API key).',
    headers: 'x-api-key: your-api-key  // optional, for higher rate limits',
    request: null,
    response: `{
  "message": "Evaluation completed",
  "totalScore": 65,
  "verdict": "CONDITIONAL_PASS"
}`,
  },
  {
    method: 'GET',
    path: '/api/projects/[id]',
    description: 'Get a specific project with its full evaluation details.',
    request: null,
    response: `{
  "id": "clx...",
  "name": "My Project",
  "status": "completed",
  "evaluation": {
    "totalScore": 65,
    "verdict": "CONDITIONAL_PASS",
    "techScore": 14,
    "techAnalysis": "...",
    ...
  }
}`,
  },
];

const methodColors: Record<string, string> = {
  GET: 'bg-green-500/10 text-green-400 border-green-500/20',
  POST: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export default function ApiDocsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center pt-8 pb-4 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">API Documentation</h1>
        <p className="text-gray-400 text-sm">
          Integrate EvalSide into your workflow
        </p>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg">
          <span className="text-xs text-gray-500">Base URL</span>
          <code className="text-xs text-gray-300 font-mono">https://eval-side.vercel.app</code>
        </div>
      </div>

      <div className="space-y-4 animate-fade-in-delay-1">
        {endpoints.map((ep) => (
          <div key={`${ep.method}-${ep.path}`} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-800/50 bg-gray-900/50">
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase tracking-wider ${methodColors[ep.method]}`}>
                {ep.method}
              </span>
              <code className="text-white font-mono text-sm">{ep.path}</code>
            </div>
            <div className="px-5 py-4 space-y-3">
              <p className="text-gray-400 text-sm">{ep.description}</p>
              {ep.headers && (
                <div>
                  <h4 className="text-[10px] font-medium text-gray-600 uppercase tracking-wider mb-1">Headers</h4>
                  <pre className="bg-gray-800/30 rounded-lg p-3 text-xs text-gray-400 overflow-x-auto font-mono">
                    <code>{ep.headers}</code>
                  </pre>
                </div>
              )}
              {ep.request && (
                <div>
                  <h4 className="text-[10px] font-medium text-gray-600 uppercase tracking-wider mb-1">Request Body</h4>
                  <pre className="bg-gray-800/30 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto font-mono">
                    <code>{ep.request}</code>
                  </pre>
                </div>
              )}
              <div>
                <h4 className="text-[10px] font-medium text-gray-600 uppercase tracking-wider mb-1">Response</h4>
                <pre className="bg-gray-800/30 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto font-mono">
                  <code>{ep.response}</code>
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-delay-2">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-sm font-bold mb-3 text-white">Rate Limits</h2>
          <ul className="space-y-2 text-xs text-gray-400">
            <li className="flex items-center justify-between">
              <span>Project creation</span>
              <span className="text-yellow-400 font-mono">3 req/min</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Evaluation (default)</span>
              <span className="text-yellow-400 font-mono">5 req/min</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Evaluation (API key)</span>
              <span className="text-green-400 font-mono">20 req/min</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Daily global limit</span>
              <span className="text-yellow-400 font-mono">100/day</span>
            </li>
          </ul>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-sm font-bold mb-3 text-white">Error Codes</h2>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center justify-between text-gray-400">
              <code className="text-red-400 font-mono">400</code>
              <span>Invalid request</span>
            </li>
            <li className="flex items-center justify-between text-gray-400">
              <code className="text-orange-400 font-mono">403</code>
              <span>Forbidden (CSRF)</span>
            </li>
            <li className="flex items-center justify-between text-gray-400">
              <code className="text-red-400 font-mono">404</code>
              <span>Not found</span>
            </li>
            <li className="flex items-center justify-between text-gray-400">
              <code className="text-yellow-400 font-mono">429</code>
              <span>Rate limit exceeded</span>
            </li>
            <li className="flex items-center justify-between text-gray-400">
              <code className="text-red-400 font-mono">500</code>
              <span>Server error</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
