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
    
    // Create dummy user
    const testEmail = `test${Date.now()}@test.com`;
    const { data: signUpData } = await supabase.auth.signUp({ email: testEmail, password: 'password123' });
    const userId = signUpData.user.id;
    await new Promise(r => setTimeout(r, 2000));
    
    // Simulate what updateProfile does with a public URL!
    const publicUrl = "https://vjyljpswdfcpxb.supabase.co/storage/v1/object/public/avatars/test.jpg";
    
    // 1. RPC update (like updateProfile does)
    const { error: rpcError } = await supabase.rpc('update_profile_identity', {
        p_nickname: 'TestUser',
        p_avatar_url: publicUrl,
        p_country_code: 'IQ',
        p_is_in_kurdistan: true
    });
    console.log("RPC update:", rpcError ? rpcError.message : "Success");
    
    // 2. Direct update (like fallback does)
    const { error: directError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);
    console.log("Direct update:", directError ? directError.message : "Success");
    
    // 3. Fetch
    const { data: profile } = await supabase.from('profiles').select('avatar_url').eq('id', userId).single();
    console.log("Profile avatar_url in DB:", profile.avatar_url);
    
  } catch (e) {
    console.error(e);
  }
}
test();
