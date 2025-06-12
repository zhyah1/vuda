// src/app/auth/actions.ts
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginWithEmailPassword(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Redirect to dashboard on successful login
  return redirect('/dashboard');
}

export async function signupWithEmailPassword(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Email confirmation can be enabled here if desired
      // emailRedirectTo: `${new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
     return { error: "User already exists. Please try logging in."}
  }
  
  if (data.session) {
    // User is signed up and logged in
    return redirect('/dashboard');
  }
  
  // If email confirmation is required, user will not have a session immediately
  return { message: 'Check your email to confirm your account.' };
}

export async function logout() {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  await supabase.auth.signOut();
  return redirect('/');
}
