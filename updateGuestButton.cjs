const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let guestSearch = `className="relative w-full h-11 sm:h-10 bg-transparent border-2 border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-500 rounded-md flex items-center justify-center active:scale-95 transition-all"`;

let guestReplace = `className="relative w-full h-11 sm:h-10 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 dark:text-emerald-500 rounded-md flex items-center justify-center active:scale-95 transition-all"`;

if (content.includes('border-2 border-emerald-500/50')) {
    content = content.replace(guestSearch, guestReplace);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Guest button style updated to premium tinted glass.");
} else {
    console.log("Could not find the guest button styling.");
}
