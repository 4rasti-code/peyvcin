require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function test() {
  try {
    const envFile = fs.readFileSync('.env', 'utf8');
    const urlMatch = envFile.match(/VITE_SUPABASE_URL=(.*)/);
    const keyMatch = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
    const url = urlMatch ? urlMatch[1].trim() : process.env.VITE_SUPABASE_URL;
    const key = keyMatch ? keyMatch[1].trim() : process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
        console.error("No url or key found");
        return;
    }
    const supabase = createClient(url.replace(/['"]/g, ''), key.replace(/['"]/g, ''));
    
    // Try to call the RPC with dummy data to see if it exists
    const { data, error } = await supabase.rpc('update_profile_identity', {
        p_nickname: 'test',
        p_avatar_url: 'test',
        p_country_code: 'IQ',
        p_is_in_kurdistan: true
    });
    
    console.log("RPC Test Result:", { data, error });
    
    // Check if RLS allows direct updates to avatar_url
    // We need a dummy user token, so we'll just check if profiles table has RLS enabled
    const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(1);
    console.log("Profiles access test:", { hasData: profiles?.length > 0, error: pError?.message });
  } catch (e) {
    console.error(e);
  }
}
test();
