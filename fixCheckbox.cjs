const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\r\n/g, '\n');

// 1. Add State
if (!content.includes('agreedToTerms')) {
    content = content.replace(
        /const \[isUnverifiedLogin, setIsUnverifiedLogin\] = useState\(false\);/,
        "const [isUnverifiedLogin, setIsUnverifiedLogin] = useState(false);\n    const [agreedToTerms, setAgreedToTerms] = useState(false);"
    );
}

// 2. Add validation in handleAuth
let authTarget = "if (nameAvailability !== 'available' || passwordError || confirmError || !password || !confirmPassword) {";
let authReplacement = `if (nameAvailability !== 'available' || passwordError || confirmError || !password || !confirmPassword) {
                    playAlertSfx();
                    setError(nameError || passwordError || confirmError || 'ھیڤییە هەمی زانیاریان ب درستی پڕ بکەو');
                    setLoading(false);
                    return;
                }
                
                if (!agreedToTerms) {
                    playAlertSfx();
                    setError('پێویستە ڕازی بیت ل سەر مەرج و سیاسەتا تایبەتمەندیێ');
                    setLoading(false);
                    return;
                }`;
if (!content.includes('پێویستە ڕازی بیت')) {
    content = content.replace(
        /if \(nameAvailability !== 'available' \|\| passwordError \|\| confirmError \|\| !password \|\| !confirmPassword\) \{[\s\S]*?return;\s*\}/,
        authReplacement
    );
}

// 3. Add Checkbox UI
let checkboxTarget = `                                                    </Motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}`;

let checkboxReplacement = `                                                    </Motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}

                                    {!isLogin && (
                                        <label className="flex items-start gap-3 mt-4 mb-3 cursor-pointer p-1" dir="rtl">
                                            <div className="relative flex items-center justify-center mt-0.5">
                                                <input 
                                                    type="checkbox" 
                                                    checked={agreedToTerms}
                                                    onChange={(e) => {
                                                        setAgreedToTerms(e.target.checked);
                                                        if (e.target.checked) setError(null);
                                                    }}
                                                    className="peer sr-only" 
                                                />
                                                <div className="w-5 h-5 rounded border-2 border-mono-300 dark:border-white/20 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all flex items-center justify-center group-hover:border-emerald-400">
                                                    <span className="material-symbols-outlined text-white text-[14px] opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all duration-200 font-bold">check</span>
                                                </div>
                                            </div>
                                            <div className="text-[10px] sm:text-[9px] font-bold font-rabar text-mono-500 dark:text-white/50 leading-relaxed text-right pt-0.5">
                                                ئەز یێ ڕازیمە ب <button type="button" onClick={(e) => { e.preventDefault(); setActivePolicyModal('terms'); }} className="text-emerald-500 hover:text-emerald-400 hover:underline transition-colors">مەرجێن بکارهینانێ</button> و <button type="button" onClick={(e) => { e.preventDefault(); setActivePolicyModal('privacy'); }} className="text-emerald-500 hover:text-emerald-400 hover:underline transition-colors">سیاسەتا تایبەتمەندیێ</button>
                                            </div>
                                        </label>
                                    )}`;
                                    
if (!content.includes('ئەز یێ ڕازیمە ب')) {
    content = content.replace(checkboxTarget, checkboxReplacement);
}

fs.writeFileSync(file, content, 'utf8');
console.log("Checkbox added successfully!");
