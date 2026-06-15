const fs = require('fs');
const { mamakWords } = require('./src/data/mamakList.js');

let sql = '-- ئەڤ کۆدە د ناڤ SQL Editor یێ Supabase دا کارپێ بکە بۆ پاقژکرنا مامکان\n\n';

sql += 'UPDATE words\nSET category = \'مامک\', mode_tags = ARRAY[\'mamak\']\nWHERE \n';

const conditions = mamakWords.map(m => {
  const w = m.word.replace(/'/g, "''");
  const h = m.hint.replace(/'/g, "''");
  return `  (word = '${w}' AND hint = '${h}')`;
});

sql += conditions.join(' OR\n');
sql += ';\n';

fs.writeFileSync('clean_mamak_in_supabase_full.sql', sql, 'utf8');
console.log('SQL generated with both words and hints!');
