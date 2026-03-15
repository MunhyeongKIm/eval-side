import { NextRequest, NextResponse } from 'next/server';

export default function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Existing security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CSP - allow self + inline styles/scripts for Next.js
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'"
  );

  // HSTS
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  // DNS Prefetch Control
  response.headers.set('X-DNS-Prefetch-Control', 'off');

  // CSRF protection for API POST requests
  if (request.method === 'POST' && request.nextUrl.pathname.startsWith('/api/')) {
    // Skip CSRF check for API key authenticated requests
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      const origin = request.headers.get('origin');
      const referer = request.headers.get('referer');
      const host = request.headers.get('host');

      // Build allowed origins from host header
      const allowedOrigins: string[] = [];
      if (host) {
        allowedOrigins.push(`https://${host}`, `http://${host}`);
      }
      // Also allow configured app URL
      if (process.env.NEXT_PUBLIC_APP_URL) {
        allowedOrigins.push(process.env.NEXT_PUBLIC_APP_URL);
      }

      const originValid = origin && allowedOrigins.some((allowed) => origin === allowed);
      const refererValid = referer && allowedOrigins.some((allowed) => referer.startsWith(allowed));

      if (!originValid && !refererValid) {
        return NextResponse.json(
          { error: 'Forbidden: invalid origin' },
          { status: 403 }
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: '/:path*',
};
