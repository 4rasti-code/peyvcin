const fs = require('fs');
let svg = fs.readFileSync('public/icons/Pahlawan.svg', 'utf8');

// The original file currently has:
// <circle class="st12" cx="248" cy="95" r="70"/>
// 	<g transform="translate(248, 95) scale(0.4) translate(-248, -95)">
// 		<circle class="st13" cx="248" cy="95" r="52.5"/>

svg = svg.replace('<circle class="st12" cx="248" cy="95" r="70"/>\r\n\t<g transform="translate(248, 95) scale(0.4) translate(-248, -95)">\r\n\t\t<circle class="st13" cx="248" cy="95" r="52.5"/>',
'<g transform="translate(248, 95) scale(0.6) translate(-248, -95)">\r\n\t\t<circle class="st12" cx="248" cy="95" r="70"/>\r\n\t\t<circle class="st13" cx="248" cy="95" r="52.5"/>');

if (!svg.includes('scale(0.6)')) {
    svg = svg.replace('<circle class="st12" cx="248" cy="95" r="70"/>\n\t<g transform="translate(248, 95) scale(0.4) translate(-248, -95)">\n\t\t<circle class="st13" cx="248" cy="95" r="52.5"/>',
'<g transform="translate(248, 95) scale(0.6) translate(-248, -95)">\n\t\t<circle class="st12" cx="248" cy="95" r="70"/>\n\t\t<circle class="st13" cx="248" cy="95" r="52.5"/>');
}

fs.writeFileSync('public/icons/Pahlawan.svg', svg);
console.log('Scaled all circles together.');
