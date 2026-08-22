const fs = require('fs');
let code = fs.readFileSync('dist/assets/HowToPlayModal-CAJ9zSSK.js', 'utf8');

// Match everything that looks like Kurdish text or game grid
const strings = code.match(/["'][^"']*[چەپەرڤڕکیپەیڤ][^"']*["']/g) || [];
fs.writeFileSync('d:/Peyvok_App/extracted_strings.txt', strings.join('\n'), 'utf8');
console.log('Saved extracted strings');
