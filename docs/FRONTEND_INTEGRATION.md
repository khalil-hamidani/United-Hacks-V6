# Frontend Integration Guide

Complete guide for integrating with the "I Am Only Human" backend.

## Setup

### 1. Create React/Next.js Project
```bash
npx create-vite@latest frontend -- --template react-ts
cd frontend
npm install axios
```

### 2. Environment Variables
Create `.env`:
```
VITE_API_URL=http://localhost:8000
```

### 3. API Client
Create `src/lib/api.ts`:
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## Authentication

### Types (`src/types/auth.ts`)
```typescript
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}
```

### API Calls (`src/api/auth.ts`)
```typescript
import api from '../lib/api';

export const register = async (email: string, password: string) => {
  const { data } = await api.post('/auth/register', { email, password });
  return data;
};

export const login = async (email: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);
  
  const { data } = await api.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  localStorage.setItem('token', data.access_token);
  return data;
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
};
```

---

## Relationships

### Types (`src/types/relationship.ts`)
```typescript
export type RelationshipState = 
  | 'STRONG' 
  | 'GOOD_BUT_DISTANT' 
  | 'UNCLEAR' 
  | 'TENSE' 
  | 'HURT';

export interface Indicator {
  label: string;
  level: number; // 1-5
}

export interface Relationship {
  id: string;
  name: string;
  state: RelationshipState;
  notes: string | null;
  indicator: Indicator;
  created_at: string;
  updated_at: string;
}
```

### API Calls (`src/api/relationships.ts`)
```typescript
import api from '../lib/api';
import { Relationship, RelationshipState } from '../types/relationship';

export const getRelationships = async (): Promise<Relationship[]> => {
  const { data } = await api.get('/relationships/');
  return data;
};

export const getRelationship = async (id: string): Promise<Relationship> => {
  const { data } = await api.get(`/relationships/${id}`);
  return data;
};

export const createRelationship = async (payload: {
  name: string;
  state?: RelationshipState;
  notes?: string;
}): Promise<Relationship> => {
  const { data } = await api.post('/relationships/', payload);
  return data;
};

export const updateRelationship = async (id: string, payload: {
  name?: string;
  state?: RelationshipState;
  notes?: string;
}): Promise<Relationship> => {
  const { data } = await api.put(`/relationships/${id}`, payload);
  return data;
};

export const deleteRelationship = async (id: string): Promise<void> => {
  await api.delete(`/relationships/${id}`);
};
```

### Indicator Color Mapping
```typescript
export const indicatorColors: Record<number, string> = {
  5: '#22c55e', // green - Stable
  4: '#3b82f6', // blue - Open
  3: '#eab308', // yellow - Needs attention
  2: '#f97316', // orange - Fragile
  1: '#ef4444', // red - In repair
};
```

---

## AI Support

### Types (`src/types/ai.ts`)
```typescript
export interface AIRequest {
  relationship_state: RelationshipState;
  context_text: string;
}

export interface AIResponse {
  reflection: string;
  suggestion: string;
  encouragement: string;
}
```

### API Call (`src/api/ai.ts`)
```typescript
import api from '../lib/api';
import { AIRequest, AIResponse } from '../types/ai';

export const getRelationshipSupport = async (
  request: AIRequest
): Promise<AIResponse> => {
  const { data } = await api.post('/ai/relationship-support', request);
  return data;
};
```

---

## Check-in

### Types (`src/types/checkin.ts`)
```typescript
export interface CheckinStatus {
  last_checkin_at: string | null;
  interval_days: number;
  days_since_last_checkin: number | null;
  overdue: boolean;
}
```

### API Calls (`src/api/checkin.ts`)
```typescript
import api from '../lib/api';

export const getCheckinStatus = async () => {
  const { data } = await api.get('/checkin/status');
  return data;
};

export const confirmCheckin = async () => {
  const { data } = await api.post('/checkin/confirm');
  return data;
};

export const updateCheckinConfig = async (interval_days: number) => {
  const { data } = await api.put('/checkin/config', { interval_days });
  return data;
};
```

---

## Legacy Vault

### Types (`src/types/legacy.ts`)
```typescript
export interface Recipient {
  id: string;
  name: string;
  email: string;
  relationship_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface LegacyItem {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface DecryptedLegacyItem extends LegacyItem {
  content: string;
}
```

### API Calls (`src/api/legacy.ts`)
```typescript
import api from '../lib/api';

// Recipient
export const getRecipient = async () => {
  const { data } = await api.get('/legacy/recipient');
  return data;
};

export const createRecipient = async (payload: {
  name: string;
  email: string;
  relationship_description?: string;
}) => {
  const { data } = await api.post('/legacy/recipient', payload);
  return data;
};

export const updateRecipient = async (payload: {
  name?: string;
  email?: string;
  relationship_description?: string;
}) => {
  const { data } = await api.put('/legacy/recipient', payload);
  return data;
};

export const deleteRecipient = async () => {
  await api.delete('/legacy/recipient');
};

// Legacy Items
export const getLegacyItems = async () => {
  const { data } = await api.get('/legacy/');
  return data;
};

export const createLegacyItem = async (payload: {
  title: string;
  content: string;
}) => {
  const { data } = await api.post('/legacy/', payload);
  return data;
};

export const updateLegacyItem = async (id: string, payload: {
  title?: string;
  content?: string;
}) => {
  const { data } = await api.put(`/legacy/${id}`, payload);
  return data;
};

export const deleteLegacyItem = async (id: string) => {
  await api.delete(`/legacy/${id}`);
};

// Simulate Release (demo only)
export const simulateRelease = async () => {
  const { data } = await api.post('/legacy/simulate-release');
  return data;
};
```

---

## Suggested Page Structure

```
src/
├── pages/
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── Relationships.tsx
│   ├── RelationshipDetail.tsx
│   ├── Checkin.tsx
│   └── Legacy.tsx
├── components/
│   ├── ProtectedRoute.tsx
│   ├── RelationshipCard.tsx
│   ├── IndicatorBadge.tsx
│   ├── AIReflectionCard.tsx
│   └── CheckinBanner.tsx
└── hooks/
    ├── useAuth.ts
    ├── useRelationships.ts
    └── useCheckin.ts
```

---

## Key UX Flows

1. **Registration/Login** → Store token → Redirect to Dashboard
2. **Dashboard** → Show check-in status banner if overdue
3. **Relationships** → List with indicator badges → Click for detail
4. **Relationship Detail** → Edit state → Get AI support
5. **Check-in** → Confirm button → Update interval settings
6. **Legacy** → Set recipient → Create items → Preview simulate-release
