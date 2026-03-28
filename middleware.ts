import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Admin Dashboard
  if (pathname.startsWith('/admin/dashboard')) {
    const adminToken = request.cookies.get('admin_token')?.value;
    
    if (!adminToken) {
      // Redirect to admin login if no token
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    
    // In a real app, you might want to verify the token here, 
    // but Next.js middleware is edge and can't easily query DB without external API.
    // For now, presence of the specific cookie is our first line of defense.
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
