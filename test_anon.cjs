require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('profiles').select('fils').limit(1);
  console.log("Can anon query profiles?", error ? "No" : "Yes", data);
}
run();
