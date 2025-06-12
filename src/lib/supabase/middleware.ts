// src/lib/supabase/middleware.ts
// Attempting direct import to bypass potential bundler issues with package.json exports
import { createMiddlewareClient } from '@supabase/ssr/dist/module/index.mjs';
import type { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/lib/supabase/database.types';

// This is your custom wrapper for creating a Supabase client in middleware
export function createSupabaseMiddlewareClient(
  req: NextRequest,
  res: NextResponse // Pass the response object to be potentially modified by cookie operations
) {
  // The createMiddlewareClient from @supabase/ssr is generic, so we pass Database type here
  return createMiddlewareClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          // When Supabase needs to set a cookie, it should be set on the outgoing response
          req.cookies.set({ ...options, name, value }); // Also update request cookies for current request processing
          res.cookies.set({ ...options, name, value });
        },
        remove(name: string, options) {
          // When Supabase needs to remove a cookie, it should be removed from the outgoing response
          req.cookies.set({ ...options, name, value: '' }); // Also update request cookies for current request processing
          res.cookies.set({ ...options, name, value: '' }); // Effectively deleting by setting an empty value with expiry options
        },
      },
    }
  );
}
