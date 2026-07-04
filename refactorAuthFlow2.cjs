const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('showEmailForm')) {
    content = content.replace(
        /const \[isUnverifiedLogin, setIsUnverifiedLogin\] = useState\(false\);/,
        "const [isUnverifiedLogin, setIsUnverifiedLogin] = useState(false);\n    const [showEmailForm, setShowEmailForm] = useState(false);"
    );
}

// Find tabs start (it's the first div inside the container that has bg-mono-100)
// The container is: <div className="w-full max-w-sm px-6">
let containerStart = content.indexOf('<div className="w-full max-w-sm px-6">');
let tabsStart = content.indexOf('<div className="flex bg-', containerStart);
let formStart = content.indexOf('<form onSubmit={handleAuth}');
let dividerStart = content.indexOf('<div className="mt-4">', formStart);

let warningStart = content.indexOf('<div className="text-center mb-2 px-1 mt-3">', dividerStart);
let googleStart = content.indexOf('<div className="flex items-center gap-3 w-full">', warningStart);
let guestBtnStart = content.substring(0, content.indexOf('onClick={handleGuestLogin}')).lastIndexOf('<button');
let guestBtnEnd = content.indexOf('</button>', guestBtnStart) + 9;
let policyStart = content.indexOf('<div className="flex items-center justify-center gap-4 text-[9px]', guestBtnEnd);
let policyEnd = content.indexOf('</div>', policyStart) + 6;

if (tabsStart > 0 && formStart > 0 && dividerStart > 0) {
    let tabsBlock = content.substring(tabsStart, formStart);
    let formBlock = content.substring(formStart, dividerStart);
    let warningBlock = content.substring(warningStart, googleStart);
    let socialBlock = content.substring(googleStart, guestBtnStart);
    let guestBlock = content.substring(guestBtnStart, guestBtnEnd);
    let policyBlock = content.substring(policyStart, policyEnd);
    
    let emailBtn = `
                                    <button
                                        type="button"
                                        onClick={() => setShowEmailForm(true)}
                                        className="w-full h-10 sm:h-9 bg-mono-100 dark:bg-white/10 hover:bg-mono-200 dark:hover:bg-white/20 text-mono-900 dark:text-white border border-mono-200 dark:border-white/10 rounded-md font-bold font-rabar text-sm sm:text-xs transition-all flex items-center justify-center gap-2 active:scale-95 mb-3"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">mail</span>
                                        <span>ئیمەیڵ و وشەی نهێنی</span>
                                    </button>
`;

    let backBtn = `
                                    <button 
                                        type="button" 
                                        onClick={() => { triggerHaptic(5); setShowEmailForm(false); setError(null); }} 
                                        className="mb-4 flex items-center gap-2 text-mono-400 hover:text-mono-900 dark:hover:text-white transition-colors text-xs font-rabar font-bold w-full justify-start active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span> 
                                        پاشڤەزڤرین
                                    </button>
`;

    let newContainer = `
                                {!showEmailForm ? (
                                    <div className="w-full flex flex-col mt-2">
${warningBlock}
${socialBlock}
${emailBtn}
${guestBlock}
                                        <div className="mt-4">
${policyBlock}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full">
${backBtn}
${tabsBlock}
${formBlock}
                                    </div>
                                )}
`;

    // Replace everything from tabsStart to the end of policyBlock with newContainer
    content = content.substring(0, tabsStart) + newContainer + content.substring(policyEnd);
    
    // Clean up the leftover divider </div> tags if any
    content = content.replace(/<div className="mt-4">\s*<\/div>/g, '');
    content = content.replace(/<div className="mt-4">\s*<\/div>\s*<\/div>/g, '</div>');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log("Refactor to button-first flow completed successfully");
} else {
    console.log("Could not find required blocks");
}
