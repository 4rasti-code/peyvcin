const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let formStart = content.indexOf('<form onSubmit={handleAuth}');
let previousContent = content.substring(Math.max(0, formStart - 3000), formStart);
console.log(previousContent);
