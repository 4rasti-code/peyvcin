const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let startIndex = content.indexOf('تۆمارکرن ب ئیمەیڵی');
let endIndex = content.indexOf('چوونا ژوورێ ب ئیمەیڵی', startIndex);
if (startIndex !== -1 && endIndex !== -1) {
    console.log(content.substring(startIndex - 500, endIndex + 500));
}
