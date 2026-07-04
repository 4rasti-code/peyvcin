const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add state variable
let stateSearch = `const [showEmailForm, setShowEmailForm] = useState(false);`;
let stateReplace = `const [showEmailForm, setShowEmailForm] = useState(false);
    const [showGuestWarning, setShowGuestWarning] = useState(false);`;

if (!content.includes('showGuestWarning')) {
    content = content.replace(stateSearch, stateReplace);
}

// 2. Modify Guest button onClick
let guestButtonSearch = `<button
                                            type="button"
                                            onClick={handleGuestLogin}
                                            disabled={loading}`;
let guestButtonReplace = `<button
                                            type="button"
                                            onClick={() => {
                                                playAlertSfx();
                                                setShowGuestWarning(true);
                                            }}
                                            disabled={loading}`;
if (content.includes('onClick={handleGuestLogin}')) {
    content = content.replace(guestButtonSearch, guestButtonReplace);
}

// 3. Add Modal
let modalSearch = `<PolicyModal
                isOpen={!!activePolicyModal}`;
let modalReplace = `<AnimatePresence>
                {showGuestWarning && (
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6"
                    >
                        {/* Backdrop */}
                        <div 
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => {
                                playBackSfx();
                                setShowGuestWarning(false);
                            }}
                        />
                        
                        {/* Modal */}
                        <Motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm bg-mono-100 dark:bg-mono-900 border border-mono-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                            dir="rtl"
                        >
                            <div className="p-6 pt-8">
                                <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center mb-5 mx-auto border border-orange-500/20">
                                    <span className="material-symbols-outlined text-orange-500 text-3xl">warning</span>
                                </div>
                                
                                <h3 className="text-lg font-black font-rabar text-mono-900 dark:text-white text-center mb-3">
                                    تێبینی بۆ مێهڤانان
                                </h3>
                                
                                <p className="text-[13px] font-bold font-rabar text-mono-500 dark:text-white/60 text-center leading-relaxed">
                                    ئەگەر خوە تۆمار نەکەی، د ماوەیێ <span className="text-orange-500">حەفتییەکێ</span> دا دێ هەمی پێشکەفتن و داتایێن تە ژێ چن. ئەرێ تو یێ ڕازی یی بەردەوام بی؟
                                </p>
                            </div>
                            
                            <div className="flex border-t border-mono-200 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => {
                                        playBackSfx();
                                        setShowGuestWarning(false);
                                    }}
                                    className="flex-1 p-4 text-xs font-bold font-rabar text-mono-500 dark:text-white/50 hover:bg-mono-200 dark:hover:bg-white/5 transition-colors"
                                >
                                    نەخێر، ڤەگەڕە
                                </button>
                                <div className="w-px bg-mono-200 dark:bg-white/10" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowGuestWarning(false);
                                        handleGuestLogin();
                                    }}
                                    className="flex-1 p-4 text-xs font-black font-rabar text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                                >
                                    بەڵێ، ڕازیمە
                                </button>
                            </div>
                        </Motion.div>
                    </Motion.div>
                )}
            </AnimatePresence>

            <PolicyModal
                isOpen={!!activePolicyModal}`;

if (!content.includes('showGuestWarning &&')) {
    content = content.replace(modalSearch, modalReplace);
}

fs.writeFileSync(file, content, 'utf8');
console.log("Guest warning modal added successfully!");
