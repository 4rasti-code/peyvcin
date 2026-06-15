const fs = require('fs');
const { mamakWords } = require('./src/data/mamakList.js');

let sql = '-- ئەڤ کۆدە د ناڤ SQL Editor یێ Supabase دا کارپێ بکە بۆ پاقژکرنا مامکان\n\n';

sql += 'UPDATE words\nSET category = \'مامک\', mode_tags = ARRAY[\'mamak\']\nWHERE hint IN (\n';

const hints = mamakWords.map(m => "  '" + m.hint.replace(/'/g, "''") + "'");
sql += hints.join(',\n');
sql += '\n);\n';

fs.writeFileSync('clean_mamak_in_supabase.sql', sql, 'utf8');
console.log('SQL generated!');
