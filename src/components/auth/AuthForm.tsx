// src/components/auth/AuthForm.tsx
'use client';

import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface AuthFormProps {
  action: (formData: FormData) => Promise<{ error?: string; message?: string }>;
  type: 'login' | 'signup';
}

export default function AuthForm({ action, type }: AuthFormProps) {
  const [message, setMessage] = useState<{ text?: string; type?: 'error' | 'success' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);
    const formData = new FormData(event.currentTarget);
    const result = await action(formData);

    if (result?.error) {
      setMessage({ text: result.error, type: 'error' });
    } else if (result?.message) {
      setMessage({ text: result.message, type: 'success' });
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{type === 'login' ? 'Login to VUDA' : 'Sign Up for VUDA'}</CardTitle>
        <CardDescription>
          {type === 'login' ? 'Enter your credentials to access your dashboard.' : 'Create an account to get started.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {message && (
            <p className={`text-sm ${message.type === 'error' ? 'text-destructive' : 'text-green-600'}`}>
              {message.text}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {type === 'login' ? 'Login' : 'Sign Up'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
