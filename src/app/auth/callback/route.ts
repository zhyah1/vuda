// src/app/auth/callback/route.ts
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard'; // Default redirect

  if (code) {
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url).toString());
    }
  }

  // URL to redirect to if an error occurs or code is missing
  const errorUrl = new URL('/auth/login', request.url);
  errorUrl.searchParams.set('error', 'Could not authenticate user. Please try again.');
  return NextResponse.redirect(errorUrl);
}
