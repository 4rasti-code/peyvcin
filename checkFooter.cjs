const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let startIndex = content.indexOf('<div className="mt-6 mb-2 text-center space-y-4">');
if (startIndex !== -1) {
    let endIndex = content.indexOf('</div>', content.indexOf('</div>', startIndex) + 1) + 6;
    console.log(content.substring(startIndex, endIndex));
}
