import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Wind, Circle, Sparkles, Lock, LogOut, Menu, X, Scale, Beaker } from 'lucide-react';
import { authApi } from '../api';

const navItems = [
  { path: '/dashboard', label: 'Presence', icon: Wind },
  { path: '/checkin', label: 'Awareness', icon: Sparkles },
  { path: '/obligations', label: 'Obligations', icon: Scale },
  { path: '/relationships', label: 'Connections', icon: Circle },
  { path: '/legacy', label: 'Vault', icon: Lock },
  { path: '/demo', label: 'Demo', icon: Beaker },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    authApi.logout();
    navigate('/');
  };

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-3 rounded-xl md:hidden"
        style={{ 
          backgroundColor: 'rgba(10, 10, 15, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        {isOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 md:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-screen w-56 p-6 flex flex-col z-40 transition-transform duration-500 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ 
          backgroundColor: 'rgba(10, 10, 15, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        {/* Logo */}
        <div className="mb-10 mt-2 md:mt-0">
          <h1 className="text-base font-medium text-white tracking-tight">
            I Am Only Human
          </h1>
          <p 
            className="text-[0.65rem] mt-1 tracking-[0.2em] uppercase"
            style={{ color: '#6b7280' }}
          >
            Sanctuary
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path || 
              (path === '/relationships' && location.pathname.startsWith('/relationships')) ||
              (path === '/obligations' && location.pathname.startsWith('/obligations'));
            return (
              <Link
                key={path}
                to={path}
                onClick={closeSidebar}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} strokeWidth={1.5} />
                <span className="text-sm">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="sidebar-nav-item"
          style={{ marginTop: 'auto' }}
        >
          <LogOut size={18} strokeWidth={1.5} />
          <span className="text-sm">Leave</span>
        </button>
      </aside>
    </>
  );
}
