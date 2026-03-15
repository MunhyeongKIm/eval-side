import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function Header() {
  return (
    <header className="border-b border-gray-800 bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white">
          Side Project Evaluator
        </Link>
        <nav aria-label="Main navigation" className="flex gap-4 items-center">
          <Link href="/" className="text-gray-400 hover:text-white transition">Home</Link>
          <Link href="/leaderboard" className="text-yellow-400 hover:text-yellow-300 transition">🏆 Leaderboard</Link>
          <Link href="/pricing" className="text-gray-400 hover:text-white transition">Pricing</Link>
          <Link href="/api-docs" className="text-gray-400 hover:text-white transition">API Docs</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
