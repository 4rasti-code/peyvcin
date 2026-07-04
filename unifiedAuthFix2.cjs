const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

// Normalize newlines
content = content.replace(/\r\n/g, '\n');

// 1. FLOATING INPUT UI FIXES
content = content.replace(/<label\s+htmlFor=\{id\}\s+className=\{`block text-\[11px\].*?`\}\s*>\s*\{label\}\s*<\/label>/s, '');
content = content.replace(/<input\s+id=\{id\}\s+type=\{type\}/, '<input\n                    id={id}\n                    type={type}\n                    placeholder={label}');
let inputClassRegex = /className=\{`w-full bg-transparent py-1\.5 sm:py-1 pr-4 \$\{suffix \? 'pl-10' : 'pl-4'\} font-rabar text-mono-900 dark:text-white text-base sm:text-sm font-bold focus:outline-none transition-all duration-200 caret-emerald-400 relative z-10`\}/;
let newClass = "className={`w-full bg-transparent py-2.5 sm:py-2 pr-4 ${suffix ? 'pl-10' : 'pl-4'} font-rabar text-mono-900 dark:text-white text-base sm:text-sm placeholder-mono-400 dark:placeholder-white/40 focus:outline-none transition-all duration-200 caret-emerald-400 relative z-10`}";
content = content.replace(inputClassRegex, newClass);
content = content.replace(/text-white\/30 hover:text-emerald-400 transition-colors z-20/g, 'text-mono-400 dark:text-white/40 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors z-20');
content = content.replace(/p-2 text-slate-900 hover:text-emerald-600/g, 'p-2 text-mono-400 dark:text-white/40 hover:text-emerald-500 dark:hover:text-emerald-400');
let checkboxRegex = /<label className="flex items-start gap-3 mt-4 mb-3 cursor-pointer bg-mono-100 dark:bg-white\/5 p-3 rounded-md border border-mono-200 dark:border-white\/10" dir="rtl">/;
content = content.replace(checkboxRegex, '<label className="flex items-start gap-3 mt-4 mb-3 cursor-pointer p-1" dir="rtl">');

// 2. ADD STATE
if (!content.includes('showEmailForm')) {
    content = content.replace(
        /const \[isUnverifiedLogin, setIsUnverifiedLogin\] = useState\(false\);/,
        "const [isUnverifiedLogin, setIsUnverifiedLogin] = useState(false);\n    const [showEmailForm, setShowEmailForm] = useState(false);"
    );
}

