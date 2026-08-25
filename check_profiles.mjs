import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nickname, xp, device_type, device_language')
    .order('xp', { ascending: false })
    .limit(5);
  
  const { data: d2 } = await supabase.from('profiles').select('id, nickname, xp, device_type, device_language').order('id', { ascending: false }).limit(5);
  
  if (error) console.error(error);
  else console.log("By ID (newest probably):", d2);
}

check();
