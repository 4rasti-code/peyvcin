
import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://phmztiiabmkdotxkyxtk.supabase.co', 'sb_publishable_4jqo-mI91tJ1DFTwTFFttQ_RqZS8snj');

async function test() {
  const { data, error } = await supabase.from('profiles').select('id, nickname').limit(5);
  console.log(data);
}
test();

