const fs = require('fs');

function fixAlignmentAndText(file, isDataDeletion = false) {
    let content = fs.readFileSync(file, 'utf8');

    // Add text-center to the div wrapping the logo and subtitle
    // The structure is:
    // <div className="flex items-center gap-6 group cursor-pointer" onClick={handleClose}>
    //     <div>
    //         <h1 ...
    
    // We will replace `<div>\n                            <h1 className="text-4xl`
    // with `<div className="text-center">\n                            <h1 className="text-4xl`
    
    content = content.replace(/<div>\s*<h1 className="text-4xl/g, '<div className="text-center">\n                            <h1 className="text-4xl');

    if (isDataDeletion) {
        // Change "ئازادیا داتایان" to "ژێبرنا داتایان"
        content = content.replace(/ئازادیا داتایان/g, 'ژێبرنا داتایان');
        // And if they want the English to be Data Deletion, it already is 'Data Freedom'.
        // Let's check if we should change it to 'Data Deletion' as well, wait, in DataDeletion.jsx:
        // isKurdish ? 'ئازادیا داتایان' : 'Data Freedom'
        // If they want 'ژێبرنا داتایان' in Kurdish, in English it should probably be 'Data Deletion'
        content = content.replace(/Data Freedom/g, 'Data Deletion');
    }

    fs.writeFileSync(file, content, 'utf8');
}

fixAlignmentAndText('src/components/TermsOfService.jsx');
fixAlignmentAndText('src/components/PrivacyPolicy.jsx');
fixAlignmentAndText('src/components/DataDeletion.jsx', true);

console.log("Alignment and text fixed!");
