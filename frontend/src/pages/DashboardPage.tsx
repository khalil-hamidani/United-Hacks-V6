import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Circle, Scale, Lock, Wind } from 'lucide-react';
import { authApi, checkinApi, relationshipsApi } from '../api';
import type { User, CheckinStatus, Relationship } from '../types';

export function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checkin, setCheckin] = useState<CheckinStatus | null>(null);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, checkinData, relData] = await Promise.all([
          authApi.getMe(),
          checkinApi.getStatus(),
          relationshipsApi.list(),
        ]);
        setUser(userData);
        setCheckin(checkinData);
        setRelationships(relData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div 
          className="w-4 h-4 rounded-full animate-pulse-slow"
          style={{ backgroundColor: '#8b5cf6' }}
        />
      </div>
    );
  }

  const needsAttention = relationships.filter(r => r.indicator.level <= 2).length;

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="mb-6 md:mb-8 stagger-1">
        <h1 className="text-2xl md:text-3xl font-light text-white tracking-tight mb-1 md:mb-2">
          Welcome back
        </h1>
        <p style={{ color: '#64748b' }} className="text-sm md:text-base">
          {user?.email}
        </p>
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {/* Connections Card */}
        <Link 
          to="/relationships" 
          className="glass-panel p-5 md:p-6 group stagger-2"
        >
          <Circle 
            size={22} 
            strokeWidth={1.5} 
            className="mb-4" 
            style={{ color: '#a78bfa' }} 
          />
          <h3 className="text-base font-medium text-white mb-1">Connections</h3>
          <p style={{ color: '#9ca3af' }} className="text-sm mb-3">
            {relationships.length} relationship{relationships.length !== 1 ? 's' : ''} tracked
          </p>
          {needsAttention > 0 && (
            <span 
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: '#f472b6' }}
            >
              {needsAttention} needs attention
            </span>
          )}
        </Link>

        {/* Awareness Card */}
        <Link 
          to="/checkin" 
          className="glass-panel p-5 md:p-6 group stagger-3"
        >
          <Wind 
            size={22} 
            strokeWidth={1.5} 
            className="mb-4" 
            style={{ color: '#a78bfa' }} 
          />
          <h3 className="text-base font-medium text-white mb-1">Awareness</h3>
          <p style={{ color: '#9ca3af' }} className="text-sm mb-3">
            Check-in every {checkin?.interval_days} days
          </p>
          <span 
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: checkin?.overdue ? '#fbbf24' : '#4ade80' }}
          >
            {checkin?.overdue ? 'Overdue' : 'Present'}
          </span>
        </Link>

        {/* Financial Obligations Card */}
        <Link 
          to="/obligations" 
          className="glass-panel p-5 md:p-6 group stagger-4"
        >
          <Scale 
            size={22} 
            strokeWidth={1.5} 
            className="mb-4" 
            style={{ color: '#a78bfa' }} 
          />
          <h3 className="text-base font-medium text-white mb-1">Financial Obligations</h3>
          <p style={{ color: '#9ca3af' }} className="text-sm">
            Record debts and designate a trusted person to settle them
          </p>
        </Link>

        {/* Legacy Vault Card */}
        <Link 
          to="/legacy" 
          className="glass-panel p-5 md:p-6 group stagger-5"
        >
          <Lock 
            size={22} 
            strokeWidth={1.5} 
            className="mb-4" 
            style={{ color: '#a78bfa' }} 
          />
          <h3 className="text-base font-medium text-white mb-1">Legacy Vault</h3>
          <p style={{ color: '#9ca3af' }} className="text-sm">
            Words for when you cannot speak them. Encrypted. Sacred. Released with intention.
          </p>
        </Link>
      </div>
    </div>
  );
}
