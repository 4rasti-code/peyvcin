const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let containerStart = content.indexOf('<div className="w-full max-w-sm px-6">');
let tabsStart = content.indexOf('<div className="flex bg-', containerStart);
let formStart = content.indexOf('<form onSubmit={handleAuth}');
let dividerStart = content.indexOf('<div className="mt-4">', formStart);
let warningStart = content.indexOf('<div className="text-center mb-2 px-1 mt-3">', dividerStart);

console.log("containerStart:", containerStart);
console.log("tabsStart:", tabsStart);
console.log("formStart:", formStart);
console.log("dividerStart:", dividerStart);
console.log("warningStart:", warningStart);
