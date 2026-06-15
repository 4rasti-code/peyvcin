require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function test() {
  try {
    const envFile = fs.readFileSync('.env', 'utf8');
    const urlMatch = envFile.match(/VITE_SUPABASE_URL=(.*)/);
    const keyMatch = envFile.match(/VITE_SUPABASE_SERVICE_ROLE_KEY=(.*)/); // use service role if available to check RLS
    const anonKeyMatch = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
    const url = urlMatch ? urlMatch[1].trim() : process.env.VITE_SUPABASE_URL;
    let key = keyMatch ? keyMatch[1].trim() : null;
    
    // If no service key, try anon key
    if (!key) key = anonKeyMatch ? anonKeyMatch[1].trim() : process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
        console.error("No url or key found");
        return;
    }
    const supabase = createClient(url.replace(/['"]/g, ''), key.replace(/['"]/g, ''));
    
    // We can't easily query pg_policies via REST, so let's just attempt to update a dummy profile using anon key
    // Actually, let's just try to create a dummy user and update it
    
    console.log("To check RLS, we'll try to update a specific profile anonymously");
    const { data: profile } = await supabase.from('profiles').select('id').limit(1).single();
    if (profile) {
        const { error } = await supabase.from('profiles').update({ haptic_enabled: true }).eq('id', profile.id);
        console.log("Update test (anon):", error ? error.message : "Success");
    }
  } catch (e) {
    console.error(e);
  }
}
test();
