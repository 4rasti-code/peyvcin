const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

// Normalize
content = content.replace(/\r\n/g, '\n');

// FloatingInput
content = content.replace(/<label\s+htmlFor=\{id\}\s+className=\{`block text-\[11px\].*?`\}\s*>\s*\{label\}\s*<\/label>/s, '');
content = content.replace(/<input\s+id=\{id\}\s+type=\{type\}/, '<input\n                    id={id}\n                    type={type}\n                    placeholder={label}');
let inputClassRegex = /className=\{`w-full bg-transparent py-1\.5 sm:py-1 pr-4 \$\{suffix \? 'pl-10' : 'pl-4'\} font-rabar text-mono-900 dark:text-white text-base sm:text-sm font-bold focus:outline-none transition-all duration-200 caret-emerald-400 relative z-10`\}/;
let newClass = "className={`w-full bg-transparent py-2.5 sm:py-2 pr-4 ${suffix ? 'pl-10' : 'pl-4'} font-rabar text-mono-900 dark:text-white text-base sm:text-sm placeholder-mono-400 dark:placeholder-white/40 focus:outline-none transition-all duration-200 caret-emerald-400 relative z-10`}";
content = content.replace(inputClassRegex, newClass);
content = content.replace(/text-white\/30 hover:text-emerald-400 transition-colors z-20/g, 'text-mono-400 dark:text-white/40 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors z-20');
content = content.replace(/p-2 text-slate-900 hover:text-emerald-600/g, 'p-2 text-mono-400 dark:text-white/40 hover:text-emerald-500 dark:hover:text-emerald-400');

// Checkbox border removal
let checkboxRegex = /<label className="flex items-start gap-3 mt-4 mb-3 cursor-pointer bg-mono-100 dark:bg-white\/5 p-3 rounded-md border border-mono-200 dark:border-white\/10" dir="rtl">/;
content = content.replace(checkboxRegex, '<label className="flex items-start gap-3 mt-4 mb-3 cursor-pointer p-1" dir="rtl">');

fs.writeFileSync(file, content, 'utf8');
console.log("UI fixes re-applied!");
