// src/middleware.ts
import { type NextRequest, NextResponse } from 'next/server';
import { createSupabaseMiddlewareClient } from '@/lib/supabase/middleware'; // Your wrapper

export async function middleware(request: NextRequest) {
  // Create a response object that can be modified by Supabase
  // This response object will be passed to your wrapper
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Get Supabase client (and allow it to modify the response with new cookies)
  const supabase = await createSupabaseMiddlewareClient(request, response);

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Define public paths that don't require authentication
  const publicPaths = ['/', '/auth/login', '/auth/signup', '/auth/callback'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // If user is not authenticated and trying to access a protected route
  if (!session && !isPublicPath) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('message', 'Please log in to access this page.');
    if (pathname.startsWith('/dashboard')) {
      loginUrl.searchParams.set('redirect_to', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and tries to access login/signup, redirect to dashboard
  if (session && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Return the response, which may have been modified by Supabase (e.g., with new session cookies)
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
