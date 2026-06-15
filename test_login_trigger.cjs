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
    
    if (!url || !key) return;
    const supabase = createClient(url.replace(/['"]/g, ''), key.replace(/['"]/g, ''));
    
    // Create a new account with email/password to test the auth trigger!
    const testEmail = `test${Date.now()}@test.com`;
    console.log("Signing up user:", testEmail);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: 'password123'
    });
    
    if (signUpError) {
        console.error("Sign up failed:", signUpError.message);
        return;
    }
    
    const userId = signUpData.user.id;
    console.log("Created user", userId);
    
    // Wait for trigger to create profile
    await new Promise(r => setTimeout(r, 2000));
    
    // 1. Update profiles table directly
    await supabase.from('profiles').update({ avatar_url: 'av3' }).eq('id', userId);
    
    // 2. Fetch it
    const { data: p1 } = await supabase.from('profiles').select('avatar_url').eq('id', userId).single();
    console.log("After manual update:", p1.avatar_url);
    
    // 3. Update auth.users metadata (what updateProfile does)
    await supabase.auth.updateUser({
        data: { avatar_url: 'av3' }
    });
    
    // 4. Sign out and sign back in to trigger last_sign_in_at
    await supabase.auth.signOut();
    await supabase.auth.signInWithPassword({
        email: testEmail,
        password: 'password123'
    });
    
    // Wait for trigger
    await new Promise(r => setTimeout(r, 2000));
    
    // 5. Fetch profile again
    const { data: p2 } = await supabase.from('profiles').select('avatar_url').eq('id', userId).single();
    console.log("After relogin:", p2.avatar_url);
    
  } catch (e) {
    console.error(e);
  }
}
test();
