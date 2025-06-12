// src/lib/supabase/middleware.ts
import { createMiddlewareClient } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/lib/supabase/database.types';

export async function createSupabaseMiddlewareClient(
  req: NextRequest,
  res: NextResponse
) {
  return createMiddlewareClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );
}

// Utility to update session in middleware
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createMiddlewareClient(request, response);

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession();

  return response;
}
