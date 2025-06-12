// src/lib/supabase/middleware.ts
// Note: The "createMiddlewareClient" export issue from "@supabase/ssr" might be related to
// your Next.js version (15.3.3 which is pre-release) and its interaction with the
// @supabase/ssr package (0.4.0) in the edge runtime.
// If errors persist around "createMiddlewareClient" not being found, consider:
// 1. Deleting `node_modules` and `package-lock.json` (or `yarn.lock`/`pnpm-lock.yaml`) and reinstalling.
// 2. Trying a stable version of Next.js (e.g., latest 14.x.x or a stable 15.x.x if available).
// 3. Checking for open issues on Next.js and Supabase GitHub repositories.
// This file provides wrappers for creating Supabase clients in middleware.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './database.types';

function initializeSupabaseClient(
  request: NextRequest,
  response: NextResponse,
  type: 'updateSession' | 'reqResClient'
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL is not defined (checked in ${type}). Please set it in your .env file.`
    );
  }
  if (!supabaseAnonKey) {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined (checked in ${type}). Please set it in your .env file.`
    );
  }

  try {
    new URL(supabaseUrl);
  } catch (e: any) {
    console.error(`Original Supabase URL parsing error in Supabase middleware helper (${type}):`, e);
    const originalErrorMessage = e instanceof Error ? e.message : String(e);
    throw new Error(
      `Invalid Supabase URL format for environment variable NEXT_PUBLIC_SUPABASE_URL (checked in ${type}). Provided value: "${supabaseUrl}". Original error: ${originalErrorMessage}. Please ensure it's a complete and valid URL (e.g., starts with https://). Check your .env file.`
    );
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // For updateSession, response is mutated directly.
        // For createSupabaseReqResClient, it's a fresh response object.
        if (type === 'updateSession' || response instanceof NextResponse) {
          response.cookies.set({ name, value, ...options });
        }
         // Also update request cookies for consistency within the current request lifecycle for `updateSession`
        if (type === 'updateSession') {
            request.cookies.set({ name, value, ...options });
        }
      },
      remove(name: string, options: CookieOptions) {
        if (type === 'updateSession' || response instanceof NextResponse) {
            response.cookies.set({ name, value: '', ...options });
        }
        if (type === 'updateSession') {
            request.cookies.set({ name, value: '', ...options });
        }
      },
    },
  });
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = initializeSupabaseClient(request, response, 'updateSession');
  
  // Important: The `getResponse` method is deprecated.
  // Session refresh is handled by `supabase.auth.getUser()` or similar calls.
  // https://supabase.com/docs/guides/auth/server-side/nextjs#managing-session-with-middleware
  await supabase.auth.getUser();

  return response;
}

export function createSupabaseReqResClient(
  request: NextRequest,
  response: NextResponse
) {
  // This function is intended to be called when you have both request and a response object
  // that you intend to return from the middleware, and you need a Supabase client scoped to them.
  return initializeSupabaseClient(request, response, 'reqResClient');
}
