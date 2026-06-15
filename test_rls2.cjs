require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function test() {
  try {
    const envFile = fs.readFileSync('.env', 'utf8');
    const urlMatch = envFile.match(/VITE_SUPABASE_URL=(.*)/);
    const anonKeyMatch = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
    const url = urlMatch ? urlMatch[1].trim() : process.env.VITE_SUPABASE_URL;
    const key = anonKeyMatch ? anonKeyMatch[1].trim() : process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!url || !key) return;
    const supabase = createClient(url.replace(/['"]/g, ''), key.replace(/['"]/g, ''));
    
    console.log("To check RLS, we'll try to update avatar_url specifically");
    const { data: profile } = await supabase.from('profiles').select('id, avatar_url').limit(1).single();
    if (profile) {
        console.log("Current avatar:", profile.avatar_url);
        const { error } = await supabase.from('profiles').update({ avatar_url: 'av3' }).eq('id', profile.id);
        console.log("Update avatar_url test:", error ? error.message : "Success");
    }
  } catch (e) {
    console.error(e);
  }
}
test();
