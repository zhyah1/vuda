// src/lib/supabase/middleware.ts
import { createMiddlewareClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/lib/supabase/database.types';

// This is your custom wrapper for creating a Supabase client in middleware
export function createSupabaseMiddlewareClient(
  req: NextRequest,
  res: NextResponse // Pass the response object to be potentially modified by cookie operations
) {
  return createMiddlewareClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // When Supabase needs to set a cookie, it should be set on the outgoing response
          res.cookies.set({ ...options, name, value });
        },
        remove(name: string, options: CookieOptions) {
          // When Supabase needs to remove a cookie, it should be removed from the outgoing response
          res.cookies.set({ ...options, name, value: '' });
        },
      },
    }
  );
}
