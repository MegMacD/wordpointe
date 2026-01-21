export interface User {
  id: string;
  name: string;
  is_leader: boolean;
  notes: string | null;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface UserSummary {
  id: string;
  name: string;
  is_leader: boolean;
  current_points: number;
}

export interface MemoryItem {
  id: string;
  type: 'verse' | 'custom';
  reference: string;
  text: string | null;
  points_first: number;
  points_repeat: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  bible_version?: string | null;
  bible_version?: string | null;
}

export interface VerseRecord {
  id: string;
  user_id: string;
  memory_item_id: string;
  record_type: 'first' | 'repeat';
  points_awarded: number;
  applied_multiplier: number;
  applied_promo: string | null;
  recorded_at: string;
}

export interface SpendRecord {
  id: string;
  user_id: string;
  points_spent: number;
  note: string | null;
  spent_at: string;
  undone: boolean;
}

export interface BonusRecord {
  id: string;
  user_id: string;
  points_awarded: number;
  reason: string;
  category: 'legacy' | 'bonus' | 'correction' | 'other';
  awarded_by: string | null;
  awarded_at: string;
}

export interface Settings {
  id: string;
  default_points_first: number;
  default_points_repeat: number;
  bible_version: string;
  created_at: string;
}

export interface UserWithPoints extends User {
  current_points: number;
}

