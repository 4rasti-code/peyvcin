const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let startIndex = content.indexOf('<div className="w-full flex flex-col mt-2 space-y-3">');
let endIndex = content.indexOf(') : (', startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    let oldBlock = content.substring(startIndex, endIndex);
    
    let newBlock = `<div className="w-full flex flex-col mt-2 space-y-3">
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
                                                <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                                                </svg>
                                                <span className="relative z-10 font-bold text-sm">دیسکۆرد</span>
                                            </button>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 my-2 text-mono-400 dark:text-white/20">
                                            <div className="flex-1 h-px bg-current"></div>
                                            <span className="text-[10px] font-black font-rabar opacity-60">یان ب ڕێکا</span>
                                            <div className="flex-1 h-px bg-current"></div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setShowEmailForm(true)}
                                            className="w-full h-10 sm:h-9 bg-mono-100 dark:bg-white/10 hover:bg-mono-200 dark:hover:bg-white/20 text-mono-900 dark:text-white border border-mono-200 dark:border-white/10 rounded-md font-bold font-rabar text-sm sm:text-[12px] transition-all flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">mail</span>
                                            <span>ئیمەیڵ</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleGuestLogin}
                                            disabled={loading}
                                            className="w-full h-10 sm:h-9 bg-transparent border-2 border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-500 rounded-md font-bold font-rabar text-sm sm:text-[12px] transition-all flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-sm">person</span>
                                            یاریکردن وەکو مێهڤان
                                        </button>

                                        <div className="mt-6 mb-2 text-center space-y-4">
                                            <p className="text-[10px] font-bold font-rabar text-mono-400 dark:text-white/40 leading-relaxed px-4">
                                                ب بەردەوامبوونێ، تو یێ ڕازی ب <button type="button" onClick={() => setActivePolicyModal('terms')} className="text-emerald-500 hover:underline">مەرجێن بکارهینانێ</button> و <button type="button" onClick={() => setActivePolicyModal('privacy')} className="text-emerald-500 hover:underline">سیاسەتا تایبەتمەندیێ</button>
                                            </p>
                                            <div className="flex items-center justify-center">
                                                <button type="button" onClick={() => setActivePolicyModal('deletion')} className="text-[9px] font-black font-rabar text-mono-400 dark:text-white/30 hover:text-red-400 transition-colors uppercase">
                                                    ژێبرنا داتایان
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `;
    content = content.replace(oldBlock, newBlock);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Menu cleaned up!");
}
