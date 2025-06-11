import type React from 'react';

const VudaLogo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <svg width="80" height="30" viewBox="0 0 80 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="22" fontFamily="Inter, sans-serif" fontSize="24" fontWeight="bold" fill="hsl(var(--primary))">
          VUDA
        </text>
      </svg>
      <span className="text-sm text-muted-foreground font-medium hidden md:inline">Public Safety Operating System</span>
    </div>
  );
};

export default VudaLogo;
