require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function test() {
  try {
    const envFile = fs.readFileSync('.env', 'utf8');
    const urlMatch = envFile.match(/VITE_SUPABASE_URL=(.*)/);
    const keyMatch = envFile.match(/VITE_SUPABASE_SERVICE_ROLE_KEY=(.*)/);
    
    if (!urlMatch || !keyMatch) {
      console.log("No service role key");
      return;
    }
    
    const url = urlMatch[1].trim().replace(/['"]/g, '');
    const key = keyMatch[1].trim().replace(/['"]/g, '');
    const supabase = createClient(url, key);
    
    // Check columns of profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('magnets, hints, skips')
      .limit(1);
    
    console.log("Error:", error);
    console.log("Data:", data);
  } catch(e) {
    console.log("Exception:", e);
  }
}

test();
