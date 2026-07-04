const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

// The bottom links currently look like this:
// <button type="button" onClick={() => setActivePolicyModal('privacy')} className="hover:text-emerald-400 transition-colors">Privacy Policy</button>
// <span className="opacity-20">•</span>
// <button type="button" onClick={() => setActivePolicyModal('terms')} className="hover:text-emerald-400 transition-colors">Terms of Service</button>
// <span className="opacity-20">•</span>
// <button type="button" onClick={() => setActivePolicyModal('deletion')} className="hover:text-emerald-400 transition-colors">Data Deletion</button>

content = content.replace(
    />Privacy Policy<\/button>/g,
    '>سیاسەتا تایبەتمەندیێ</button>'
);
content = content.replace(
    />Terms of Service<\/button>/g,
    '>مەرجێن بکارهینانێ</button>'
);
content = content.replace(
    />Data Deletion<\/button>/g,
    '>ژێبرنا داتایان</button>'
);

// Also fix the spelling in the checkbox from بکارئینانێ to بکارهینانێ so it matches
content = content.replace(
    />مەرجێن بکارئینانێ<\/button>/g,
    '>مەرجێن بکارهینانێ</button>'
);

fs.writeFileSync(file, content, 'utf8');
console.log("AuthView links translated to Bahdini");
