import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';
import { BackgroundDecorations } from './BackgroundDecorations';

// 4-pointed star decoration
const StarDecoration = () => (
  <svg 
    width="36" 
    height="36" 
    viewBox="0 0 24 24" 
    fill="none" 
    className="animate-twinkle"
    style={{ color: 'rgba(255,255,255,0.35)' }}
  >
    <path 
      d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z" 
      fill="currentColor"
    />
  </svg>
);

export function AppLayout() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background decorations */}
      <BackgroundDecorations />
      
      {/* Background gradient blobs */}
      <div 
        className="fixed top-[-10%] left-[30%] w-[600px] h-[600px] rounded-full blur-[120px] animate-float pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)' }}
      />
      <div 
        className="fixed bottom-[-20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[100px] animate-float pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
          animationDelay: '-12s'
        }}
      />
      
      {/* Subtle light spots */}
      <div 
        className="fixed top-[20%] right-[30%] w-1.5 h-1.5 rounded-full animate-pulse-slow pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.2)' }}
      />
      <div 
        className="fixed bottom-[40%] left-[40%] w-1 h-1 rounded-full animate-pulse-slow pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.15)', animationDelay: '-4s' }}
      />
      
      <Sidebar />
      
      <main className="min-h-screen p-6 pt-20 md:pt-8 md:pl-64 md:pr-8 relative z-10">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
