import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Admin Dashboard
  if (pathname.startsWith('/admin/dashboard')) {
    const adminToken = request.cookies.get('admin_token')?.value;
    
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (!adminUser || !adminPass) {
      console.error("Admin credentials not configured in .env");
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    const expectedToken = Buffer.from(`${adminUser}:${adminPass}`).toString("base64");

    if (!adminToken || adminToken !== expectedToken) {
      // Redirect to admin login if no token or invalid token
      return NextResponse.redirect(new URL('/admin', request.url));
    }
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
