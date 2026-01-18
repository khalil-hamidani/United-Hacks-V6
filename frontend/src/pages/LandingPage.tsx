import { Link } from 'react-router-dom';
import { Scale, Circle, Sparkles, Lock } from 'lucide-react';
import { BackgroundDecorations } from '../components/BackgroundDecorations';
import { useEffect, useRef, useState } from 'react';

const features = [
  {
    icon: Circle,
    title: 'Relationship Awareness',
    description: 'Track the state of your connections without judgment. See where attention is needed.',
  },
  {
    icon: Sparkles,
    title: 'Gentle AI Reflection',
    description: 'Receive calm, supportive insights. No diagnosis. No pressure. Just presence.',
  },
  {
    icon: Scale,
    title: 'Financial Obligations',
    description: 'Track debts and obligations. Ensure nothing is left unresolved when you are gone.',
  },
  {
    icon: Lock,
    title: 'Legacy Vault',
    description: 'Words for when you cannot speak them. Encrypted. Sacred. Released with intention.',
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
      
      {/* Animated background decorations - stars, hearts, birds, dots */}
      <BackgroundDecorations />
      
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
              A sanctuary for the
              <br />
              <span style={{ color: '#a78bfa' }}>connections that matter</span>
            </h1>
            
            <p 
              className="text-sm md:text-base lg:text-lg mb-8 md:mb-10 max-w-xl mx-auto stagger-3"
              style={{ color: '#9ca3af', lineHeight: '1.75' }}
            >
              This is not a social network. It is a quiet space to reflect on your relationships, 
              check in with yourself, and leave messages for those you love.
            </p>
            
            <div className="stagger-3">
              <Link to="/register" className="calm-button-primary">
                Enter the Sanctuary
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

        {/* ============================================ */}
        {/* SECTION 1 — Unspoken Words */}
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
                      alt="Unspoken words illustration" 
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
                  Never keep your unspoken words.
                </h2>
                
                <div 
                  className="space-y-6"
                  style={{ color: '#b8b8c0', lineHeight: '1.9' }}
                >
                  <p className="text-sm md:text-base">
                    Some words stay quiet not because they are unimportant,
                    but because the moment never felt right.
                  </p>
                  
                  <p className="text-sm md:text-base" style={{ color: '#9090a0' }}>
                    A thank you you meant to say.
                    <br />
                    An apology you rehearsed but never sent.
                    <br />
                    A truth you carried for years.
                  </p>
                  
                  <p className="text-sm md:text-base">
                    This space exists so those words do not disappear with time.
                  </p>
                </div>
                
                <div className="space-y-2 pt-4">
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400" style={{ filter: 'drop-shadow(0 0 4px rgba(167, 139, 250, 0.6))' }}>✦</span>
                    <p className="text-xs md:text-sm" style={{ color: '#6b7280' }}>You do not have to send them.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400" style={{ filter: 'drop-shadow(0 0 4px rgba(167, 139, 250, 0.6))' }}>✦</span>
                    <p className="text-xs md:text-sm" style={{ color: '#6b7280' }}>You just have to let them exist.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION 2 — Emotional Intelligence */}
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
                  Emotional intelligence begins with noticing.
                </h2>
                
                <p 
                  className="text-sm md:text-base"
                  style={{ color: '#b8b8c0', lineHeight: '1.9' }}
                >
                  This is not about expressing everything.
                  <br />
                  It is about recognizing what matters before it fades.
                </p>
                
                <p 
                  className="text-sm md:text-base"
                  style={{ color: '#9090a0', lineHeight: '1.9' }}
                >
                  Which relationships feel steady.
                  <br />
                  Which feel distant.
                  <br />
                  Which carry weight you have been avoiding.
                </p>
                
                <p 
                  className="text-sm md:text-base"
                  style={{ color: '#b8b8c0', lineHeight: '1.9' }}
                >
                  Awareness comes before action.
                  <br />
                  And sometimes, awareness is enough.
                </p>
                
                <div className="space-y-2 pt-4">
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400" style={{ filter: 'drop-shadow(0 0 4px rgba(167, 139, 250, 0.6))' }}>✦</span>
                    <p className="text-xs md:text-sm" style={{ color: '#6b7280' }}>No labels.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400" style={{ filter: 'drop-shadow(0 0 4px rgba(167, 139, 250, 0.6))' }}>✦</span>
                    <p className="text-xs md:text-sm" style={{ color: '#6b7280' }}>No judgment.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400" style={{ filter: 'drop-shadow(0 0 4px rgba(167, 139, 250, 0.6))' }}>✦</span>
                    <p className="text-xs md:text-sm" style={{ color: '#6b7280' }}>Just clarity.</p>
                  </div>
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
                      alt="Emotional intelligence illustration" 
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
        {/* SECTION 3 — Even After You Go */}
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
                      alt="Legacy vault illustration" 
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
                  Even after you go, you can still make things right.
                </h2>
                
                <div 
                  className="space-y-6"
                  style={{ color: '#b8b8c0', lineHeight: '1.9' }}
                >
                  <p className="text-sm md:text-base">
                    Life does not always leave room for closure.
                  </p>
                  
                  <p className="text-sm md:text-base" style={{ color: '#9090a0' }}>
                    Sometimes we leave too early.
                    <br />
                    Sometimes we run out of courage.
                    <br />
                    Sometimes we assume there will be more time.
                  </p>
                  
                  <p className="text-sm md:text-base">
                    This space exists for the words you would want carried forward —
                    gently, privately, and only if the time comes.
                  </p>
                </div>
                
                <div className="space-y-2 pt-4">
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400" style={{ filter: 'drop-shadow(0 0 4px rgba(167, 139, 250, 0.6))' }}>✦</span>
                    <p className="text-xs md:text-sm" style={{ color: '#6b7280' }}>Nothing here is automatic.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400" style={{ filter: 'drop-shadow(0 0 4px rgba(167, 139, 250, 0.6))' }}>✦</span>
                    <p className="text-xs md:text-sm" style={{ color: '#6b7280' }}>Nothing is released without intention.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 md:py-16 flex flex-col items-center justify-center relative">
          <p 
            className="font-script text-sm md:text-base mb-3"
            style={{ color: '#6b7280' }}
          >
            Built with heart, not haste
          </p>
          <p 
            className="text-[0.65rem] md:text-xs"
            style={{ color: '#4b5563', letterSpacing: '0.05em' }}
          >
            Some things deserve to be handled carefully.
          </p>

        </footer>
      </div>
    </div>
  );
}
