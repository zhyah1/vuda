// src/components/dashboard/Header.tsx
'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { UserCircle2, LogOut } from 'lucide-react';
import VudaLogo from './VudaLogo';
import { Button } from '@/components/ui/button';
import { logout } from '@/app/auth/actions';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const Header: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 shadow-md">
      <VudaLogo />
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.email}
            </span>
            <form action={handleLogout}>
              <Button variant="ghost" size="icon" type="submit" aria-label="Logout">
                <LogOut className="h-5 w-5 text-primary" />
              </Button>
            </form>
          </>
        ) : (
          <>
            <span className="text-sm text-foreground font-medium hidden sm:inline">Thiruvananthapuram City Operations Center</span>
            <UserCircle2 className="h-7 w-7 text-primary" />
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
