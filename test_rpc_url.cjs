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
    
    // We can fetch the function definition from pg_proc using a raw SQL if we had REST access...
    // But Supabase doesn't let us query pg_proc easily from JS.
    // Instead, let's test if the RPC TRUNCATES the URL!
    
    const supabase = createClient(url.replace(/['"]/g, ''), key.replace(/['"]/g, ''));
    
    // Let's create a test user
    const testEmail = `testrpc${Date.now()}@test.com`;
    const { data: signUpData } = await supabase.auth.signUp({ email: testEmail, password: 'password123' });
    const userId = signUpData.user.id;
    await new Promise(r => setTimeout(r, 2000));
    
    // Authenticate as this user so RPC works!
    await supabase.auth.signInWithPassword({ email: testEmail, password: 'password123' });
    
    const longUrl = "https://vjyljpswdfcpxb.supabase.co/storage/v1/object/public/avatars/addde1d4-d453-4497-8e41-dfd09cab279f-1736668748492.jpg";
    
    console.log("Calling RPC with long URL...");
    const { error: rpcError } = await supabase.rpc('update_profile_identity', {
        p_nickname: 'Kurdistan1',
        p_avatar_url: longUrl,
        p_country_code: 'IQ',
        p_is_in_kurdistan: true
    });
    console.log("RPC error:", rpcError);
    
    const { data: profile } = await supabase.from('profiles').select('avatar_url').eq('id', userId).single();
    console.log("After RPC update, avatar_url in DB is:", profile?.avatar_url);
    
  } catch (e) {
    console.error(e);
  }
}
test();
