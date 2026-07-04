const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');
let tabsPos = content.indexOf('isLogin ? \'text-white\' : \'text-mono-500');
let start = content.lastIndexOf('<div className="flex ', tabsPos);
console.log(content.substring(start, start + 300));
