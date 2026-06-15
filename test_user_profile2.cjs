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
    
    // Check if there is a trigger
    const { data: triggers, error } = await supabase.rpc('get_triggers_dummy_name_that_will_fail');
    // Actually we can just execute a raw query using a generic RPC if one exists, but we can't easily.
    
    // Instead, let's test if updateProfile ACTUALLY saves the URL for THIS user!
    const userId = 'addde1d4-d453-4497-8e41-dfd09cab279f';
    
    console.log("Attempting direct update to user's profile...");
    const { error: updateError } = await supabase.from('profiles').update({ avatar_url: 'av3' }).eq('id', userId);
    console.log("Direct update error:", updateError);
    
    const { data: profile } = await supabase.from('profiles').select('avatar_url, updated_at').eq('id', userId).single();
    console.log("After direct update:", profile);
    
  } catch (e) {
    console.error(e);
  }
}
test();
