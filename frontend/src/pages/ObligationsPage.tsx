import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Scale, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { obligationsApi, trustedPersonApi } from '../api';
import type { FinancialObligation, ObligationSummary, TrustedPerson } from '../types';

export function ObligationsPage() {
  const [obligations, setObligations] = useState<FinancialObligation[]>([]);
  const [summary, setSummary] = useState<ObligationSummary | null>(null);
  const [trustedPerson, setTrustedPerson] = useState<TrustedPerson | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    creditor_name: '',
    amount: '',
    currency: 'USD',
    description: '',
    due_date: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [obligationsData, summaryData, trustedPersonData] = await Promise.all([
        obligationsApi.list(),
        obligationsApi.getSummary(),
        trustedPersonApi.get(),
      ]);
      setObligations(obligationsData);
      setSummary(summaryData);
      setTrustedPerson(trustedPersonData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await obligationsApi.create({
        creditor_name: formData.creditor_name,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        description: formData.description || undefined,
        due_date: formData.due_date || undefined,
      });
      setFormData({
        creditor_name: '',
        amount: '',
        currency: 'USD',
        description: '',
        due_date: '',
      });
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error('Failed to create obligation:', error);
    }
  };

  const handleSettle = async (id: string) => {
    try {
      await obligationsApi.settle(id);
      fetchData();
    } catch (error) {
      console.error('Failed to settle obligation:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this obligation?')) return;
    try {
      await obligationsApi.delete(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete obligation:', error);
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

  return (
    <div className="space-y-8">
      <div className="stagger-1">
        <h1 className="text-2xl md:text-3xl font-light text-white tracking-tight mb-1 md:mb-2">
          Financial Obligations
        </h1>
        <p style={{ color: '#64748b' }} className="text-sm md:text-base">
          Some debts are not just financial. They are promises we meant to keep.
        </p>
      </div>

      {trustedPerson ? (
        <div 
          className="glass-panel p-5 md:p-6 stagger-2"
          style={{ 
            borderLeft: '3px solid #4ade80'
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} style={{ color: '#4ade80' }} />
              <div>
                <p className="text-sm font-medium text-white">
                  Trusted Person: {trustedPerson.full_name}
                </p>
                <p className="text-xs" style={{ color: '#6b7280' }}>
                  {trustedPerson.email}
                  {trustedPerson.phone && ` • ${trustedPerson.phone}`}
                </p>
              </div>
            </div>
            <Link 
              to="/obligations/trusted-person"
              className="calm-button text-xs"
            >
              Edit
            </Link>
          </div>
        </div>
      ) : (
        <div 
          className="glass-panel p-5 md:p-6 stagger-2"
          style={{ 
            borderLeft: '3px solid #a78bfa',
            background: 'rgba(167, 139, 250, 0.05)'
          }}
        >
          <p className="text-sm" style={{ color: '#e5e5e5' }}>
            <strong>Important:</strong> You need to designate a trusted person who will be notified to settle these obligations.
          </p>
          <Link 
            to="/obligations/trusted-person"
            className="calm-button-primary mt-4 inline-flex"
          >
            Designate Trusted Person
          </Link>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-3">
          <div className="glass-panel p-5">
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#9ca3af' }}>
              Total Outstanding
            </p>
            <p className="font-mono text-2xl font-medium text-white">
              ${parseFloat(summary.outstanding_amount).toFixed(2)}
            </p>
            <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
              {summary.outstanding_count} obligation{summary.outstanding_count !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="glass-panel p-5">
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#9ca3af' }}>
              Total Settled
            </p>
            <p className="font-mono text-2xl font-medium" style={{ color: '#4ade80' }}>
              ${(parseFloat(summary.total_amount) - parseFloat(summary.outstanding_amount)).toFixed(2)}
            </p>
            <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
              {summary.settled_count} obligation{summary.settled_count !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="glass-panel p-5">
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#9ca3af' }}>
              Trusted Person
            </p>
            <p className="text-base font-medium text-white">
              {trustedPerson ? trustedPerson.full_name : 'Not Set'}
            </p>
            {trustedPerson && (
              <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                {trustedPerson.email}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center stagger-4">
        <h2 className="text-base md:text-lg font-medium text-white">Obligations Ledger</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="calm-button flex items-center gap-2"
        >
          <Plus size={18} />
          Record Obligation
        </button>
      </div>

      {showForm && (
        <div className="glass-panel p-6 stagger-5">
          <h3 className="text-base md:text-lg font-medium text-white mb-4">New Obligation</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="quiet-label mb-2">Creditor Name</label>
              <input
                type="text"
                required
                className="quiet-input"
                value={formData.creditor_name}
                onChange={(e) => setFormData({ ...formData, creditor_name: e.target.value })}
                placeholder="Who do you owe?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="quiet-label mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="quiet-input font-mono"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="quiet-label mb-2">Due Date (Optional)</label>
                <input
                  type="date"
                  className="quiet-input"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="quiet-label mb-2">Description (Optional)</label>
              <textarea
                className="quiet-input"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Why do you owe this? Any context..."
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="calm-button-primary">
                Record Obligation
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="calm-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {obligations.length === 0 ? (
          <div className="glass-panel p-12 text-center">
            <Scale size={48} strokeWidth={1} className="mx-auto mb-4" style={{ color: '#6b7280' }} />
            <p className="text-lg" style={{ color: '#9ca3af' }}>
              No outstanding obligations. Peace of mind.
            </p>
          </div>
        ) : (
          obligations.map((obligation, index) => (
            <div
              key={obligation.id}
              className={`glass-panel p-5 md:p-6 group stagger-${Math.min(index + 6, 10)}`}
              style={{
                borderLeft: obligation.status === 'SETTLED' 
                  ? '3px solid #4ade80' 
                  : '3px solid #a78bfa',
                opacity: obligation.status === 'SETTLED' ? 0.6 : 1,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {obligation.status === 'SETTLED' ? (
                      <CheckCircle2 size={20} style={{ color: '#4ade80' }} />
                    ) : (
                      <Circle size={20} style={{ color: '#a78bfa' }} />
                    )}
                    <h3 className="text-lg font-medium text-white">
                      {obligation.creditor_name}
                    </h3>
                  </div>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-mono text-2xl font-medium text-white">
                      ${parseFloat(obligation.amount).toFixed(2)}
                    </span>
                    <span className="text-sm" style={{ color: '#6b7280' }}>
                      {obligation.currency}
                    </span>
                  </div>

                  {obligation.description && (
                    <p className="text-sm mb-3" style={{ color: '#9ca3af' }}>
                      {obligation.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs" style={{ color: '#6b7280' }}>
                    {obligation.due_date && (
                      <span>Due: {new Date(obligation.due_date).toLocaleDateString()}</span>
                    )}
                    <span>Created: {new Date(obligation.created_at).toLocaleDateString()}</span>
                    <span 
                      className="uppercase tracking-wider font-medium"
                      style={{ 
                        color: obligation.status === 'SETTLED' ? '#4ade80' : '#a78bfa' 
                      }}
                    >
                      {obligation.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {obligation.status === 'OUTSTANDING' && (
                    <button
                      onClick={() => handleSettle(obligation.id)}
                      className="calm-button text-xs"
                      title="Mark as settled"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(obligation.id)}
                    className="calm-button text-xs"
                    style={{ color: '#ef4444' }}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
