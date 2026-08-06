require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = `testuser_${Date.now()}@example.com`;
  console.log("Signing up:", email);
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'password123'
  });
  
  if (error) {
    console.error("Signup failed:", error.message);
    return;
  }
  
  const userId = data.user.id;
  
  // Update fils to 1000 using anon key (might fail due to RLS, let's see)
  console.log("Giving 1000 fils...");
  const { error: updateErr } = await supabase.from('profiles').update({ fils: 1000 }).eq('id', userId);
  if (updateErr) {
    console.log("Update fils failed via normal role. This might be normal if RLS prevents it.");
  }
  
  console.log("Calling buy_powerup for attractor_field...");
  const { data: rpcData, error: rpcError } = await supabase.rpc('buy_powerup', {
    p_item_id: 'attractor_field',
    p_currency_used: 'fils',
    p_price: 1000
  });
  
  console.log("RPC Data:", rpcData);
  console.log("RPC Error:", rpcError);
  
  const { data: profile } = await supabase.from('profiles').select('fils, magnets, hints').eq('id', userId).single();
  console.log("Profile after:", profile);
}

run();
