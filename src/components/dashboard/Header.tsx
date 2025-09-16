// src/components/dashboard/Header.tsx
'use client';

import type React from 'react';
import Link from 'next/link';
import { LayoutGrid, UserCircle2 } from 'lucide-react';
import VudaLogo from './VudaLogo';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const Header: React.FC = () => {
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 shadow-md">
      <Link href="/dashboard">
        <VudaLogo />
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/dashboard/upload">
          <Button variant="outline" size="sm">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Multi-Cam Analysis
          </Button>
        </Link>
        
        <span className="text-sm text-foreground font-medium hidden sm:inline">
          Thiruvananthapuram City Operations Center
        </span>
        <UserCircle2 className="h-7 w-7 text-primary" />

      </div>
    </header>
  );
};

export default Header;
