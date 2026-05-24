import fs from 'fs';
let txt = fs.readFileSync('src/data/humanNamesList.js', 'utf8');
const regex = new RegExp('.*"word": "بەھار".*\\n?', 'g');
txt = txt.replace(regex, '');
fs.writeFileSync('src/data/humanNamesList.js', txt);
