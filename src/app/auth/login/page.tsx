// src/app/auth/login/page.tsx
'use client';

import AuthForm from '@/components/auth/AuthForm';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import VudaLogo from '@/components/dashboard/VudaLogo';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/dashboard');
      }
    };
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          router.replace('/dashboard');
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="absolute top-6 left-6">
        <Link href="/">
          <VudaLogo />
        </Link>
      </div>
      <div className="w-full max-w-md">
        <AuthForm />
      </div>
       <footer className="absolute bottom-0 py-6 text-center w-full text-muted-foreground text-sm">
        &copy; {new Date().getFullYear()} VUDA Platform by SocioDynamics AI. All rights reserved.
      </footer>
    </div>
  );
}
