const fs = require('fs');

function translateLogo(file, isKurdishVar) {
    let content = fs.readFileSync(file, 'utf8');

    // Replace the hardcoded Kurdish logo text with dynamic text
    // The exact string we're replacing is:
    // <h1 className="text-4xl font-bold text-mono-900 dark:text-white mb-1">پەیڤۆک</h1>
    
    // Sometimes it might have slightly different classes, let's use regex matching the tag structure
    // DataDeletion.jsx: <h1 className="text-4xl font-bold text-mono-900 dark:text-white mb-1">پەیڤۆک</h1> (actually DataDeletion has font-heading and bg-clip-text etc?)
    // Let's just find ">پەیڤۆک</h1>" and replace it with `>{isKurdishVar ? 'پەیڤۆک' : 'Peyvok'}</h1>`
    
    content = content.replace(/>پەیڤۆک<\/h1>/g, `>{${isKurdishVar} ? 'پەیڤۆک' : 'Peyvok'}</h1>`);

    fs.writeFileSync(file, content, 'utf8');
}

translateLogo('src/components/TermsOfService.jsx', "lang === 'ku'");
translateLogo('src/components/PrivacyPolicy.jsx', "lang === 'ku'");
translateLogo('src/components/DataDeletion.jsx', "isKurdish");

console.log("Logos translated successfully!");
