const fs = require('fs');

function fixFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix logical properties for Borders and Padding
    content = content.replace(/border-r-4/g, 'border-s-4');
    content = content.replace(/pr-6/g, 'ps-6');
    content = content.replace(/pr-12/g, 'ps-12');
    
    // Enforce text-start on the paragraphs and sections
    content = content.replace(/className="text-xl/g, 'className="text-start text-xl');
    content = content.replace(/className="text-mono-600 dark:text-white\/60/g, 'className="text-start text-mono-600 dark:text-white/60');
    content = content.replace(/text-center sm:text-start/g, 'text-start');

    fs.writeFileSync(file, content, 'utf8');
}

fixFile('src/components/TermsOfService.jsx');
fixFile('src/components/PrivacyPolicy.jsx');
fixFile('src/components/DataDeletion.jsx');
console.log("Fixed files!");
