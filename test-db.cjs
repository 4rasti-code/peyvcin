const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://phmztiiabmkdotxkyxtk.supabase.co', 'sb_publishable_4jqo-mI91tJ1DFTwTFFttQ_RqZS8snj');

async function test() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) console.error("Error fetching profiles:", error);
  else console.log("Profile keys:", Object.keys(data[0] || {}));
}

test();
