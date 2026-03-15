import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-gray-800 bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white">
          사이드 프로젝트 평가기
        </Link>
        <nav className="flex gap-4">
          <Link href="/" className="text-gray-400 hover:text-white transition">홈</Link>
        </nav>
      </div>
    </header>
  );
}
