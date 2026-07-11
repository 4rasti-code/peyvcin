const fs = require('fs');
let svg = fs.readFileSync('public/icons/Pahlawan.svg', 'utf8');

svg = svg.replace(/<g transform="translate\(248, 95\) scale\(0\.7\) translate\(-248, -95\)">/g, '<g transform="translate(248, 95) scale(0.4) translate(-248, -95)">');

fs.writeFileSync('public/icons/Pahlawan.svg', svg);
console.log('Scaled down sun to 0.4.');
