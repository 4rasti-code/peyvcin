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
    
    // We can't query pg_trigger from REST API easily.
    // Instead, let's just create a dummy user, update raw_user_meta_data, and see if profiles changes!
    const supabase = createClient(url.replace(/['"]/g, ''), key.replace(/['"]/g, ''));
    
    const testEmail = `testtrigger${Date.now()}@test.com`;
    const { data: signUpData } = await supabase.auth.signUp({ email: testEmail, password: 'password123' });
    const userId = signUpData.user.id;
    await new Promise(r => setTimeout(r, 2000));
    
    // 1. Manually update profiles to something different
    await supabase.from('profiles').update({ avatar_url: 'av_different' }).eq('id', userId);
    
    // 2. Now update raw_user_meta_data to 'default'
    await supabase.auth.updateUser({
      data: { avatar_url: 'default' }
    });
    
    await new Promise(r => setTimeout(r, 2000));
    
    // 3. Check if profiles changed back to 'default'
    const { data: profile } = await supabase.from('profiles').select('avatar_url, updated_at').eq('id', userId).single();
    console.log("After auth update:", profile.avatar_url);
    
  } catch (e) {
    console.error(e);
  }
}
test();
