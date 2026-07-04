const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let searchBlock = `<Motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm bg-white dark:bg-black/80 backdrop-blur-xl border border-mono-200 dark:border-white/10 rounded-lg shadow-2xl overflow-hidden"
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
                        </Motion.div>`;

let replaceBlock = `<Motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm bg-mono-100 dark:bg-black/95 backdrop-blur-md border border-mono-200 dark:border-white/10 rounded-md shadow-2xl p-6 sm:p-8"
                            dir="rtl"
                        >
                            <div className="w-14 h-14 rounded-md bg-orange-500/10 flex items-center justify-center mb-5 mx-auto border border-orange-500/20">
                                <span className="material-symbols-outlined text-orange-500 text-3xl">warning</span>
                            </div>
                            
                            <h3 className="text-lg font-black font-rabar text-mono-900 dark:text-white text-center mb-3">
                                تێبینی بۆ مێهڤانان
                            </h3>
                            
                            <p className="text-[13px] font-bold font-rabar text-mono-500 dark:text-white/60 text-center leading-relaxed">
                                ئەگەر خوە تۆمار نەکەی، د ماوەیێ <span className="text-orange-500 font-black">حەفتییەکێ</span> دا دێ هەمی پێشکەفتن و داتایێن تە ژێ چن. ئەرێ تو یێ ڕازی یی بەردەوام بی؟
                            </p>
                            
                            <div className="flex items-center gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => {
                                        playBackSfx();
                                        setShowGuestWarning(false);
                                    }}
                                    className="flex-1 h-11 bg-mono-200 dark:bg-white/5 hover:bg-mono-300 dark:hover:bg-white/10 text-mono-700 dark:text-white/70 rounded-md font-bold font-rabar text-xs transition-colors"
                                >
                                    نەخێر، ڤەگەڕە
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowGuestWarning(false);
                                        handleGuestLogin();
                                    }}
                                    className="flex-1 h-11 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-500 rounded-md font-black font-rabar text-xs transition-colors"
                                >
                                    بەڵێ، ڕازیمە
                                </button>
                            </div>
                        </Motion.div>`;

if (content.includes('تێبینی بۆ مێهڤانان')) {
    content = content.replace(searchBlock, replaceBlock);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Modal design matched to the game's native style successfully!");
} else {
    console.log("Could not find the modal block.");
}
