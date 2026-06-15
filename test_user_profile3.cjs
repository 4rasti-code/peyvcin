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
    
    console.log("Attempting RPC update...");
    const { error: rpcError } = await supabase.rpc('update_profile_identity', {
        p_nickname: 'Kurdistan1',
        p_avatar_url: 'av7',
        p_country_code: 'IQ',
        p_is_in_kurdistan: true
    });
    console.log("RPC error:", rpcError);
    
    const { data: profile } = await supabase.from('profiles').select('avatar_url, updated_at').eq('id', userId).single();
    console.log("After RPC update:", profile);
    
  } catch (e) {
    console.error(e);
  }
}
test();
