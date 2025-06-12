// src/middleware.ts
import { type NextRequest, NextResponse } from 'next/server';
import { createSupabaseMiddlewareClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createSupabaseMiddlewareClient(request, NextResponse.next());

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Define public paths that don't require authentication
  const publicPaths = ['/', '/auth/login', '/auth/signup', '/auth/callback'];

  // If user is not authenticated and trying to access a protected route
  if (!session && !publicPaths.some(path => pathname.startsWith(path)) && pathname !== '/dashboard') {
     if (pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
     }
  }
  
  if (!session && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login?message=Please log in to view the dashboard', request.url));
  }


  // If user is authenticated and tries to access login/signup, redirect to dashboard
  if (session && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
