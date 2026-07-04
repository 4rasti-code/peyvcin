const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let startIndex = content.indexOf('<div className="w-full flex flex-col mt-2 space-y-3">');
let endIndex = content.indexOf(') : (', startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    console.log(content.substring(startIndex, endIndex));
}
