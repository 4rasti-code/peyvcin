const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the external label
let labelRegex = /<label\s+htmlFor=\{id\}\s+className=\{`block text-\[11px\].*?`\}\s*>\s*\{label\}\s*<\/label>/s;
content = content.replace(labelRegex, '');

// 2. Add placeholder to the input
// Find the input element inside FloatingInput
let inputRegex = /<input\s+id=\{id\}\s+type=\{type\}/;
content = content.replace(inputRegex, '<input\n                    id={id}\n                    type={type}\n                    placeholder={label}');

// Add placeholder styling to the input className
let inputClassRegex = /className=\{`w-full bg-transparent py-1\.5 sm:py-1 pr-4 \$\{suffix \? 'pl-10' : 'pl-4'\} font-rabar text-mono-900 dark:text-white text-base sm:text-sm font-bold focus:outline-none transition-all duration-200 caret-emerald-400 relative z-10`\}/;
content = content.replace(
    inputClassRegex,
    "className={`w-full bg-transparent py-2.5 sm:py-2 pr-4 ${suffix ? 'pl-10' : 'pl-4'} font-rabar text-mono-900 dark:text-white text-base sm:text-sm font-bold placeholder-mono-400 dark:placeholder-white/40 focus:outline-none transition-all duration-200 caret-emerald-400 relative z-10`}"
);

fs.writeFileSync(file, content, 'utf8');
console.log("FloatingInput simplified to use placeholders");
