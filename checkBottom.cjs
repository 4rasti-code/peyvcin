const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let footerIndex = content.lastIndexOf('</div>');
let recentFooter = content.substring(content.lastIndexOf('activePolicyModal'), footerIndex + 10);
console.log(recentFooter);
