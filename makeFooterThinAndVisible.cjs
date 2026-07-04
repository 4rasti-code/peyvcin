const fs = require('fs');

function makeFooterThinAndVisible(file) {
    let content = fs.readFileSync(file, 'utf8');

    // Replace the current class:
    // className="mt-8 text-center text-mono-400 dark:text-white/30 uppercase font-normal tracking-wide text-sm"
    // with:
    // className="mt-8 text-center text-mono-500 dark:text-mono-300 uppercase font-light tracking-wide text-sm opacity-90"
    
    // Privacy and Terms:
    content = content.replace(
        /className="mt-8 text-center text-mono-400 dark:text-white\/30 uppercase font-normal tracking-wide text-sm"/g,
        'className="mt-8 text-center text-mono-500 dark:text-mono-300 uppercase font-light tracking-wide text-sm opacity-90"'
    );

    // DataDeletion:
    content = content.replace(
        /className="mt-12 text-center text-mono-400 dark:text-white\/30 uppercase font-normal tracking-wide text-sm"/g,
        'className="mt-12 text-center text-mono-500 dark:text-mono-300 uppercase font-light tracking-wide text-sm opacity-90"'
    );

    fs.writeFileSync(file, content, 'utf8');
}

makeFooterThinAndVisible('src/components/TermsOfService.jsx');
makeFooterThinAndVisible('src/components/PrivacyPolicy.jsx');
makeFooterThinAndVisible('src/components/DataDeletion.jsx');

console.log("Footer is now thin and highly visible!");
