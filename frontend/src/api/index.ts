import api from '../lib/api';
import type { 
  User, 
  Token, 
  Relationship, 
  RelationshipState, 
  AIRequest, 
  AIResponse, 
  CheckinStatus, 
  Recipient, 
  LegacyItem, 
  SimulatedRelease,
  FinancialObligation,
  ObligationCreate,
  ObligationUpdate,
  ObligationSummary,
  TrustedPerson,
  TrustedPersonCreate,
  TrustedPersonUpdate
} from '../types';

export const authApi = {
  register: async (email: string, password: string): Promise<User> => {
    const { data } = await api.post('/auth/register', { email, password });
    return data;
  },

  login: async (email: string, password: string): Promise<Token> => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    const { data } = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    localStorage.setItem('token', data.access_token);
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

export const relationshipsApi = {
  list: async (): Promise<Relationship[]> => {
    const { data } = await api.get('/relationships/');
    return data;
  },

  get: async (id: string): Promise<Relationship> => {
    const { data } = await api.get(`/relationships/${id}`);
    return data;
  },

  create: async (payload: { name: string; state?: RelationshipState; notes?: string }): Promise<Relationship> => {
    const { data } = await api.post('/relationships/', payload);
    return data;
  },

  update: async (id: string, payload: { name?: string; state?: RelationshipState; notes?: string }): Promise<Relationship> => {
    const { data} = await api.put(`/relationships/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/relationships/${id}`);
  },
};

export const aiApi = {
  getSupport: async (request: AIRequest): Promise<AIResponse> => {
    const { data } = await api.post('/ai/relationship-support', request);
    return data;
  },
};

export const checkinApi = {
  getStatus: async (): Promise<CheckinStatus> => {
    const { data } = await api.get('/checkin/status');
    return data;
  },

  confirm: async (): Promise<{ last_checkin_at: string; message: string }> => {
    const { data } = await api.post('/checkin/confirm');
    return data;
  },

  updateConfig: async (interval_days: number): Promise<{ interval_days: number; message: string }> => {
    const { data } = await api.put('/checkin/config', { interval_days });
    return data;
  },
};

export const legacyApi = {
  // Recipients (multiple per user)
  listRecipients: async (): Promise<Recipient[]> => {
    const { data } = await api.get('/legacy/recipient');
    return data;
  },

  getRecipient: async (id: string): Promise<Recipient> => {
    const { data } = await api.get(`/legacy/recipient/${id}`);
    return data;
  },

  createRecipient: async (payload: { name: string; email: string; relationship_description?: string }): Promise<Recipient> => {
    const { data } = await api.post('/legacy/recipient', payload);
    return data;
  },

  updateRecipient: async (id: string, payload: { name?: string; email?: string; relationship_description?: string }): Promise<Recipient> => {
    const { data } = await api.put(`/legacy/recipient/${id}`, payload);
    return data;
  },

  deleteRecipient: async (id: string): Promise<void> => {
    await api.delete(`/legacy/recipient/${id}`);
  },

  // Legacy Items (with recipient assignments)
  listItems: async (): Promise<LegacyItem[]> => {
    const { data } = await api.get('/legacy/');
    return data;
  },

  createItem: async (payload: { title: string; content: string; recipient_ids: string[] }): Promise<LegacyItem> => {
    const { data } = await api.post('/legacy/', payload);
    return data;
  },

  updateItem: async (id: string, payload: { title?: string; content?: string; recipient_ids?: string[] }): Promise<LegacyItem> => {
    const { data } = await api.put(`/legacy/${id}`, payload);
    return data;
  },

  deleteItem: async (id: string): Promise<void> => {
    await api.delete(`/legacy/${id}`);
  },

  simulateRelease: async (): Promise<SimulatedRelease> => {
    const { data } = await api.post('/legacy/simulate-release');
    return data;
  },
};

export const demoApi = {
  triggerRelease: async (): Promise<any> => {
    const { data } = await api.post('/demo/release');
    return data;
  },
};

export const obligationsApi = {
  list: async (isSettled?: boolean): Promise<FinancialObligation[]> => {
    const params = isSettled !== undefined ? { is_settled: isSettled } : {};
    const { data } = await api.get('/api/obligations', { params });
    return data;
  },

  getSummary: async (): Promise<ObligationSummary> => {
    const { data } = await api.get('/api/obligations/summary');
    return data;
  },

  get: async (id: string): Promise<FinancialObligation> => {
    const { data } = await api.get(`/api/obligations/${id}`);
    return data;
  },

  create: async (payload: ObligationCreate): Promise<FinancialObligation> => {
    const { data } = await api.post('/api/obligations', payload);
    return data;
  },

  update: async (id: string, payload: ObligationUpdate): Promise<FinancialObligation> => {
    const { data } = await api.put(`/api/obligations/${id}`, payload);
    return data;
  },

  settle: async (id: string): Promise<FinancialObligation> => {
    const { data } = await api.post(`/api/obligations/${id}/settle`);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/obligations/${id}`);
  },
};

export const trustedPersonApi = {
  get: async (): Promise<TrustedPerson | null> => {
    const { data } = await api.get('/api/trusted-person');
    return data;
  },

  create: async (payload: TrustedPersonCreate): Promise<TrustedPerson> => {
    const { data } = await api.post('/api/trusted-person', payload);
    return data;
  },

  update: async (payload: TrustedPersonUpdate): Promise<TrustedPerson> => {
    const { data } = await api.put('/api/trusted-person', payload);
    return data;
  },

  delete: async (): Promise<void> => {
    await api.delete('/api/trusted-person');
  },

  sendVerification: async (): Promise<{ message: string; email: string; status: string }> => {
    const { data } = await api.post('/api/trusted-person/verify');
    return data;
  },
};
