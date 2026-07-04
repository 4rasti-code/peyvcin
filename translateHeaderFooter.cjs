const fs = require('fs');

function translateFile(file, isKurdishVar) {
    let content = fs.readFileSync(file, 'utf8');

    // Logo Subtitle
    content = content.replace(/>Heritage Reborn<\/p>/g, `>{${isKurdishVar} ? 'مەرجێن بکارهینانێ' : 'Terms of Service'}</p>`);
    content = content.replace(/>Privacy Policy<\/p>/g, `>{${isKurdishVar} ? 'سیاسەتا تایبەتمەندیێ' : 'Privacy Policy'}</p>`);
    content = content.replace(/>Data Freedom<\/p>/g, `>{${isKurdishVar} ? 'ئازادیا داتایان' : 'Data Freedom'}</p>`);

    // Footer Links (they are inside <button ...>Text</button>)
    // Terms of Service
    content = content.replace(/>Terms of Service<\/button>/g, `>{${isKurdishVar} ? 'مەرجێن بکارهینانێ' : 'Terms of Service'}</button>`);
    // Privacy Policy
    content = content.replace(/>Privacy Policy<\/button>/g, `>{${isKurdishVar} ? 'سیاسەتا تایبەتمەندیێ' : 'Privacy Policy'}</button>`);
    // Data Deletion
    content = content.replace(/>Data Deletion<\/button>/g, `>{${isKurdishVar} ? 'ژێبرنا داتایان' : 'Data Deletion'}</button>`);

    // Footer Copyright
    content = content.replace(/>&copy; 2026 (پەیڤۆک|Peyvok) App\. All Rights Reserved\.<\/p>/g, `>{${isKurdishVar} ? '© ٢٠٢٦ ئەپێ پەیڤۆک. هەمی ماف پاراستینە.' : '© 2026 Peyvok App. All Rights Reserved.'}</p>`);

    fs.writeFileSync(file, content, 'utf8');
}

translateFile('src/components/TermsOfService.jsx', "lang === 'ku'");
translateFile('src/components/PrivacyPolicy.jsx', "lang === 'ku'");
translateFile('src/components/DataDeletion.jsx', "isKurdish");

console.log("Translation applied!");
