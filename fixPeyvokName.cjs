const fs = require('fs');

function fixPeyvok(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // The structure is generally `en: { ... }, ku: { ... }`
    // We want to replace پەیڤۆک with Peyvok only before the `ku:` key.
    
    let kuIndex = content.indexOf('ku: {');
    if (kuIndex === -1) return;
    
    let englishPart = content.substring(0, kuIndex);
    let kurdishPart = content.substring(kuIndex);
    
    englishPart = englishPart.replace(/پەیڤۆک/g, 'Peyvok');
    
    fs.writeFileSync(file, englishPart + kurdishPart, 'utf8');
}

fixPeyvok('src/components/TermsOfService.jsx');
fixPeyvok('src/components/PrivacyPolicy.jsx');
fixPeyvok('src/components/DataDeletion.jsx');

console.log("Replaced successfully!");
