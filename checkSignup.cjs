const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let confirmIndex = content.indexOf('label="دوبارەکرنا پەیڤا نهێنی"');
if (confirmIndex !== -1) {
    let startIndex = Math.max(0, confirmIndex - 200);
    let endIndex = Math.min(content.length, confirmIndex + 1000);
    console.log(content.substring(startIndex, endIndex));
}
