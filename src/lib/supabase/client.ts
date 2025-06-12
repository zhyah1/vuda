// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

export function createSupabaseBrowserClient() {
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
    console.error('Original Supabase URL parsing error in createSupabaseBrowserClient:', e);
    const originalErrorMessage = e instanceof Error ? e.message : String(e);
    throw new Error(
      `Invalid Supabase URL format for environment variable NEXT_PUBLIC_SUPABASE_URL. Provided value: "${supabaseUrl}". Original error: ${originalErrorMessage}. Please ensure it's a complete and valid URL (e.g., starts with https://). Check your .env file.`
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
