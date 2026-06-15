const fs = require('fs');
const { mamakWords } = require('./src/data/mamakList.js');

let sql = '-- ئەڤ کۆدە د ناڤ SQL Editor دا کارپێ بکە\n\n';

const conditions = mamakWords.map(m => {
  const w = m.word.replace(/'/g, "''");
  const h = m.hint.replace(/'/g, "''");
  return `  (w1.word = '${w}' AND w1.hint = '${h}')`;
}).join(' OR\n');

const conditionsUpdate = mamakWords.map(m => {
  const w = m.word.replace(/'/g, "''");
  const h = m.hint.replace(/'/g, "''");
  return `  (word = '${w}' AND hint = '${h}')`;
}).join(' OR\n');

sql += `-- پێنگاڤا ئێکێ: سڕینەڤەیا ئەو مامکێن کو ب شاشی هاتینە زێدەکرن، لێ ژبەرێڤە ب دروستی وەکو "مامک" د داتابەیسێ دا هەنە (بۆ ڕێگریکردن ل دووبارەبوونێ)\n`;
sql += `DELETE FROM words w1\n`;
sql += `WHERE w1.category != 'مامک'\n`;
sql += `AND (\n${conditions}\n)\n`;
sql += `AND EXISTS (\n`;
sql += `  SELECT 1 FROM words w2 \n`;
sql += `  WHERE w2.word = w1.word \n`;
sql += `  AND w2.category = 'مامک'\n`;
sql += `);\n\n`;

sql += `-- پێنگاڤا دووێ: گوهۆڕینا کاتاگۆرییا ئەو مامکێن کو بتنێ ب شاشی هاتینە خەزنکرن و دووبارە نینن\n`;
sql += `UPDATE words\n`;
sql += `SET category = 'مامک', mode_tags = ARRAY['mamak']\n`;
sql += `WHERE category != 'مامک'\n`;
sql += `AND (\n${conditionsUpdate}\n);\n`;

fs.writeFileSync('clean_mamak_safe_full.sql', sql, 'utf8');
console.log('Safe Full SQL generated!');
