const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

// Find the divider for social
// <div className="mt-4">
//    <div className="flex items-center gap-4 mb-3 text-mono-400 dark:text-white/30">
let dividerStart = content.indexOf('<div className="mt-4">\n                                    <div className="flex items-center gap-4 mb-3 text-mono-400 dark:text-white/30">');

if (dividerStart !== -1) {
    let oldSocialEndStr = '<button type="button" onClick={() => setActivePolicyModal(\'deletion\')} className="hover:text-emerald-400 transition-colors">ژێبرنا داتایان</button>\n                                        </div>\n                                    </div>';
    let oldSocialEnd = content.indexOf(oldSocialEndStr, dividerStart) + oldSocialEndStr.length;
    
    if (oldSocialEnd > dividerStart) {
        let block = content.substring(dividerStart, oldSocialEnd);
        content = content.replace(block, "</div>\n                                )}");
        fs.writeFileSync(file, content, 'utf8');
        console.log("Old block removed successfully!");
    } else {
        console.log("Found start but not end");
        // Let's print the last 200 chars to see how it ends
        let snippet = content.substring(dividerStart, dividerStart + 2000);
        console.log("Snippet length:", snippet.length);
    }
} else {
    console.log("Could not find start");
}
