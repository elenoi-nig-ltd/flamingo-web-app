import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // List of protected admin routes
  const isAdminDashboardRoute = pathname.startsWith('/admin/dashboard');
  
  // List of public admin routes (login, register)
  const isPublicAdminRoute = 
    pathname.startsWith('/admin/login') || 
    pathname.startsWith('/admin/register');

  // If accessing admin dashboard routes
  if (isAdminDashboardRoute) {
    // Check if user has token in localStorage (this is checked client-side)
    // Middleware can't directly access localStorage, so we rely on the layout
    // This middleware serves as a first line of defense
    
    // Note: For more robust server-side checking, you'd need to use cookies
    // For now, the client-side layout.tsx handles the actual authentication check
    return NextResponse.next();
  }

  // Allow access to public routes
  return NextResponse.next();
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    '/admin/:path*',
    // Add other protected routes here
    '/landlord/:path*'
  ],
};
