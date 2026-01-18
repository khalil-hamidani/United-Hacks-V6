import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';
import { relationshipsApi } from '../api';
import { IndicatorBadge } from '../components/IndicatorBadge';
import type { Relationship, RelationshipState } from '../types';
import { RELATIONSHIP_STATES } from '../types';

export function RelationshipsPage() {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newState, setNewState] = useState<RelationshipState>('UNCLEAR');
  const [newNotes, setNewNotes] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchRelationships();
  }, []);

  const fetchRelationships = async () => {
    try {
      const data = await relationshipsApi.list();
      setRelationships(data);
    } catch (error) {
      console.error('Failed to fetch relationships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    try {
      const created = await relationshipsApi.create({
        name: newName,
        state: newState,
        notes: newNotes || undefined,
      });
      setRelationships([...relationships, created]);
      setShowCreate(false);
      setNewName('');
      setNewState('UNCLEAR');
      setNewNotes('');
    } catch (error) {
      console.error('Failed to create relationship:', error);
    } finally {
      setCreating(false);
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
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 stagger-1">
        <div>
          <h1 className="text-2xl md:text-3xl font-light text-white tracking-tight mb-1 md:mb-2">
            Connections
          </h1>
          <p style={{ color: '#64748b' }} className="text-sm md:text-base">
            The people in your life, without judgment.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="calm-button"
        >
          <Plus size={18} />
          <span>Add Connection</span>
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="glass-panel p-6 md:p-8 space-y-4 md:space-y-6 animate-fade-in-up stagger-2">
          <div>
            <label className="quiet-label">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="quiet-input"
              placeholder="Who is this person?"
              required
            />
          </div>

          <div>
            <label className="quiet-label">Current State</label>
            <select
              value={newState}
              onChange={(e) => setNewState(e.target.value as RelationshipState)}
              className="quiet-input"
            >
              {RELATIONSHIP_STATES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="quiet-label">Notes (optional)</label>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="quiet-input min-h-[100px] resize-none"
              placeholder="Any context you want to remember..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <button
              type="submit"
              disabled={creating}
              className="calm-button-primary disabled:opacity-50"
            >
              {creating ? 'Adding...' : 'Add Connection'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="calm-button"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {relationships.length === 0 ? (
        <div className="glass-panel p-8 md:p-12 text-center stagger-3">
          <p style={{ color: '#94a3b8' }} className="mb-4">
            No connections yet. Start by adding someone important to you.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="calm-button-primary"
          >
            Add Your First Connection
          </button>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {relationships.map((rel, index) => (
            <Link
              key={rel.id}
              to={`/relationships/${rel.id}`}
              className={`glass-panel p-4 md:p-6 flex items-center justify-between group transition-all duration-500 block stagger-${Math.min(index + 4, 10)}`}
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div>
                  <h3 className="text-base md:text-lg text-white font-medium mb-1">{rel.name}</h3>
                  <IndicatorBadge level={rel.indicator.level} label={rel.indicator.label} size="sm" />
                </div>
              </div>
              <ArrowRight 
                size={20} 
                className="transition-all duration-500 group-hover:translate-x-1" 
                style={{ color: '#64748b' }}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
