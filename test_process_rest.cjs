require('dotenv').config();
const fs = require('fs');
const https = require('https');

async function test() {
  const envFile = fs.readFileSync('.env', 'utf8');
  const url = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim().replace(/['"]/g, '');
  const key = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim().replace(/['"]/g, '');
  
  const pgRestUrl = `${url}/rest/v1/rpc/process_purchase`;
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
    res.on('end', () => console.log('process_purchase response:', res.statusCode, data));
  });
  
  req.write(JSON.stringify({
    p_item_id: 'hint_pack',
    p_item_type: 'powerup',
    p_currency_used: 'fils',
    p_price: 1000,
    p_amount: 0
  }));
  req.end();
}
test();
