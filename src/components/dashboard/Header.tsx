// src/components/dashboard/Header.tsx
'use client';

import type React from 'react';
import { UserCircle2 } from 'lucide-react';
import VudaLogo from './VudaLogo';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 shadow-md">
      <VudaLogo />
      <div className="flex items-center gap-3">
        <span className="text-sm text-foreground font-medium hidden sm:inline">Thiruvananthapuram City Operations Center</span>
        <UserCircle2 className="h-7 w-7 text-primary" />
      </div>
    </header>
  );
};

export default Header;
