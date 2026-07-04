const fs = require('fs');

function fixJumpingButtons(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add dir="ltr" to the language toggle button container
    // We match the class name that is unique to this container
    content = content.replace(
        /className="flex bg-mono-50 dark:bg-mono-900\/80 backdrop-blur-xl border border-mono-200 dark:border-white\/5 rounded-md p-1\.5\s*"/g,
        'className="flex bg-mono-50 dark:bg-mono-900/80 backdrop-blur-xl border border-mono-200 dark:border-white/5 rounded-md p-1.5" dir="ltr"'
    );

    fs.writeFileSync(file, content, 'utf8');
}

fixJumpingButtons('src/components/TermsOfService.jsx');
fixJumpingButtons('src/components/PrivacyPolicy.jsx');
fixJumpingButtons('src/components/DataDeletion.jsx');

console.log("Fixed jumping buttons!");
