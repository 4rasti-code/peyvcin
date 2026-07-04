const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let match = content.match(/onSubmit=\{([^}]+)\}/);
console.log(match ? match[1] : "Not found");
