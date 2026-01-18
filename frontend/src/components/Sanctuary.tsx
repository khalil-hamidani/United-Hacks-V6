import { ReactNode } from 'react';

interface SanctuaryProps {
  children: ReactNode;
}

export function Sanctuary({ children }: SanctuaryProps) {
  return (
    <div className="min-h-screen bg-void relative overflow-hidden">
      <div 
        className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-lavender/20 blur-[120px] animate-pulse-slow pointer-events-none"
        aria-hidden="true"
      />
      <div 
        className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[100px] animate-pulse-slow animate-delay-200 pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
