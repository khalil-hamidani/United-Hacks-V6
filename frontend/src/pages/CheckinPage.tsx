import { useEffect, useState } from 'react';
import { Wind, Check } from 'lucide-react';
import { checkinApi } from '../api';
import type { CheckinStatus } from '../types';

// Preset intervals in days
const INTERVAL_PRESETS = [
  { label: '1 Month', days: 30 },
  { label: '3 Months', days: 90 },
  { label: '6 Months', days: 180 },
  { label: '1 Year', days: 365 },
  { label: '2 Years', days: 730 },
];

export function CheckinPage() {
  const [status, setStatus] = useState<CheckinStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [intervalDays, setIntervalDays] = useState(30);
  const [savingConfig, setSavingConfig] = useState(false);
  const [justConfirmed, setJustConfirmed] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await checkinApi.getStatus();
      setStatus(data);
      setIntervalDays(data.interval_days);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await checkinApi.confirm();
      await fetchStatus();
      setJustConfirmed(true);
      setTimeout(() => setJustConfirmed(false), 3000);
    } catch (error) {
      console.error('Failed to confirm:', error);
    } finally {
      setConfirming(false);
    }
  };

  const handleSetInterval = async (days: number) => {
    setIntervalDays(days);
    setSavingConfig(true);
    try {
      await checkinApi.updateConfig(days);
      await fetchStatus();
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      setSavingConfig(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div 
          className="w-4 h-4 rounded-full animate-pulse-slow"
          style={{ backgroundColor: '#5B21B6' }}
        />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col justify-center space-y-6">
      <div className="stagger-1">
        <h1 className="text-2xl md:text-3xl font-light text-white tracking-tight mb-1 md:mb-2">
          Awareness
        </h1>
        <p style={{ color: '#64748b' }} className="text-sm md:text-base">
          A quiet reminder that you exist. For yourself, and for others.
        </p>
      </div>

      <div className="glass-panel p-6 md:p-8 text-center stagger-2">
        <div className="mb-4 md:mb-6">
          <div 
            className={`w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto flex items-center justify-center transition-all duration-700 ${
              justConfirmed ? 'animate-pulse-slow' : status?.overdue ? 'animate-breathe' : ''
            }`}
            style={{
              backgroundColor: justConfirmed 
                ? 'rgba(34, 197, 94, 0.2)' 
                : status?.overdue 
                  ? 'rgba(234, 179, 8, 0.1)' 
                  : 'rgba(91, 33, 182, 0.1)',
              border: `2px solid ${
                justConfirmed 
                  ? 'rgba(34, 197, 94, 0.5)' 
                  : status?.overdue 
                    ? 'rgba(234, 179, 8, 0.3)' 
                    : 'rgba(91, 33, 182, 0.3)'
              }`
            }}
          >
            {justConfirmed ? (
              <Check size={28} style={{ color: '#4ade80' }} />
            ) : (
              <Wind 
                size={28} 
                style={{ color: status?.overdue ? '#facc15' : '#5B21B6' }} 
              />
            )}
          </div>
        </div>

        {justConfirmed ? (
          <div className="animate-fade-in-up">
            <h2 className="text-lg md:text-xl font-light text-white mb-1">You are here</h2>
            <p style={{ color: '#94a3b8' }} className="text-sm">Thank you for checking in.</p>
          </div>
        ) : (
          <>
            <h2 className="text-lg md:text-xl font-light text-white mb-1">
              {status?.overdue ? 'You have been away' : 'You are present'}
            </h2>
            <p style={{ color: '#94a3b8' }} className="mb-4 md:mb-6 text-sm">
              {status?.days_since_last_checkin !== null && status?.interval_days
                ? status.overdue
                  ? 'Your Legacy Vault has been triggered for release'
                  : `${status.interval_days - status.days_since_last_checkin} day${(status.interval_days - status.days_since_last_checkin) !== 1 ? 's' : ''} left before your Legacy Vault is released`
                : 'Check in to start your presence timer'}
            </p>

            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="calm-button-primary px-6 py-2.5 disabled:opacity-50"
            >
              {confirming ? 'Confirming...' : 'I am here'}
            </button>
          </>
        )}
      </div>

      <div className="glass-panel p-6 md:p-8 stagger-3">
        <h3 className="text-base font-medium text-white mb-2">Inactivity Period</h3>
        <p style={{ color: '#94a3b8' }} className="text-xs md:text-sm mb-4">
          If you don't check in within this time, your Legacy Vault will be released to your trusted recipients.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
          {INTERVAL_PRESETS.map((preset) => (
            <button
              key={preset.days}
              onClick={() => handleSetInterval(preset.days)}
              disabled={savingConfig}
              className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                intervalDays === preset.days
                  ? 'text-white font-medium'
                  : 'text-white/60 hover:text-white/80'
              } disabled:opacity-50`}
              style={{
                backgroundColor: intervalDays === preset.days 
                  ? 'rgba(139, 92, 246, 0.2)' 
                  : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${
                  intervalDays === preset.days 
                    ? 'rgba(139, 92, 246, 0.4)' 
                    : 'rgba(255, 255, 255, 0.1)'
                }`
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
