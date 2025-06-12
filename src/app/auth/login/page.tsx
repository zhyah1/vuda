// src/app/auth/login/page.tsx
import AuthForm from '@/components/auth/AuthForm';
import { loginWithEmailPassword } from '@/app/auth/actions';
import Link from 'next/link';
import VudaLogo from '@/components/dashboard/VudaLogo';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="absolute top-6 left-6">
        <Link href="/">
          <VudaLogo />
        </Link>
      </div>
      <AuthForm action={loginWithEmailPassword} type="login" />
       {/* TODO: Add link to Sign Up page once created 
      <p className="mt-4 text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link href="/auth/signup" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
      */}
    </div>
  );
}
