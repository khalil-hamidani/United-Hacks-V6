import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sanctuary } from '../components/Sanctuary';
import GhostCursor from '../components/GhostCursor';
import { authApi } from '../api';

export function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authApi.register(email, password);
      await authApi.login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sanctuary>
      <GhostCursor
        color="#b19eef"
        brightness={1.0}
        edgeIntensity={0}
        trailLength={8}
        inertia={0.6}
        grainIntensity={0.02}
        bloomStrength={0.1}
        bloomRadius={0.5}
        bloomThreshold={0.025}
        fadeDelayMs={800}
        fadeDurationMs={1200}
        mixBlendMode="normal"
        zIndex={15}
      />
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-8 md:mb-12">
            <Link to="/" className="inline-flex items-center gap-3 mb-6 md:mb-8">
              <div 
                className="w-3 h-3 rounded-full animate-breathe"
                style={{ backgroundColor: '#5B21B6' }}
              />
              <span className="text-base md:text-lg font-medium text-white tracking-tight">
                I Am Only Human
              </span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-light text-white tracking-tight mb-2">
              Create your sanctuary
            </h1>
            <p style={{ color: '#64748b' }} className="text-sm md:text-base">
              A safe space just for you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="glass-panel p-6 md:p-8 space-y-4 md:space-y-6">
            {error && (
              <div 
                className="p-4 rounded-xl text-sm"
                style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#fca5a5' 
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label className="quiet-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="quiet-input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="quiet-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="quiet-input"
                placeholder="Create a password"
                required
              />
            </div>

            <div>
              <label className="quiet-label">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="quiet-input"
                placeholder="Confirm your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="calm-button-primary w-full disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Begin Journey'}
            </button>
          </form>

          <p className="text-center mt-6 md:mt-8 text-sm" style={{ color: '#64748b' }}>
            Already have a sanctuary?{' '}
            <Link 
              to="/login" 
              className="transition-colors duration-500"
              style={{ color: '#5B21B6' }}
            >
              Enter
            </Link>
          </p>
        </div>
      </div>
    </Sanctuary>
  );
}
