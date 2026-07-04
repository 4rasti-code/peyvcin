const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

// Update modal container classes
let modalContainerSearch = `className="relative w-full max-w-sm bg-mono-100 dark:bg-mono-900 border border-mono-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"`;
let modalContainerReplace = `className="relative w-full max-w-sm bg-white dark:bg-black/80 backdrop-blur-xl border border-mono-200 dark:border-white/10 rounded-lg shadow-2xl overflow-hidden"`;

if (content.includes('bg-mono-100 dark:bg-mono-900')) {
    content = content.replace(modalContainerSearch, modalContainerReplace);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Modal styling updated successfully!");
} else {
    console.log("Could not find the modal container styling.");
}
