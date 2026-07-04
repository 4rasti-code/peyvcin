const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let topCode = content.substring(0, 1000);
console.log("Top code:\n", topCode);
