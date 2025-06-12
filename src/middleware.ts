// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession, createSupabaseReqResClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Update user's session
  const response = await updateSession(request);
  
  // Create a Supabase client for the current request-response cycle
  const supabase = createSupabaseReqResClient(request, response);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Define protected and auth routes
  const protectedRoutes = ['/dashboard'];
  const authRoutes = ['/auth/login', '/auth/signup']; // Assuming you might add a dedicated signup page

  // If trying to access a protected route and not logged in, redirect to login
  if (!user && protectedRoutes.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If logged in and trying to access an auth route, redirect to dashboard
  if (user && authRoutes.some(path => pathname.startsWith(path))) {
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
