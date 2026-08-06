require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function test() {
  const envFile = fs.readFileSync('.env', 'utf8');
  const url = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim().replace(/['"]/g, '');
  const key = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim().replace(/['"]/g, '');
  const supabase = createClient(url, key);
  
  const { data, error } = await supabase.from('profiles').select('hints').limit(5);
  console.log("Hints values:", data);
}
test();
