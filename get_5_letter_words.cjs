const fs = require('fs');
let content = fs.readFileSync('src/data/generalWordsList.js', 'utf8');
const regex = /['"](چ[^'"]{4})['"]/g;
let match;
const words = [];
while ((match = regex.exec(content)) !== null) {
  words.push(match[1]);
}
console.log(words);
