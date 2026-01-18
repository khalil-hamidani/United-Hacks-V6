import { useEffect, useState } from 'react';
import { Lock, Plus, Trash2, User, Edit2, X } from 'lucide-react';
import { legacyApi } from '../api';
import type { Recipient, LegacyItem } from '../types';

export function LegacyPage() {
  // State
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [items, setItems] = useState<LegacyItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Recipient form state
  const [showRecipientForm, setShowRecipientForm] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);
  const [recipientForm, setRecipientForm] = useState({ name: '', email: '', relationship_description: '' });
  const [savingRecipient, setSavingRecipient] = useState(false);
  
  // Item form state
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<LegacyItem | null>(null);
  const [itemForm, setItemForm] = useState({ title: '', content: '', recipient_ids: [] as string[] });
  const [savingItem, setSavingItem] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recipientsData, itemsData] = await Promise.all([
        legacyApi.listRecipients(),
        legacyApi.listItems(),
      ]);
      setRecipients(recipientsData);
      setItems(itemsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Recipient handlers
  const openRecipientForm = (recipient?: Recipient) => {
    if (recipient) {
      setEditingRecipient(recipient);
      setRecipientForm({
        name: recipient.name,
        email: recipient.email,
        relationship_description: recipient.relationship_description || '',
      });
    } else {
      setEditingRecipient(null);
      setRecipientForm({ name: '', email: '', relationship_description: '' });
    }
    setShowRecipientForm(true);
  };

  const handleSaveRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRecipient(true);
    try {
      if (editingRecipient) {
        const updated = await legacyApi.updateRecipient(editingRecipient.id, recipientForm);
        setRecipients(recipients.map(r => r.id === updated.id ? updated : r));
      } else {
        const created = await legacyApi.createRecipient(recipientForm);
        setRecipients([...recipients, created]);
      }
      setShowRecipientForm(false);
    } catch (error) {
      console.error('Failed to save recipient:', error);
    } finally {
      setSavingRecipient(false);
    }
  };

  const handleDeleteRecipient = async (id: string) => {
    if (!confirm('Delete this recipient? All item assignments to them will be removed.')) return;
    try {
      await legacyApi.deleteRecipient(id);
      setRecipients(recipients.filter(r => r.id !== id));
      // Refresh items to update assignments
      const itemsData = await legacyApi.listItems();
      setItems(itemsData);
    } catch (error) {
      console.error('Failed to delete recipient:', error);
    }
  };

  // Item handlers
  const openItemForm = (item?: LegacyItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({ title: item.title, content: '', recipient_ids: item.recipient_ids });
    } else {
      setEditingItem(null);
      setItemForm({ title: '', content: '', recipient_ids: [] });
    }
    setShowItemForm(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.title.trim() || (!editingItem && !itemForm.content.trim())) return;
    if (itemForm.recipient_ids.length === 0) {
      alert('Please select at least one recipient');
      return;
    }
    
    setSavingItem(true);
    try {
      if (editingItem) {
        const payload: any = { recipient_ids: itemForm.recipient_ids };
        if (itemForm.title !== editingItem.title) payload.title = itemForm.title;
        if (itemForm.content) payload.content = itemForm.content;
        
        const updated = await legacyApi.updateItem(editingItem.id, payload);
        setItems(items.map(i => i.id === updated.id ? updated : i));
      } else {
        const created = await legacyApi.createItem(itemForm);
        setItems([...items, created]);
      }
      setShowItemForm(false);
    } catch (error) {
      console.error('Failed to save item:', error);
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Delete this legacy item?')) return;
    try {
      await legacyApi.deleteItem(id);
      setItems(items.filter(i => i.id !== id));
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const toggleRecipient = (recipientId: string) => {
    setItemForm(prev => ({
      ...prev,
      recipient_ids: prev.recipient_ids.includes(recipientId)
        ? prev.recipient_ids.filter(id => id !== recipientId)
        : [...prev.recipient_ids, recipientId]
    }));
  };

  const getRecipientName = (id: string) => {
    return recipients.find(r => r.id === id)?.name || 'Unknown';
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
      <div className="stagger-1">
        <h1 className="text-2xl md:text-3xl font-light text-white tracking-tight mb-1 md:mb-2">
          Legacy Vault
        </h1>
        <p style={{ color: '#64748b' }} className="text-sm md:text-base">
          Encrypted messages for those you love. Released only when you are no longer present.
        </p>
      </div>

      {/* Recipients Section */}
      <div className="glass-panel p-6 md:p-8 stagger-2">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <User size={20} style={{ color: '#5B21B6' }} />
            <h2 className="text-lg md:text-xl font-light text-white">Trusted Recipients</h2>
          </div>
          <button
            onClick={() => openRecipientForm()}
            className="calm-button flex items-center gap-2"
          >
            <Plus size={18} />
            Add Recipient
          </button>
        </div>

        {recipients.length === 0 ? (
          <p style={{ color: '#6b7280' }} className="text-sm text-center py-8">
            No recipients yet. Add someone you trust.
          </p>
        ) : (
          <div className="space-y-3">
            {recipients.map((recipient, index) => (
              <div 
                key={recipient.id} 
                className={`flex items-center justify-between p-4 rounded-xl stagger-${Math.min(index + 3, 10)}`}
                style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium text-sm md:text-base">{recipient.name}</p>
                  <p style={{ color: '#9ca3af' }} className="text-xs md:text-sm">{recipient.email}</p>
                  {recipient.relationship_description && (
                    <p style={{ color: '#6b7280' }} className="text-xs mt-1">{recipient.relationship_description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => openRecipientForm(recipient)}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    style={{ color: '#9ca3af' }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteRecipient(recipient.id)}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    style={{ color: '#9ca3af' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recipient Form */}
        {showRecipientForm && (
          <div className="mt-6 p-6 rounded-xl" style={{ backgroundColor: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-white">
                {editingRecipient ? 'Edit Recipient' : 'New Recipient'}
              </h3>
              <button onClick={() => setShowRecipientForm(false)} style={{ color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveRecipient} className="space-y-4">
              <div>
                <label className="quiet-label mb-2">Name</label>
                <input
                  type="text"
                  required
                  className="quiet-input"
                  value={recipientForm.name}
                  onChange={(e) => setRecipientForm({ ...recipientForm, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="quiet-label mb-2">Email</label>
                <input
                  type="email"
                  required
                  className="quiet-input"
                  value={recipientForm.email}
                  onChange={(e) => setRecipientForm({ ...recipientForm, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="quiet-label mb-2">Relationship (Optional)</label>
                <input
                  type="text"
                  className="quiet-input"
                  value={recipientForm.relationship_description}
                  onChange={(e) => setRecipientForm({ ...recipientForm, relationship_description: e.target.value })}
                  placeholder="Father, Friend, Partner..."
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={savingRecipient} className="calm-button-primary flex-1">
                  {savingRecipient ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowRecipientForm(false)} className="calm-button">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Legacy Items Section */}
      <div className="glass-panel p-6 md:p-8 stagger-3">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <Lock size={20} style={{ color: '#5B21B6' }} />
            <h2 className="text-lg md:text-xl font-light text-white">Legacy Messages</h2>
          </div>
          <button
            onClick={() => openItemForm()}
            disabled={recipients.length === 0}
            className="calm-button flex items-center gap-2 disabled:opacity-50"
            title={recipients.length === 0 ? 'Add a recipient first' : ''}
          >
            <Plus size={18} />
            Add Message
          </button>
        </div>

        {items.length === 0 ? (
          <p style={{ color: '#6b7280' }} className="text-sm text-center py-8">
            {recipients.length === 0 
              ? 'Add a recipient first, then create messages for them.'
              : 'No messages yet. Create your first legacy message.'}
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className={`p-4 rounded-xl stagger-${Math.min(index + 4, 10)}`}
                style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium text-sm md:text-base mb-2">{item.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.recipient_ids.map(recipientId => (
                        <span
                          key={recipientId}
                          className="text-xs px-2 py-1 rounded"
                          style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa' }}
                        >
                          {getRecipientName(recipientId)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openItemForm(item)}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                      style={{ color: '#9ca3af' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                      style={{ color: '#9ca3af' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Item Form */}
        {showItemForm && (
          <div className="mt-6 p-6 rounded-xl" style={{ backgroundColor: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-white">
                {editingItem ? 'Edit Message' : 'New Message'}
              </h3>
              <button onClick={() => setShowItemForm(false)} style={{ color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="quiet-label mb-2">Title</label>
                <input
                  type="text"
                  required
                  className="quiet-input"
                  value={itemForm.title}
                  onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                  placeholder="A title for this message"
                />
              </div>
              {!editingItem && (
                <div>
                  <label className="quiet-label mb-2">Message</label>
                  <textarea
                    required
                    className="quiet-input"
                    rows={6}
                    value={itemForm.content}
                    onChange={(e) => setItemForm({ ...itemForm, content: e.target.value })}
                    placeholder="Your message will be encrypted..."
                  />
                </div>
              )}
              <div>
                <label className="quiet-label mb-3">Assign to Recipients</label>
                <div className="space-y-2">
                  {recipients.map(recipient => (
                    <label
                      key={recipient.id}
                      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={itemForm.recipient_ids.includes(recipient.id)}
                        onChange={() => toggleRecipient(recipient.id)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: '#8b5cf6' }}
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm">{recipient.name}</p>
                        {recipient.relationship_description && (
                          <p style={{ color: '#6b7280' }} className="text-xs">{recipient.relationship_description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={savingItem} className="calm-button-primary flex-1">
                  {savingItem ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowItemForm(false)} className="calm-button">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
