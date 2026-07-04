const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

console.log("TABS index:", content.indexOf('TABS'));
console.log("form index:", content.indexOf('<form'));
console.log("یان ب ڕێکا index:", content.indexOf('یان ب ڕێکا'));
console.log("SOCIAL WARNING index:", content.indexOf('<div className="text-center mb-2 px-1 mt-3">'));
