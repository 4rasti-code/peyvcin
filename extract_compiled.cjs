const fs = require('fs');

const code = fs.readFileSync('dist/assets/HowToPlayModal-CAJ9zSSK.js', 'utf8');

const mMatch = code.match(/p===`multiplayer`\?(.*?)\:p===`mamak`/);
if (mMatch) {
  fs.writeFileSync('d:/Peyvok_App/multiplayer_compiled.txt', mMatch[1], 'utf8');
}

const mamakMatch = code.match(/p===`mamak`\?(.*?)\:p===`word_fever`/);
if (mamakMatch) {
  fs.writeFileSync('d:/Peyvok_App/mamak_compiled.txt', mamakMatch[1], 'utf8');
}

console.log('Done extracting compiled logic');
