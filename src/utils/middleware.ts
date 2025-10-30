// typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect landlord area
  if (pathname.startsWith('/landlords')) {
    const token = req.cookies.get('token')?.value;
    if (!token && !pathname.startsWith('/landlords/login') && !pathname.startsWith('/landlords/register')) {
      const url = req.nextUrl.clone();
      url.pathname = '/landlords/login';
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/landlords/:path*'],
};
