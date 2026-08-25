import { createClient } from '@supabase/supabase-js';

// Fix for custom domain blocking: Override Vercel's env variable if it still uses auth.peyvokgame.com
const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseUrl = rawUrl?.includes('auth.peyvokgame.com') 
  ? 'https://phmztiiabmkdotxkyxtk.supabase.co' 
  : rawUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
