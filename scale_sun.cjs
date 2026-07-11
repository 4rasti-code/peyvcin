const fs = require('fs');
let svg = fs.readFileSync('public/icons/Pahlawan.svg', 'utf8');

// The original line is something like:
// <g>
//   <circle class="st14" cx="248" cy="95" r="20"/>

if (svg.includes('<g transform="translate(248, 95) scale(')) {
    // Already scaled, maybe replace the scale
    svg = svg.replace(/<g transform="translate\(248, 95\) scale\([^)]+\) translate\(-248, -95\)">/, '<g transform="translate(248, 95) scale(0.7) translate(-248, -95)">');
} else {
    // Wrap it
    svg = svg.replace(
        '<g>\r\n\t\t<circle class="st14" cx="248" cy="95" r="20"/>', 
        '<g transform="translate(248, 95) scale(0.7) translate(-248, -95)">\r\n\t\t<circle class="st14" cx="248" cy="95" r="20"/>'
    );
    
    // If \r\n didn't match, try \n
    if (!svg.includes('scale(0.7)')) {
        svg = svg.replace(
            '<g>\n\t\t<circle class="st14" cx="248" cy="95" r="20"/>', 
            '<g transform="translate(248, 95) scale(0.7) translate(-248, -95)">\n\t\t<circle class="st14" cx="248" cy="95" r="20"/>'
        );
    }
}

fs.writeFileSync('public/icons/Pahlawan.svg', svg);
console.log('Scaled down sun.');
