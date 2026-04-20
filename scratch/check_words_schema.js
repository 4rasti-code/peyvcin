import { createClient } from '@supabase/supabase-client'
import fs from 'fs'

const supabase = createClient(
  'https://rastis-projects-23b017ab.supabase.co', // Assuming the URL from context or typical
  process.env.VITE_SUPABASE_ANON_KEY || ''
)

async function checkWordsSchema() {
  const { data, error } = await supabase.from('words').select('*').limit(1);
  if (error) {
    console.error('Error fetching words:', error);
    return;
  }
  console.log('Words Columns:', Object.keys(data[0] || {}));
}

checkWordsSchema();
