import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800/50 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                E
              </div>
              <span className="text-lg font-bold text-white">EvalSide</span>
            </div>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
              AI-powered side project evaluation platform. Analyze from 6 expert perspectives and estimate real-world value.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/leaderboard" className="text-gray-500 hover:text-gray-300 transition">Leaderboard</Link></li>
              <li><Link href="/pricing" className="text-gray-500 hover:text-gray-300 transition">Pricing</Link></li>
              <li><Link href="/api-docs" className="text-gray-500 hover:text-gray-300 transition">API Docs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://github.com/MunhyeongKIm/eval-side" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-300 transition">GitHub</a></li>
              <li><Link href="/api-docs" className="text-gray-500 hover:text-gray-300 transition">Documentation</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800/50 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} EvalSide. Built with Next.js &amp; AI.
          </p>
          <p className="text-xs text-gray-700">
            Powered by multi-agent AI evaluation
          </p>
        </div>
      </div>
    </footer>
  );
}
