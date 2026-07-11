const fs = require('fs');
let svg = fs.readFileSync('public/icons/Pahlawan.svg', 'utf8');

// The original was:
// <circle class="st13" cx="248" cy="95" r="52.5"/>
// <g transform="translate(248, 95) scale(0.4) translate(-248, -95)">

svg = svg.replace('<circle class="st13" cx="248" cy="95" r="52.5"/>\r\n\t<g transform="translate(248, 95) scale(0.4) translate(-248, -95)">', 
'<g transform="translate(248, 95) scale(0.4) translate(-248, -95)">\r\n\t\t<circle class="st13" cx="248" cy="95" r="52.5"/>');

if (!svg.includes('<g transform="translate(248, 95) scale(0.4) translate(-248, -95)">\r\n\t\t<circle class="st13" cx="248" cy="95" r="52.5"/>')) {
    svg = svg.replace('<circle class="st13" cx="248" cy="95" r="52.5"/>\n\t<g transform="translate(248, 95) scale(0.4) translate(-248, -95)">', 
'<g transform="translate(248, 95) scale(0.4) translate(-248, -95)">\n\t\t<circle class="st13" cx="248" cy="95" r="52.5"/>');
}

fs.writeFileSync('public/icons/Pahlawan.svg', svg);
console.log('Moved inner circle into scaled group.');
