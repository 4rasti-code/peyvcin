const fs = require('fs');
let svg = fs.readFileSync('public/icons/Pahlawan.svg', 'utf8');

// The unclosed tag is:
// <g transform="translate(248, 95) scale(0.6) translate(-248, -95)">
// 		<circle class="st12" cx="248" cy="95" r="70"/>
// 		<circle class="st13" cx="248" cy="95" r="52.5"/>

svg = svg.replace('<circle class="st13" cx="248" cy="95" r="52.5"/>', '<circle class="st13" cx="248" cy="95" r="52.5"/>\n\t</g>');

fs.writeFileSync('public/icons/Pahlawan.svg', svg);
console.log('Fixed unclosed <g> in SVG.');