// 3. REFACTOR FLOW
let flowStart = content.indexOf('{/* 1. LOGIN / SIGNUP FLOW */}');
// Use regex to find the end safely
let endMatch = content.match(/ژێبرنا داتایان<\/button>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/>/);
if (flowStart !== -1 && endMatch) {
    let flowEnd = endMatch.index + endMatch[0].length;
    let oldBlock = content.substring(flowStart, flowEnd);

    // Extract form
    let formStart = oldBlock.indexOf('<form');
    let formEndIdx = oldBlock.indexOf('</form>') + 7;
    let formCode = oldBlock.substring(formStart, formEndIdx);

    // Extract tabs
    let tabsStart = oldBlock.indexOf('<div className="flex p-0.5');
    let tabsEndIdx = oldBlock.indexOf('</div>', oldBlock.indexOf('تۆمارکرن')) + 6;
    let tabsCode = oldBlock.substring(tabsStart, tabsEndIdx);
    
    // Extract Success message block just in case it is between tabs and form
    let successMsgStart = oldBlock.indexOf('<AnimatePresence>', tabsEndIdx);
    let successMsgEnd = oldBlock.indexOf('</AnimatePresence>', successMsgStart) + 18;
    let successCode = oldBlock.substring(successMsgStart, successMsgEnd);

    let newFlow = `{/* 1. LOGIN / SIGNUP FLOW */}
                        {!showOtpScreen && recoveryStep === 0 && (
                            <>
                                {!showEmailForm ? (
                                    <div className="w-full flex flex-col mt-2 space-y-3">
                                        <div className="text-center mb-1 px-1 mt-1">
                                            <p className="text-[9px] font-bold font-rabar text-mono-400 dark:text-white/40 leading-tight">
                                                ب بەردەوامبوونێ ب ڕێکا گۆگڵ یان دیسکۆرد، تو یێ ڕازی ب <br/><button type="button" onClick={() => setActivePolicyModal('terms')} className="text-emerald-500 hover:underline">مەرجێن بکارهینانێ</button> و <button type="button" onClick={() => setActivePolicyModal('privacy')} className="text-emerald-500 hover:underline">سیاسەتا تایبەتمەندیێ</button>
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 w-full">
                                            <button
                                                type="button"
                                                onClick={() => handleSocialLogin('google')}
                                                disabled={loading}
                                                className="flex-1 h-10 sm:h-9 rounded-md bg-white text-mono-900 border border-mono-200 flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all shadow-sm font-bold font-rabar text-xs sm:text-[11px]"
                                                title="Google"
                                            >
                                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1c-4.3 0-8.01 2.47-9.82 6.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                                </svg>
                                                <span className="relative z-10 font-bold text-sm">گۆگڵ</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleSocialLogin('discord')}
                                                disabled={loading}
                                                className="flex-1 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-md h-10 sm:h-9 font-bold font-rabar text-xs sm:text-[11px] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                            >
                                                <span className="material-symbols-outlined text-lg">discord</span>
                                                <span className="relative z-10 font-bold text-sm">دیسکۆرد</span>
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setShowEmailForm(true)}
                                            className="w-full h-10 sm:h-9 bg-mono-100 dark:bg-white/10 hover:bg-mono-200 dark:hover:bg-white/20 text-mono-900 dark:text-white border border-mono-200 dark:border-white/10 rounded-md font-bold font-rabar text-sm sm:text-[12px] transition-all flex items-center justify-center gap-2 active:scale-95 mb-3"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">mail</span>
                                            <span>چوونە ژوورێ یان تۆمارکرن ب ئیمەیڵی</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleGuestLogin}
                                            disabled={loading}
                                            className="w-full h-9 sm:h-8 mb-3 bg-transparent border-2 border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-500 rounded-md font-bold font-rabar text-[11px] sm:text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-sm">person</span>
                                            یاریکردن وەکو مێهڤان
                                        </button>

                                        <div className="mt-2 pb-4">
                                            <div className="flex items-center justify-center gap-4 text-[9px] font-black font-rabar text-mono-400 dark:text-white/30 uppercase">
                                                <button type="button" onClick={() => setActivePolicyModal('privacy')} className="hover:text-emerald-400 transition-colors">سیاسەتا تایبەتمەندیێ</button>
                                                <span className="opacity-30">•</span>
                                                <button type="button" onClick={() => setActivePolicyModal('terms')} className="hover:text-emerald-400 transition-colors">مەرجێن بکارهینانێ</button>
                                                <span className="opacity-30">•</span>
                                                <button type="button" onClick={() => setActivePolicyModal('deletion')} className="hover:text-emerald-400 transition-colors">ژێبرنا داتایان</button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full">
                                        <button 
                                            type="button" 
                                            onClick={() => { triggerHaptic(5); setShowEmailForm(false); setError(null); }} 
                                            className="mb-4 flex items-center gap-2 text-mono-400 hover:text-mono-900 dark:hover:text-white transition-colors text-xs font-rabar font-bold w-full justify-start active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-sm">arrow_forward</span> 
                                            پاشڤەزڤرین
                                        </button>
                                        ${tabsCode}
                                        ${successCode}
                                        ${formCode}
                                    </div>
                                )}
                            </>`;
    content = content.replace(oldBlock, newFlow);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Unified script executed successfully!");
} else {
    console.log("Could not find flow boundaries.");
}
