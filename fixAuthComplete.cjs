const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add state for agreedToTerms if it's missing
if (!content.includes('agreedToTerms')) {
    content = content.replace(
        /const \[isUnverifiedLogin, setIsUnverifiedLogin\] = useState\(false\);/,
        "const [isUnverifiedLogin, setIsUnverifiedLogin] = useState(false);\n    const [agreedToTerms, setAgreedToTerms] = useState(false);"
    );
}

// 2. Add validation in handleAuth
if (!content.includes('پێدڤییە تو ب مەرجێن بکارئینانێ ڕازی بی') && !content.includes('پێدڤییە تو ب مەرجێن بکارهینانێ ڕازی بی')) {
    content = content.replace(
        /const handleAuth = async \(e\) => \{\n\s+e\.preventDefault\(\);\n\s+setError\(null\);/g,
        `const handleAuth = async (e) => {\n        e.preventDefault();\n        setError(null);\n\n        if (!isLogin && !agreedToTerms) {\n            setError('پێدڤییە تو ب مەرجێن بکارهینانێ ڕازی بی');\n            triggerHaptic(2);\n            return;\n        }`
    );
}

// 3. Add the checkbox UI before the submit button
if (!content.includes('checked={agreedToTerms}')) {
    let checkboxCode = `
                                    {!isLogin && (recoveryStep === 0) && (
                                        <label className="flex items-start gap-3 mt-4 mb-3 cursor-pointer bg-mono-100 dark:bg-white/5 p-3 rounded-md border border-mono-200 dark:border-white/10" dir="rtl">
                                          <div className="relative flex items-center justify-center mt-0.5">
                                              <input 
                                                type="checkbox" 
                                                checked={agreedToTerms} 
                                                onChange={(e) => { triggerHaptic(5); setAgreedToTerms(e.target.checked); }} 
                                                className="w-4 h-4 rounded-sm accent-primary cursor-pointer shrink-0"
                                              />
                                          </div>
                                          <span className="text-mono-600 dark:text-mono-300 text-[11px] font-bold font-rabar leading-relaxed text-right flex-1">
                                            ب دروستکرنا هەژمارێ، تو یێ ڕازی ب <button type="button" onClick={(e) => { e.preventDefault(); setActivePolicyModal('terms'); }} className="text-primary hover:underline">مەرجێن بکارهینانێ</button> و <button type="button" onClick={(e) => { e.preventDefault(); setActivePolicyModal('privacy'); }} className="text-primary hover:underline">سیاسەتا تایبەتمەندیێ</button>
                                          </span>
                                        </label>
                                    )}
`;
    content = content.replace(
        /<button\s+type="submit"\s+disabled=\{loading\}/,
        checkboxCode + '\n                                    <button\n                                        type="submit"\n                                        disabled={loading}'
    );
}

// 4. Add the warning text for Google and Discord
if (!content.includes('ب بەردەوامبوونێ ب ڕێکا گۆگڵ یان دیسکۆرد')) {
    let warningText = `
                                    <div className="text-center mb-3 px-2">
                                        <p className="text-[10px] font-bold font-rabar text-mono-400 dark:text-white/40 leading-relaxed">
                                            ب بەردەوامبوونێ ب ڕێکا گۆگڵ یان دیسکۆرد، تو یێ ڕازی ب <br/><button type="button" onClick={() => setActivePolicyModal('terms')} className="text-emerald-500 hover:underline">مەرجێن بکارهینانێ</button> و <button type="button" onClick={() => setActivePolicyModal('privacy')} className="text-emerald-500 hover:underline">سیاسەتا تایبەتمەندیێ</button>
                                        </p>
                                    </div>
`;
    content = content.replace(
        /<!-- GOOGLE BUTTON -->/i,
        warningText + '                                    {/* GOOGLE BUTTON */}'
    );
    // Wait, the comment is usually {/* GOOGLE BUTTON */}
    content = content.replace(
        /\{\/\*\s*GOOGLE BUTTON\s*\*\/\}/i,
        warningText + '                                    {/* GOOGLE BUTTON */}'
    );
}

fs.writeFileSync(file, content, 'utf8');
console.log("AuthView completely repaired and updated with Social Login warning");
