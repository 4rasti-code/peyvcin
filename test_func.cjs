require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function test() {
  const envFile = fs.readFileSync('.env', 'utf8');
  const url = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim().replace(/['"]/g, '');
  const key = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim().replace(/['"]/g, '');
  const supabase = createClient(url, key);
  
  // get function definition from pg_proc
  const { data, error } = await supabase.rpc('execute_sql', { sql: "SELECT prosrc FROM pg_proc WHERE proname = 'buy_powerup'" });
  console.log("buy_powerup SQL:", data);
}
test();
