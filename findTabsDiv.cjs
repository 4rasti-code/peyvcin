const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let tabsIdentifierPos = content.indexOf("isLogin ? 'چوونا ژوورێ'");
let beforeTabs = content.substring(Math.max(0, tabsIdentifierPos - 1000), tabsIdentifierPos);
console.log(beforeTabs);
