// src/app/auth/actions.ts
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { AuthError } from '@supabase/supabase-js';

interface AuthResponse {
  error?: string;
}

export async function signIn(formData: {email: string, password: string}): Promise<AuthResponse | void> {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    console.error('Sign in error:', error.message);
    return { error: error.message };
  }

  // Successful sign-in will be handled by middleware redirection
  // or client-side routing based on auth state changes.
  // Forcing redirect here can sometimes conflict with middleware.
  // It might be better to rely on the middleware to redirect to /dashboard
  // after the session is established.
  // However, if direct redirect is needed:
  redirect('/dashboard');
}

export async function signUp(formData: {email: string, password: string}): Promise<AuthResponse> {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  // Supabase handles email confirmation by default if enabled in your project settings
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      // emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`, // Use your site's base URL
    },
  });

  if (error) {
    console.error('Sign up error:', error.message);
    return { error: error.message };
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
     return { error: "User already exists with this email address. Please try signing in." };
  }
  
  // If email confirmation is required, user will be in a pending state.
  // Otherwise, they are signed in.
  // No explicit redirect here; auth state change will handle it or message will be shown on form.
  return {}; 
}

export async function signOut(): Promise<void> {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  await supabase.auth.signOut();
  redirect('/');
}
