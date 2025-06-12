// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export function createSupabaseServerClient(cookieStoreParam?: ReturnType<typeof cookies>) {
  const cookieStore = cookieStoreParam || cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not defined. Please set it in your .env file.'
    );
  }
  if (!supabaseAnonKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined. Please set it in your .env file.'
    );
  }

  try {
    new URL(supabaseUrl);
  } catch (e: any) {
    console.error('Original Supabase URL parsing error in createSupabaseServerClient:', e);
    const originalErrorMessage = e instanceof Error ? e.message : String(e);
    throw new Error(
      `Invalid Supabase URL format for environment variable NEXT_PUBLIC_SUPABASE_URL. Provided value: "${supabaseUrl}". Original error: ${originalErrorMessage}. Please ensure it's a complete and valid URL (e.g., starts with https://). Check your .env file.`
    );
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
