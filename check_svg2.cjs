const fs = require('fs');
let svg = fs.readFileSync('public/icons/Pahlawan.svg', 'utf8');
const start = svg.indexOf('<circle class="st12"');
console.log(svg.substring(start, start + 400));
