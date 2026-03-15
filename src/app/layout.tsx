import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import { ToastProvider } from '@/components/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Side Project Evaluator',
  description: 'Analyze and evaluate your side projects from multiple perspectives',
  openGraph: {
    title: 'Side Project Evaluator',
    description: 'Analyze and evaluate your side projects from multiple perspectives',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Side Project Evaluator',
    description: 'Analyze and evaluate your side projects from multiple perspectives',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white">Skip to main content</a>
        <ToastProvider>
          <Header />
          <main id="main-content" className="max-w-6xl mx-auto px-4 py-8">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
