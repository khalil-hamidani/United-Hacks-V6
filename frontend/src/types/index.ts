export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export type RelationshipState = 
  | 'STRONG' 
  | 'GOOD_BUT_DISTANT' 
  | 'UNCLEAR' 
  | 'TENSE' 
  | 'HURT';

export interface Indicator {
  label: string;
  level: number;
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

export interface AIRequest {
  relationship_state: RelationshipState;
  context_text: string;
}

export interface AIResponse {
  reflection: string;
  suggestion: string;
  encouragement: string;
}

export interface CheckinStatus {
  last_checkin_at: string | null;
  interval_days: number;
  days_since_last_checkin: number | null;
  overdue: boolean;
}

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
  recipient_ids: string[];  // NEW: Array of assigned recipient IDs
  created_at: string;
  updated_at: string;
}

export interface DecryptedLegacyItem extends LegacyItem {
  content: string;
}

export interface RecipientWithItems {
  recipient: Recipient;
  legacy_items: DecryptedLegacyItem[];
}

export interface SimulatedRelease {
  recipients: RecipientWithItems[];  // Changed from single recipient to array
  message: string;
}

export interface FinancialObligation {
  id: string;
  user_id: string;
  creditor_name: string;
  amount: string;
  currency: string;
  description: string | null;
  due_date: string | null;
  status: 'OUTSTANDING' | 'SETTLED';
  created_at: string;
  updated_at: string;
}

export interface ObligationCreate {
  creditor_name: string;
  amount: number | string;
  currency?: string;
  description?: string;
  due_date?: string;
}

export interface ObligationUpdate {
  creditor_name?: string;
  amount?: number | string;
  currency?: string;
  description?: string;
  due_date?: string;
}

export interface ObligationSummary {
  total_count: number;
  outstanding_count: number;
  settled_count: number;
  total_amount: string;
  outstanding_amount: string;
  currency: string;
}

export interface TrustedPerson {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  relationship_to_user: string | null;
  verification_status: 'PENDING' | 'VERIFIED' | 'FAILED';
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrustedPersonCreate {
  full_name: string;
  email: string;
  phone?: string;
  relationship_to_user?: string;
  personal_note?: string;
}

export interface TrustedPersonUpdate {
  full_name?: string;
  email?: string;
  phone?: string;
  relationship_to_user?: string;
  personal_note?: string;
}

export const RELATIONSHIP_STATES: { value: RelationshipState; label: string }[] = [
  { value: 'STRONG', label: 'Strong' },
  { value: 'GOOD_BUT_DISTANT', label: 'Good but Distant' },
  { value: 'UNCLEAR', label: 'Unclear' },
  { value: 'TENSE', label: 'Tense' },
  { value: 'HURT', label: 'Hurt' },
];

export const indicatorColors: Record<number, string> = {
  5: '#22c55e',
  4: '#3b82f6',
  3: '#eab308',
  2: '#f97316',
  1: '#ef4444',
};

export const indicatorLabels: Record<number, string> = {
  5: 'Stable',
  4: 'Open',
  3: 'Needs Attention',
  2: 'Fragile',
  1: 'In Repair',
};
