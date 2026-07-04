const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let startIndex = content.indexOf('<AnimatePresence');
let endIndex = content.indexOf('</AnimatePresence>', startIndex) + 18;

if (startIndex !== -1 && endIndex !== -1) {
    console.log(content.substring(startIndex, endIndex));
}
