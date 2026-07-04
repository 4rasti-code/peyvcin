const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let match = content.match(/<button[^>]*onClick=\{\(\) => handleSocialLogin\('discord'\)\}[^>]*>[\s\S]*?<\/button>/);
if (match) {
    console.log(match[0]);
}
