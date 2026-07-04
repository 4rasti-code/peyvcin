const fs = require('fs');

function fixTabSounds(file, stateSetter) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Update the import to include playTabSfx
    // Currently: import { playBackSfx } from '../utils/audio';
    // We want: import { playBackSfx, playTabSfx } from '../utils/audio';
    if (!content.includes('playTabSfx')) {
        content = content.replace(
            /import \{ playBackSfx \} from '\.\.\/utils\/audio';/g,
            "import { playBackSfx, playTabSfx } from '../utils/audio';"
        );
    }

    // 2. Change playBackSfx to playTabSfx ONLY in the language buttons
    // The language buttons look like:
    // onClick={() => setLang('en')} ... wait, in PrivacyPolicy I just wrote:
    // onClick={() => setLang('en')} ... oh wait! In PrivacyPolicy I didn't add playBackSfx() back when I restored it!
    // Ah! When I wrote fixPrivacyOrder.cjs, I did: onClick={() => setLang('en')} without playBackSfx!
    // Let me check what I actually did.
    
    // In DataDeletion: onClick={() => { playBackSfx(); setIsKurdish(false); }}
    // Let's just use regex to find the button container and replace inside it.
    
    let btnContainerRegex = /(<div className="flex bg-mono-50 dark:bg-mono-900\/80 backdrop-blur-xl border border-mono-200 dark:border-white\/5 rounded-md p-1\.5" dir="ltr">)([\s\S]*?)(<\/div>)/;
    
    if (content.match(btnContainerRegex)) {
        let container = content.match(btnContainerRegex)[0];
        // Now replace playBackSfx() with playTabSfx() inside this container
        let newContainer = container.replace(/playBackSfx\(\)/g, "playTabSfx()");
        
        // If they were missing playBackSfx() entirely (like in my PrivacyPolicy fix), add playTabSfx()
        newContainer = newContainer.replace(/onClick=\{\(\) => setLang\('en'\)\}/g, "onClick={() => { playTabSfx(); setLang('en'); }}");
        newContainer = newContainer.replace(/onClick=\{\(\) => setLang\('ku'\)\}/g, "onClick={() => { playTabSfx(); setLang('ku'); }}");
        
        content = content.replace(container, newContainer);
    }

    fs.writeFileSync(file, content, 'utf8');
}

fixTabSounds('src/components/TermsOfService.jsx');
fixTabSounds('src/components/PrivacyPolicy.jsx');
fixTabSounds('src/components/DataDeletion.jsx');

console.log("Tab sounds fixed!");
