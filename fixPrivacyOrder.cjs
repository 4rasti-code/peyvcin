const fs = require('fs');

function fixPrivacyPolicyOrder(file) {
    let content = fs.readFileSync(file, 'utf8');

    // Regex to match the entire button container contents in PrivacyPolicy
    let btnContainerRegex = /(<div className="flex bg-mono-50 dark:bg-mono-900\/80 backdrop-blur-xl border border-mono-200 dark:border-white\/5 rounded-md p-1\.5" dir="ltr">)([\s\S]*?)(<\/div>)/;

    // We know PrivacyPolicy has setLang('ku') first and setLang('en') second.
    // Let's replace the whole inner content with the correct order.
    
    let replacement = `$1
                        <button
                            onClick={() => setLang('en')}
                            className={\`flex items-center gap-2.5 px-6 py-2.5 rounded-md transition-all duration-300 font-bold text-sm \${lang === 'en' ? 'bg-mono-900 text-mono-50 dark:bg-mono-50 dark:text-mono-900 ' : 'text-mono-500 dark:text-mono-400 hover:text-mono-900 dark:hover:text-mono-50'}\`}
                        >
                            <div className="w-5 h-3.5 rounded overflow-hidden ">
                                <USFlag />
                            </div>
                            <span>English</span>
                        </button>
                        <button
                            onClick={() => setLang('ku')}
                            className={\`flex items-center gap-2.5 px-6 py-2.5 rounded-md transition-all duration-300 font-bold text-sm \${lang === 'ku' ? 'bg-mono-900 text-mono-50 dark:bg-mono-50 dark:text-mono-900 ' : 'text-mono-500 dark:text-mono-400 hover:text-mono-900 dark:hover:text-mono-50'}\`}
                        >
                            <div className="w-5 h-3.5 rounded overflow-hidden ">
                                <KurdistanFlag />
                            </div>
                            <span>بەهدینی</span>
                        </button>
                    $3`;

    content = content.replace(btnContainerRegex, replacement);

    fs.writeFileSync(file, content, 'utf8');
}

fixPrivacyPolicyOrder('src/components/PrivacyPolicy.jsx');

console.log("PrivacyPolicy fixed!");
