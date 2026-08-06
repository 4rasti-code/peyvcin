require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const https = require('https');

async function test() {
  const envFile = fs.readFileSync('.env', 'utf8');
  const url = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim().replace(/['"]/g, '');
  const key = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim().replace(/['"]/g, '');
  
  const pgRestUrl = `${url}/rest/v1/rpc/buy_powerup`;
  const options = {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    }
  };
  
  const req = https.request(pgRestUrl, options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => console.log('buy_powerup response:', res.statusCode, data));
  });
  
  req.write(JSON.stringify({
    p_item_id: 'hint_pack',
    p_currency_used: 'fils',
    p_price: 1000
  }));
  req.end();
}
test();
