import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Sparkles } from 'lucide-react';
import { relationshipsApi, aiApi } from '../api';
import { IndicatorBadge } from '../components/IndicatorBadge';
import type { Relationship, RelationshipState, AIResponse } from '../types';
import { RELATIONSHIP_STATES } from '../types';

export function RelationshipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [state, setState] = useState<RelationshipState>('UNCLEAR');
  const [notes, setNotes] = useState('');
  
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [contextText, setContextText] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchRelationship();
  }, [id]);

  const fetchRelationship = async () => {
    try {
      const data = await relationshipsApi.get(id!);
      setRelationship(data);
      setState(data.state);
      setNotes(data.notes || '');
    } catch (error) {
      console.error('Failed to fetch relationship:', error);
      navigate('/relationships');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!relationship) return;
    setSaving(true);
    try {
      const updated = await relationshipsApi.update(relationship.id, { state, notes });
      setRelationship(updated);
    } catch (error) {
      console.error('Failed to update relationship:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!relationship) return;
    if (!confirm('Are you sure you want to remove this connection?')) return;
    
    setDeleting(true);
    try {
      await relationshipsApi.delete(relationship.id);
      navigate('/relationships');
    } catch (error) {
      console.error('Failed to delete relationship:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleGetSupport = async () => {
    if (!contextText.trim()) return;
    setAiLoading(true);
    try {
      const response = await aiApi.getSupport({
        relationship_state: state,
        context_text: contextText,
      });
      setAiResponse(response);
    } catch (error) {
      console.error('Failed to get AI support:', error);
    } finally {
      setAiLoading(false);
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

  if (!relationship) return null;

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex items-center gap-3 md:gap-4">
        <Link to="/relationships" className="calm-button p-3">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-3xl font-light text-white tracking-tight truncate">
            {relationship.name}
          </h1>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="calm-button p-3"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="glass-panel p-6 md:p-8 space-y-4 md:space-y-6">
        <div className="flex items-center gap-4">
          <IndicatorBadge level={relationship.indicator.level} label={relationship.indicator.label} />
        </div>

        <div>
          <label className="quiet-label">Current State</label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value as RelationshipState)}
            className="quiet-input"
          >
            {RELATIONSHIP_STATES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="quiet-label">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="quiet-input min-h-[120px] resize-none"
            placeholder="How are things with this person? What's on your mind?"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="calm-button-primary w-full sm:w-auto disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="glass-panel p-6 md:p-8 space-y-4 md:space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles size={20} style={{ color: '#5B21B6' }} />
          <h2 className="text-lg md:text-xl font-light text-white">Gentle Reflection</h2>
        </div>

        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Share what's on your mind about this relationship. The AI will offer a calm, 
          non-judgmental reflection.
        </p>

        <div>
          <label className="quiet-label">What's happening?</label>
          <textarea
            value={contextText}
            onChange={(e) => setContextText(e.target.value)}
            className="quiet-input min-h-[120px] resize-none"
            placeholder="Describe the situation... There is no wrong answer."
          />
        </div>

        <button
          onClick={handleGetSupport}
          disabled={aiLoading || !contextText.trim()}
          className="calm-button w-full sm:w-auto disabled:opacity-50"
        >
          <Sparkles size={16} />
          <span>{aiLoading ? 'Reflecting...' : 'Get Gentle Support'}</span>
        </button>

        {aiResponse && (
          <div className="space-y-4 pt-4 animate-fade-in-up" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <label className="quiet-label">Reflection</label>
              <p style={{ color: '#cbd5e1' }}>{aiResponse.reflection}</p>
            </div>
            <div>
              <label className="quiet-label">A Gentle Thought</label>
              <p style={{ color: '#cbd5e1' }}>{aiResponse.suggestion}</p>
            </div>
            <div>
              <label className="quiet-label font-bold uppercase">Remember</label>
              <p style={{ color: '#a78bfa' }} className="font-medium">{aiResponse.encouragement}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
