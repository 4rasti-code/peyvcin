const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let match = content.match(/<button[^>]*>\s*تە پەیڤا نهێنی ژبیر کرییە\؟\s*<\/button>/);
if (match) {
    console.log(match[0]);
} else {
    console.log("Could not find the forgot password button!");
}
