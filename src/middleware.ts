import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['km', 'en'];
const defaultLocale = 'km';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect if there is no locale
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}/login`, request.url));
  }

  return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url));
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, static assets)
    '/((?!api|_next/static|_next/image|favicon.ico|fonts|images|.*\\..*).*)',
  ],
};
