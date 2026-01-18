import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle2 } from 'lucide-react';
import { trustedPersonApi } from '../api';
import type { TrustedPerson } from '../types';

export function TrustedPersonPage() {
  const navigate = useNavigate();
  const [trustedPerson, setTrustedPerson] = useState<TrustedPerson | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    relationship_to_user: '',
    personal_note: '',
  });

  useEffect(() => {
    fetchTrustedPerson();
  }, []);

  const fetchTrustedPerson = async () => {
    try {
      const data = await trustedPersonApi.get();
      if (data) {
        setTrustedPerson(data);
        setFormData({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone || '',
          relationship_to_user: data.relationship_to_user || '',
          personal_note: '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch trusted person:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    try {
      if (trustedPerson) {
        await trustedPersonApi.update(formData);
      } else {
        await trustedPersonApi.create(formData);
      }
      navigate('/obligations');
    } catch (error) {
      console.error('Failed to save trusted person:', error);
      setShowConfirmation(false);
    }
  };

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

  if (showConfirmation) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center stagger-1">
          <Shield size={64} strokeWidth={1} className="mx-auto mb-6" style={{ color: '#a78bfa' }} />
          <h1 className="text-2xl md:text-3xl font-light text-white tracking-tight mb-2 md:mb-4">
            Confirm Your Designation
          </h1>
          <p style={{ color: '#64748b' }} className="text-sm md:text-base">
            This is a solemn commitment. Please review carefully.
          </p>
        </div>

        <div className="glass-panel p-8 stagger-2">
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-wider mb-2" style={{ color: '#9ca3af' }}>
                Trusted Person
              </p>
              <p className="text-xl font-medium text-white">{formData.full_name}</p>
            </div>

            <div>
              <p className="text-sm uppercase tracking-wider mb-2" style={{ color: '#9ca3af' }}>
                Email Address
              </p>
              <p className="text-base text-white">{formData.email}</p>
            </div>

            {formData.relationship_to_user && (
              <div>
                <p className="text-sm uppercase tracking-wider mb-2" style={{ color: '#9ca3af' }}>
                  Relationship
                </p>
                <p className="text-base text-white">{formData.relationship_to_user}</p>
              </div>
            )}
          </div>

          <div 
            className="mt-8 p-6 rounded-lg"
            style={{ 
              background: 'rgba(167, 139, 250, 0.1)',
              border: '1px solid rgba(167, 139, 250, 0.3)'
            }}
          >
            <p className="text-base leading-relaxed" style={{ color: '#e5e5e5' }}>
              I confirm that I designate <span style={{ color: '#a78bfa' }}>{formData.full_name}</span>, 
              as my trusted representative to settle my financial obligations 
              in the event of my passing.
            </p>

            <div className="mt-6 flex items-start gap-3">
              <input
                type="checkbox"
                id="confirm"
                className="mt-1"
                required
              />
              <label htmlFor="confirm" className="text-sm" style={{ color: '#9ca3af' }}>
                I understand this person will receive sensitive financial information and have the authority 
                to act on my behalf to honor these obligations.
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={handleConfirm}
              className="calm-button-primary flex-1"
            >
              Confirm Designation
            </button>
            <button
              onClick={() => setShowConfirmation(false)}
              className="calm-button"
            >
              Review Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="stagger-1">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={28} strokeWidth={1.5} style={{ color: '#a78bfa' }} />
          <h1 className="text-2xl md:text-3xl font-light text-white tracking-tight">
            {trustedPerson ? 'Update' : 'Designate'} Trusted Person
          </h1>
        </div>
        <p style={{ color: '#64748b' }} className="text-sm md:text-base">
          This person will be notified to settle your obligations if you pass away.
        </p>
      </div>

      {trustedPerson && (
        <div 
          className="glass-panel p-5 stagger-2"
          style={{ 
            borderLeft: '3px solid #4ade80'
          }}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} style={{ color: '#4ade80' }} />
            <div>
              <p className="text-sm font-medium text-white">
                Trusted Person Set
              </p>
              <p className="text-xs" style={{ color: '#6b7280' }}>
                {trustedPerson.full_name} ({trustedPerson.email})
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 stagger-3">
        <div className="glass-panel p-6 md:p-8">
          <div className="space-y-5">
            <div>
              <label className="quiet-label mb-2">Full Name</label>
              <input
                type="text"
                required
                className="quiet-input"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="quiet-label mb-2">Email Address</label>
              <input
                type="email"
                required
                className="quiet-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
              <p className="text-xs mt-2" style={{ color: '#6b7280' }}>
                They will receive a verification email
              </p>
            </div>

            <div>
              <label className="quiet-label mb-2">Phone Number (Optional)</label>
              <input
                type="tel"
                className="quiet-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="quiet-label mb-2">Relationship to You (Optional)</label>
              <input
                type="text"
                className="quiet-input"
                value={formData.relationship_to_user}
                onChange={(e) => setFormData({ ...formData, relationship_to_user: e.target.value })}
                placeholder="Sister, Best Friend, Spouse..."
              />
            </div>

            <div>
              <label className="quiet-label mb-2">Personal Note (Optional, Encrypted)</label>
              <textarea
                className="quiet-input"
                rows={4}
                value={formData.personal_note}
                onChange={(e) => setFormData({ ...formData, personal_note: e.target.value })}
                placeholder="A personal message they will receive along with your obligations..."
              />
              <p className="text-xs mt-2" style={{ color: '#6b7280' }}>
                This note will be encrypted and only sent when needed
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="calm-button-primary flex-1">
            {trustedPerson ? 'Update' : 'Designate'} Trusted Person
          </button>
          <button
            type="button"
            onClick={() => navigate('/obligations')}
            className="calm-button"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
