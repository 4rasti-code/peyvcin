const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let delStart = content.indexOf('ژێبرنا داتایان</button>');
console.log(content.substring(delStart, delStart + 200));
