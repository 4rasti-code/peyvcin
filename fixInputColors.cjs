const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

// Fix suffix wrapper in FloatingInput
let suffixRegex = /className="absolute left-4 top-1\/2 -translate-y-1\/2 text-white\/30 hover:text-emerald-400 transition-colors z-20 flex items-center justify-center"/;
let newSuffixClass = 'className="absolute left-4 top-1/2 -translate-y-1/2 text-mono-400 dark:text-white/40 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors z-20 flex items-center justify-center"';
content = content.replace(suffixRegex, newSuffixClass);

// Fix eye icon button
let eyeBtnRegex = /className="flex items-center justify-center p-2 text-slate-900 hover:text-emerald-600 transition-colors"/g;
let newEyeBtnClass = 'className="flex items-center justify-center p-2 text-mono-400 dark:text-white/40 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"';
content = content.replace(eyeBtnRegex, newEyeBtnClass);

fs.writeFileSync(file, content, 'utf8');
console.log("Colors fixed for Dark/Light mode");
