const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let searchBlock = `<button
                                            type="button"
                                            onClick={() => {
                                                setIsLogin(true);
                                                setShowEmailForm(true);
                                            }}
                                            className="relative w-full h-11 sm:h-10 bg-mono-100 dark:bg-white/10 hover:bg-mono-200 dark:hover:bg-white/20 text-mono-900 dark:text-white border border-mono-200 dark:border-white/10 rounded-md flex items-center justify-center active:scale-95 transition-all"
                                        >
                                            <span className="font-bold font-rabar text-[12px] sm:text-xs">چوونا ژوورێ ب ئیمەیڵی</span>
                                            <div className="absolute right-4 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[18px]">mail</span>
                                            </div>
                                        </button>`;

let replacementBlock = ``; // Remove it from the main stack

let footerSearch = `<div className="mt-6 mb-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[9.5px] font-black font-rabar text-mono-400 dark:text-white/30 uppercase">`;

let footerReplace = `<div className="flex items-center justify-center mt-6 mb-2">
                                            <p className="text-[11px] font-bold font-rabar text-mono-400 dark:text-white/50">
                                                پێشتر هەژمارت هەیە؟{' '}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsLogin(true);
                                                        setShowEmailForm(true);
                                                    }}
                                                    className="text-[#0095f6] hover:text-[#1877f2] transition-colors"
                                                >
                                                    چوونا ژوورێ
                                                </button>
                                            </p>
                                        </div>

                                        <div className="mt-4 mb-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[9.5px] font-black font-rabar text-mono-400 dark:text-white/30 uppercase">`;

if (content.includes('چوونا ژوورێ ب ئیمەیڵی')) {
    content = content.replace(searchBlock, replacementBlock);
    content = content.replace(footerSearch, footerReplace);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Login button converted to text link successfully!");
} else {
    console.log("Could not find the login button.");
}
