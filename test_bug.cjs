require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = `test_${Date.now()}@test.com`;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'password123'
  });
  
  if (authError) {
    console.error("Signup failed:", authError.message);
    return;
  }
  
  console.log("Waiting for trigger to create profile...");
  await new Promise(r => setTimeout(r, 2000));
  
  // Give the user 2000 fils using service role (if we had it, but we can't). 
  // Let's just check default balance (should be 500 fils)
  // And try to buy something that costs 500 fils if possible, or 0.
  // Wait, price is a parameter! We can pass p_price = 10 to buy_powerup!
  
  console.log("Calling buy_powerup with p_price=100...");
  const { data: rpcData, error: rpcError } = await supabase.rpc('buy_powerup', {
    p_item_id: 'attractor_field',
    p_currency_used: 'fils',
    p_price: 100
  });
  
  console.log("RPC Data:", rpcData);
  if (rpcError) console.log("RPC Error:", rpcError);
  
  const { data: profile } = await supabase.from('profiles').select('fils, magnets, hints').eq('id', authData.user.id).single();
  console.log("Profile after purchase:", profile);
}

run();
