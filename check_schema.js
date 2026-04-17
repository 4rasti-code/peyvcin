import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkColumns() {
  const { data, error } = await supabase.from('private_messages').select('*').limit(1);
  if (error) {
    console.error('Error fetching private_messages:', error);
  } else if (data && data.length > 0) {
    console.log('Columns in private_messages:', Object.keys(data[0]));
  } else {
    console.log('No data in private_messages, trying to fetch from profiles just to check connection');
    const { error: pError } = await supabase.from('profiles').select('*').limit(1);
    console.log('Profiles check:', pError ? 'Error' : 'Success');
  }
}

checkColumns();
