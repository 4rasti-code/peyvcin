const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let authViewStart = content.indexOf('function AuthView');
let returnStart = content.indexOf('return (', authViewStart);
console.log(content.substring(returnStart, returnStart + 2000));
