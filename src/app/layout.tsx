import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EvalSide — AI Side Project Evaluator',
  description: 'Get your side project evaluated by 6 AI specialists. Technical, market, UX, feasibility, growth, and risk analysis in one report.',
  openGraph: {
    title: 'EvalSide — AI Side Project Evaluator',
    description: 'Get your side project evaluated by 6 AI specialists. Technical, market, UX, feasibility, growth, and risk analysis in one report.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EvalSide — AI Side Project Evaluator',
    description: 'Get your side project evaluated by 6 AI specialists.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen flex flex-col`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white">Skip to main content</a>
        <ToastProvider>
          <Header />
          <main id="main-content" className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
