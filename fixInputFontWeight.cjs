const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

// The input class currently has `font-bold`
let inputClassRegex = /className=\{`w-full bg-transparent py-2\.5 sm:py-2 pr-4 \$\{suffix \? 'pl-10' : 'pl-4'\} font-rabar text-mono-900 dark:text-white text-base sm:text-sm font-bold placeholder-mono-400 dark:placeholder-white\/40 focus:outline-none transition-all duration-200 caret-emerald-400 relative z-10`\}/;

let newClass = "className={`w-full bg-transparent py-2.5 sm:py-2 pr-4 ${suffix ? 'pl-10' : 'pl-4'} font-rabar text-mono-900 dark:text-white text-base sm:text-sm placeholder-mono-400 dark:placeholder-white/40 focus:outline-none transition-all duration-200 caret-emerald-400 relative z-10`}";

content = content.replace(inputClassRegex, newClass);

fs.writeFileSync(file, content, 'utf8');
console.log("Input font changed to normal weight");
