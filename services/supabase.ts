import { createClient } from '@supabase/supabase-js';

// Replace with your real values
const SUPABASE_URL = 'netflify variable';
const SUPABASE_ANON_KEY = 'netflify variable';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
