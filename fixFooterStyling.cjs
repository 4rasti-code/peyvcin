const fs = require('fs');

function fixFooterStyling(file) {
    let content = fs.readFileSync(file, 'utf8');

    // For TermsOfService and PrivacyPolicy
    // className="mt-8 text text-mono-300 dark:text-white/10 uppercase font-bold italic"
    content = content.replace(
        /className="mt-8 text text-mono-300 dark:text-white\/10 uppercase font-bold italic"/g,
        'className="mt-8 text-center text-mono-400 dark:text-white/30 uppercase font-normal tracking-wide text-sm"'
    );
    // Also, the DataDeletion footer
    // className="mt-12 text-center text-mono-400 dark:text-white/20 text font-bold uppercase tracking antialiased"
    content = content.replace(
        /className="mt-12 text-center text-mono-400 dark:text-white\/20 text font-bold uppercase tracking antialiased"/g,
        'className="mt-12 text-center text-mono-400 dark:text-white/30 uppercase font-normal tracking-wide text-sm"'
    );

    fs.writeFileSync(file, content, 'utf8');
}

fixFooterStyling('src/components/TermsOfService.jsx');
fixFooterStyling('src/components/PrivacyPolicy.jsx');
fixFooterStyling('src/components/DataDeletion.jsx');

console.log("Footer styling fixed!");
