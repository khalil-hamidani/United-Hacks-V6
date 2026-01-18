import { Link } from 'react-router-dom';
import { Scale, Circle, Sparkles, Lock } from 'lucide-react';
import { BackgroundDecorations } from '../components/BackgroundDecorations';
import { useEffect, useRef, useState } from 'react';

const features = [
  {
    icon: Circle,
    title: 'Track Relationships',
    description: 'Add people who matter. Mark when you last connected. Notice who needs attention.',
  },
  {
    icon: Sparkles,
    title: 'Private Messages',
    description: "Write things you need to say but aren't ready to send. Keep them or send them later.",
  },
  {
    icon: Scale,
    title: 'Financial Records',
    description: 'Track debts and obligations so nothing is forgotten or left unresolved.',
  },
  {
    icon: Lock,
    title: 'Legacy Vault',
    description: 'Messages delivered only if something happens to you. Encrypted until then.',
  },
];




export function LandingPage() {
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  
  const [section1Visible, setSection1Visible] = useState(false);
  const [section2Visible, setSection2Visible] = useState(false);
  const [section3Visible, setSection3Visible] = useState(false);
  
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target === section1Ref.current) setSection1Visible(true);
          if (entry.target === section2Ref.current) setSection2Visible(true);
          if (entry.target === section3Ref.current) setSection3Visible(true);
        }
      });
    }, observerOptions);
    
    if (section1Ref.current) observer.observe(section1Ref.current);
    if (section2Ref.current) observer.observe(section2Ref.current);
    if (section3Ref.current) observer.observe(section3Ref.current);
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="fixed inset-0 w-full h-full z-0"
        style={{
          backgroundImage: 'url(/bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Soft Blur Overlay */}
      <div 
        className="fixed inset-0 w-full h-full z-0"
        style={{
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          background: 'rgba(0, 0, 0,0.5)'
        }}
      />
      
      
      {/* Content */}
      <div className="relative z-10 flex flex-col">
        {/* Header */}
        <header className="p-4 md:p-6 lg:p-8 flex justify-between items-center stagger-1">
          <div className="flex items-center gap-3">
            <img 
              src="/logo2.png" 
              alt="I Am Only Human" 
              className="h-8 md:h-15 w-auto"
            />
          </div>
          <nav className="flex items-center gap-4 md:gap-6">
            <Link to="/login" className="nav-link">
              Enter
            </Link>
            <Link to="/register" className="calm-button">
              Begin
            </Link>
          </nav>
        </header>

        {/* Hero */}
        <main className="flex flex-col items-center justify-center px-4 md:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl">
            <h1 className="font-serif-display text-3xl md:text-5xl lg:text-[3.5rem] font-medium text-white tracking-tight leading-[1.15] mb-5 md:mb-6 stagger-2">
              A private space for your
              <br />
              <span style={{ color: '#a78bfa' }}>relationships and legacy</span>
            </h1>
            
            <p 
              className="text-sm md:text-base lg:text-lg mb-8 md:mb-10 max-w-2xl mx-auto stagger-3"
              style={{ color: '#d1d5db', lineHeight: '1.8' }}
            >
              Track the people who matter to you. Write messages you're not ready to send. 
              Leave words for when you're gone. Everything stays private until you decide otherwise.
            </p>
            
            <div className="stagger-3">
              <Link to="/register" className="calm-button-primary">
                Create Your Space
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mt-16 md:mt-24 max-w-3xl w-full px-2">
            {features.map(({ icon: Icon, title, description }, index) => (
              <div 
                key={title} 
                className={`glass-panel p-5 md:p-6 group stagger-${index + 2}`}
              >
                <Icon 
                  size={22} 
                  strokeWidth={1.5} 
                  className="mb-4 transition-all duration-400 group-hover:scale-110" 
                  style={{ color: '#a78bfa' }}
                />
                <h3 className="text-sm md:text-base font-medium text-white mb-1.5">
                  {title}
                </h3>
                <p 
                  className="text-xs md:text-sm"
                  style={{ color: '#9ca3af', lineHeight: '1.6' }}
                >
                  {description}
                </p>
              </div>
            ))}
          </div>
        </main>

        {/* Clarity Section - What this is / What this is not */}
        <section className="py-16 md:py-20 px-6 md:px-12 relative">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {/* What this is */}
              <div className="space-y-4">
                <h3 
                  className="text-xs uppercase tracking-[0.2em] mb-6"
                  style={{ color: '#6b7280' }}
                >
                  What this is
                </h3>
                <div className="space-y-3">
                  <p className="text-sm md:text-base" style={{ color: '#d1d5db', lineHeight: '1.7' }}>
                    A place to notice which relationships feel steady and which feel distant.
                  </p>
                  <p className="text-sm md:text-base" style={{ color: '#d1d5db', lineHeight: '1.7' }}>
                    A way to write things down before you forget or lose the courage.
                  </p>
                  <p className="text-sm md:text-base" style={{ color: '#d1d5db', lineHeight: '1.7' }}>
                    A vault for messages that get delivered only if something happens to you.
                  </p>
                </div>
              </div>

              {/* What this is not */}
              <div className="space-y-4">
                <h3 
                  className="text-xs uppercase tracking-[0.2em] mb-6"
                  style={{ color: '#6b7280' }}
                >
                  What this is not
                </h3>
                <div className="space-y-3">
                  <p className="text-sm md:text-base" style={{ color: '#9ca3af', lineHeight: '1.7' }}>
                    Not a social network. No one sees your activity.
                  </p>
                  <p className="text-sm md:text-base" style={{ color: '#9ca3af', lineHeight: '1.7' }}>
                    Not therapy. Just a quiet tool for awareness.
                  </p>
                  <p className="text-sm md:text-base" style={{ color: '#9ca3af', lineHeight: '1.7' }}>
                    Not urgent. Nothing here pressures you to act.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION 1 — Messages You're Not Ready to Send */}
        {/* ============================================ */}
        <section ref={section1Ref} className="py-28 md:py-40 px-6 md:px-12 relative">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
              {/* Left - Illustration */}
              <div 
                className="flex items-center justify-center"
                style={{
                  opacity: section1Visible ? 1 : 0,
                  transform: section1Visible ? 'translateX(0) scale(1)' : 'translateX(-50px) scale(0.9)',
                  transition: 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                <div className="relative">
                  {/* Glowing circle container */}
                  <div 
                    className="relative w-72 h-72 md:w-84 md:h-84 rounded-full flex items-center justify-center"
                    style={{
                      background: 'radial-gradient(circle, rgba(100, 70, 150, 0.25) 0%, rgba(80, 50, 120, 0.15) 30%, rgba(60, 40, 100, 0.08) 60%, transparent 100%)',
                      boxShadow: '0 0 100px rgba(139, 92, 246, 0.4), 0 0 200px rgba(139, 92, 246, 0.2), inset 0 0 80px rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(167, 139, 250, 0.3)',
                      backdropFilter: 'blur(20px)'
                    }}
                  >
                    <img 
                      src="/unspoken-words.png" 
                      alt="Messages illustration" 
                      className="w-48 h-48 md:w-56 md:h-56 object-contain"
                      style={{ filter: 'drop-shadow(0 0 20px rgba(167, 139, 250, 0.4))' }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Right - Content */}
              <div 
                className="space-y-6"
                style={{
                  opacity: section1Visible ? 1 : 0,
                  transform: section1Visible ? 'translateX(0)' : 'translateX(50px)',
                  transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s'
                }}
              >
                <h2 
                  className="font-serif-display text-2xl md:text-3xl lg:text-4xl font-medium text-white tracking-tight leading-snug"
                >
                  Write it down, even if you never send it.
                </h2>
                
                <div 
                  className="space-y-5"
                  style={{ color: '#d1d5db', lineHeight: '1.8' }}
                >
                  <p className="text-sm md:text-base">
                    Sometimes you need to say something but the timing isn't right.
                    Or you're not sure how they'll react. Or you just need to get it out of your head.
                  </p>
                  
                  <p className="text-sm md:text-base">
                    Write messages to the people in your life. Keep them private. 
                    Send them when you're ready, or never send them at all.
                  </p>
                  
                  <p className="text-sm md:text-base" style={{ color: '#b8b8c0' }}>
                    The act of writing it down is often enough.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION 2 — Track Your Relationships */}
        {/* ============================================ */}
        <section ref={section2Ref} className="py-24 md:py-36 px-6 md:px-12 relative">
          {/* Subtle divider lines */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-24 md:w-32 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}
          />
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 md:w-32 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}
          />
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
              {/* Left - Content */}
              <div 
                className="space-y-6"
                style={{
                  opacity: section2Visible ? 1 : 0,
                  transform: section2Visible ? 'translateX(0)' : 'translateX(-50px)',
                  transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s'
                }}
              >
                <h2 
                  className="font-serif-display text-2xl md:text-3xl lg:text-4xl font-medium text-white tracking-tight leading-snug"
                >
                  See which relationships need attention.
                </h2>
                
                <div
                  className="space-y-5"
                  style={{ color: '#d1d5db', lineHeight: '1.8' }}
                >
                  <p className="text-sm md:text-base">
                    Add the people who matter to you. Mark when you last connected. 
                    Notice patterns you might have missed.
                  </p>
                  
                  <p className="text-sm md:text-base">
                    This isn't about productivity or optimization. 
                    It's about awareness. Sometimes just seeing it written down is enough to know what to do next.
                  </p>
                  
                  <p className="text-sm md:text-base" style={{ color: '#b8b8c0' }}>
                    No reminders. No guilt. Just a quiet place to check in with yourself.
                  </p>
                </div>
              </div>
              
              {/* Right - Illustration */}
              <div 
                className="flex items-center justify-center"
                style={{
                  opacity: section2Visible ? 1 : 0,
                  transform: section2Visible ? 'translateX(0) scale(1) rotateY(0deg)' : 'translateX(50px) scale(0.85) rotateY(15deg)',
                  transition: 'all 1.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s'
                }}
              >
                <div className="relative">
                  {/* Glowing circle container */}
                  <div 
                    className="relative w-72 h-72 md:w-84 md:h-84 rounded-full flex items-center justify-center"
                    style={{
                      background: 'radial-gradient(circle, rgba(100, 70, 150, 0.25) 0%, rgba(80, 50, 120, 0.15) 30%, rgba(60, 40, 100, 0.08) 60%, transparent 100%)',
                      boxShadow: '0 0 100px rgba(139, 92, 246, 0.4), 0 0 200px rgba(139, 92, 246, 0.2), inset 0 0 80px rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(167, 139, 250, 0.3)',
                      backdropFilter: 'blur(20px)'
                    }}
                  >
                    <img 
                      src="/emotional-intelligence.png" 
                      alt="Relationship tracking illustration" 
                      className="w-48 h-48 md:w-56 md:h-56 object-contain"
                      style={{ filter: 'drop-shadow(0 0 20px rgba(167, 139, 250, 0.4))' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION 3 — Legacy Messages */}
        {/* ============================================ */}
        <section ref={section3Ref} className="py-28 md:py-40 px-6 md:px-12 relative">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
              {/* Left - Illustration */}
              <div 
                className="flex items-center justify-center"
                style={{
                  opacity: section3Visible ? 1 : 0,
                  transform: section3Visible ? 'translateY(0) scale(1)' : 'translateY(60px) scale(0.8)',
                  transition: 'all 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                <div className="relative">
                  {/* Glowing circle container */}
                  <div 
                    className="relative w-72 h-72 md:w-84 md:h-84 rounded-full flex items-center justify-center"
                    style={{
                      background: 'radial-gradient(circle, rgba(100, 70, 150, 0.25) 0%, rgba(80, 50, 120, 0.15) 30%, rgba(60, 40, 100, 0.08) 60%, transparent 100%)',
                      boxShadow: '0 0 100px rgba(139, 92, 246, 0.4), 0 0 200px rgba(139, 92, 246, 0.2), inset 0 0 80px rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(167, 139, 250, 0.3)',
                      backdropFilter: 'blur(20px)'
                    }}
                  >
                    <img 
                      src="/legacy-vault.png" 
                      alt="Legacy messages illustration" 
                      className="w-48 h-48 md:w-56 md:h-56 object-contain"
                      style={{ filter: 'drop-shadow(0 0 20px rgba(167, 139, 250, 0.4))' }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Right - Content */}
              <div 
                className="space-y-6"
                style={{
                  opacity: section3Visible ? 1 : 0,
                  transform: section3Visible ? 'translateY(0)' : 'translateY(40px)',
                  transition: 'all 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s'
                }}
              >
                <h2 
                  className="font-serif-display text-2xl md:text-3xl lg:text-4xl font-medium text-white tracking-tight leading-snug"
                >
                  Leave messages for after you're gone.
                </h2>
                
                <div 
                  className="space-y-5"
                  style={{ color: '#d1d5db', lineHeight: '1.8' }}
                >
                  <p className="text-sm md:text-base">
                    Write letters to be delivered only if something happens to you. 
                    Encrypted and stored securely. Released only through a process you control.
                  </p>
                  
                  <p className="text-sm md:text-base">
                    An apology you want them to hear. 
                    Instructions for what to do with your things. 
                    Words you'd want them to remember you by.
                  </p>
                  
                  <p className="text-sm md:text-base" style={{ color: '#b8b8c0' }}>
                    You decide who receives what, and when. Nothing happens automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Closing Section - Lingering Thought */}
        <section className="py-20 md:py-28 px-6 md:px-12 relative">
          <div className="max-w-2xl mx-auto text-center">
            <p 
              className="font-serif-display text-lg md:text-xl lg:text-2xl font-normal text-white leading-relaxed"
              style={{ lineHeight: '1.7' }}
            >
              We spend our lives managing what's visible.
              <br />
              This is a place for everything else.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 md:py-16 flex flex-col items-center justify-center relative">
          <p 
            className="text-xs"
            style={{ color: '#6b7280', letterSpacing: '0.08em' }}
          >
            I Am Only Human
          </p>

        </footer>
      </div>
    </div>
  );
}
