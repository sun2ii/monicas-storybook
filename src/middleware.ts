import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from './lib/session/config';
import { isValidUsername } from './lib/config/users';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for demo routes, API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/demo') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/get-started' ||
    pathname === '/connect-storage' ||
    pathname === '/' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Extract username from path (e.g., /monica/viewer -> monica)
  const pathParts = pathname.split('/').filter(Boolean);
  const usernameFromUrl = pathParts[0];

  // Check if this looks like a username route
  if (usernameFromUrl) {
    // Validate username exists in config
    if (!isValidUsername(usernameFromUrl)) {
      return NextResponse.redirect(new URL('/get-started', request.url));
    }

    // Get session
    const response = NextResponse.next();

    // Get the session cookie from request
    const sessionCookie = request.cookies.get(sessionOptions.cookieName);

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/get-started', request.url));
    }

    // For middleware, we'll do a simpler check - just verify the cookie exists
    // The actual session validation happens in the API routes
    // We can't use getIronSession in middleware the same way as in API routes
    // So we'll just check if the session cookie exists for now
    // Full validation happens in route handlers

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
