require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function test() {
  try {
    const envFile = fs.readFileSync('.env', 'utf8');
    const urlMatch = envFile.match(/VITE_SUPABASE_URL=(.*)/);
    const keyMatch = envFile.match(/VITE_SUPABASE_SERVICE_ROLE_KEY=(.*)/);
    const anonKeyMatch = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
    const url = urlMatch ? urlMatch[1].trim() : process.env.VITE_SUPABASE_URL;
    let key = keyMatch ? keyMatch[1].trim() : null;
    if (!key) key = anonKeyMatch ? anonKeyMatch[1].trim() : process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!url || !key) return;
    const supabase = createClient(url.replace(/['"]/g, ''), key.replace(/['"]/g, ''));
    
    const userId = 'addde1d4-d453-4497-8e41-dfd09cab279f';
    
    // Fetch
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    console.log("Current Profile for user", userId, ":");
    console.log("Avatar URL:", profile?.avatar_url);
    console.log("Nickname:", profile?.nickname);
    console.log("Updated at:", profile?.updated_at);
    
  } catch (e) {
    console.error(e);
  }
}
test();
