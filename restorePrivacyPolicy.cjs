const fs = require('fs');

let file = 'src/components/PrivacyPolicy.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Logical Properties
content = content.replace(/border-r-4/g, 'border-s-4');
content = content.replace(/pr-6/g, 'ps-6');
content = content.replace(/pr-12/g, 'ps-12');
content = content.replace(/className="text-xl/g, 'className="text-start text-xl');
content = content.replace(/className="text-mono-600 dark:text-white\/60/g, 'className="text-start text-mono-600 dark:text-white/60');
content = content.replace(/text-center sm:text-start/g, 'text-start');

// 2. Peyvok Name
let kuIndex = content.indexOf('ku: {');
if (kuIndex !== -1) {
    let englishPart = content.substring(0, kuIndex);
    let kurdishPart = content.substring(kuIndex);
    englishPart = englishPart.replace(/پەیڤۆک/g, 'Peyvok');
    content = englishPart + kurdishPart;
}

// 3. dir="ltr" on buttons container
content = content.replace(
    /className="flex bg-mono-50 dark:bg-mono-900\/80 backdrop-blur-xl border border-mono-200 dark:border-white\/5 rounded-md p-1\.5\s*"/g,
    'className="flex bg-mono-50 dark:bg-mono-900/80 backdrop-blur-xl border border-mono-200 dark:border-white/5 rounded-md p-1.5" dir="ltr"'
);

// 4. Translate Headers
let isKurdishVar = "lang === 'ku'";
content = content.replace(/>Privacy Policy<\/p>/g, `>{${isKurdishVar} ? 'سیاسەتا تایبەتمەندیێ' : 'Privacy Policy'}</p>`);
content = content.replace(/>Terms of Service<\/button>/g, `>{${isKurdishVar} ? 'مەرجێن بکارهینانێ' : 'Terms of Service'}</button>`);
content = content.replace(/>Privacy Policy<\/button>/g, `>{${isKurdishVar} ? 'سیاسەتا تایبەتمەندیێ' : 'Privacy Policy'}</button>`);
content = content.replace(/>Data Deletion<\/button>/g, `>{${isKurdishVar} ? 'ژێبرنا داتایان' : 'Data Deletion'}</button>`);
content = content.replace(/>&copy; 2026 (پەیڤۆک|Peyvok) App\. All Rights Reserved\.<\/p>/g, `>{${isKurdishVar} ? '© ٢٠٢٦ ئەپێ پەیڤۆک. هەمی ماف پاراستینە.' : '© 2026 Peyvok App. All Rights Reserved.'}</p>`);

// 5. SWAP THE BUTTONS (Ensure English is first, Bahdini is second)
let btnMatchKu = content.match(/<button\s+onClick=\{\(\) => setLang\('ku'\)\}([\s\S]*?)<\/button>/);
let btnMatchEn = content.match(/<button\s+onClick=\{\(\) => setLang\('en'\)\}([\s\S]*?)<\/button>/);

if (btnMatchKu && btnMatchEn) {
    let matchKuStr = btnMatchKu[0];
    let matchEnStr = btnMatchEn[0];
    
    // We only swap if ku is currently before en in the file
    let indexKu = content.indexOf(matchKuStr);
    let indexEn = content.indexOf(matchEnStr);
    
    if (indexKu < indexEn) {
        content = content.replace(matchKuStr, "###KU_BTN###");
        content = content.replace(matchEnStr, matchKuStr);
        content = content.replace("###KU_BTN###", matchEnStr);
    }
}

fs.writeFileSync(file, content, 'utf8');
console.log("PrivacyPolicy restored and fixed!");
