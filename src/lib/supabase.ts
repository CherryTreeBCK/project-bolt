import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for better TypeScript support
export type Account = {
  id: string;
  username: string;
  full_name?: string;
  profile_image_url?: string;
  created_at: string;
};

export type Follower = {
  id: number;
  account_id: string;
  username?: string;
  full_name?: string;
  follower_count: number;
  following_count: number;
  posts_count: number;
  is_verified: boolean;
  is_private: boolean;
  biography?: string;
  external_url?: string;
  category?: string;
  priority?: string;
  profile_image_url?: string;
  created_at: string;
};

export type Contact = {
  follower_id: number;
  last_contact_date?: string;
  status?: string;
  draft_outreach?: string;
  archived: boolean;
  next_steps?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type FollowerWithContact = Follower & {
  status?: string;
  archived?: boolean;
  last_contact_date?: string;
  notes?: string;
  draft_outreach?: string;
  next_steps?: string;
};