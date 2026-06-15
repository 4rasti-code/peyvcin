require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vjyljpswdfcpxb.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

// Try importing from the app's lib/supabase.js if environment variables aren't set up directly
async function test() {
  try {
    const fs = require('fs');
    let url = supabaseUrl;
    let key = supabaseKey;
    
    if (!key) {
       // Just read from env file
       const envFile = fs.readFileSync('.env.local', 'utf8');
       const urlMatch = envFile.match(/VITE_SUPABASE_URL=(.*)/);
       const keyMatch = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
       if (urlMatch) url = urlMatch[1].trim();
       if (keyMatch) key = keyMatch[1].trim();
    }
    
    const supabase = createClient(url, key);
    
    // Check table schema
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) console.error("Query Error:", error);
    else {
        if (data.length > 0) {
            console.log("Columns:", Object.keys(data[0]));
        } else {
            console.log("Table is empty but exists.");
        }
    }
  } catch (e) {
    console.error(e);
  }
}
test();
