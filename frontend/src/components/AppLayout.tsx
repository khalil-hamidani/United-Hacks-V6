import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';
import { BackgroundDecorations } from './BackgroundDecorations';
import Aurora from './Aurora';

export function AppLayout() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Aurora WebGL Background */}
      <Aurora
        colorStops={['#6b46c1', '#8b5cf6', '#6b46c1']}
        speed={0.7}
        amplitude={0.9}
        blend={0.45}
      />
      
      {/* Animated background decorations */}
      <BackgroundDecorations />
      
      {/* Background gradient blobs */}
      <div 
        className="fixed top-[-10%] left-[30%] w-[600px] h-[600px] rounded-full blur-[120px] animate-float pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)', zIndex: 1 }}
      />
      <div 
        className="fixed bottom-[-20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[100px] animate-float pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
          animationDelay: '-12s',
          zIndex: 1
        }}
      />
      
      {/* Subtle light spots */}
      <div 
        className="fixed top-[20%] right-[30%] w-1.5 h-1.5 rounded-full animate-pulse-slow pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.2)', zIndex: 1 }}
      />
      <div 
        className="fixed bottom-[40%] left-[40%] w-1 h-1 rounded-full animate-pulse-slow pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.15)', animationDelay: '-4s', zIndex: 1 }}
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
