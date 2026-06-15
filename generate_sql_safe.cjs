const fs = require('fs');
const { mamakWords } = require('./src/data/mamakList.js');

let sql = '-- ئەڤ کۆدە د ناڤ SQL Editor دا کارپێ بکە\n\n';

const hints = mamakWords.map(m => "  '" + m.hint.replace(/'/g, "''") + "'").join(',\n');

sql += `-- پێنگاڤا ئێکێ: سڕینەڤەیا ئەو مامکێن کو ب شاشی هاتینە زێدەکرن، لێ ژبەرێڤە ب دروستی وەکو "مامک" د داتابەیسێ دا هەنە (بۆ ڕێگریکردن ل دووبارەبوونێ)\n`;
sql += `DELETE FROM words w1\n`;
sql += `WHERE w1.category != 'مامک'\n`;
sql += `AND w1.hint IN (\n${hints}\n)\n`;
sql += `AND EXISTS (\n`;
sql += `  SELECT 1 FROM words w2 \n`;
sql += `  WHERE w2.word = w1.word \n`;
sql += `  AND w2.category = 'مامک'\n`;
sql += `);\n\n`;

sql += `-- پێنگاڤا دووێ: گوهۆڕینا کاتاگۆرییا ئەو مامکێن کو بتنێ ب شاشی هاتینە خەزنکرن و دووبارە نینن\n`;
sql += `UPDATE words\n`;
sql += `SET category = 'مامک', mode_tags = ARRAY['mamak']\n`;
sql += `WHERE category != 'مامک'\n`;
sql += `AND hint IN (\n${hints}\n);\n`;

fs.writeFileSync('clean_mamak_in_supabase_safe.sql', sql, 'utf8');
console.log('Safe SQL generated!');
