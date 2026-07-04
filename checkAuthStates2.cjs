const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let startIndex = content.indexOf('export default function AuthView');
let endIndex = content.indexOf('return (', startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    console.log(content.substring(startIndex, endIndex));
}
