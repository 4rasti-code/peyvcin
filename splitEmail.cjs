const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let searchStr = `<button
                                            type="button"
                                            onClick={() => setShowEmailForm(true)}
                                            className="relative w-full h-11 sm:h-10 bg-mono-100 dark:bg-white/10 hover:bg-mono-200 dark:hover:bg-white/20 text-mono-900 dark:text-white border border-mono-200 dark:border-white/10 rounded-md flex items-center justify-center active:scale-95 transition-all"
                                        >
                                            <span className="font-bold font-rabar text-[12px] sm:text-xs">بەردەوامبوون ب ڕێکا ئیمەیڵی</span>
                                            <div className="absolute right-4 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[18px]">mail</span>
                                            </div>
                                        </button>`;

let replaceStr = `<button
                                            type="button"
                                            onClick={() => {
                                                setIsLogin(true);
                                                setShowEmailForm(true);
                                            }}
                                            className="relative w-full h-11 sm:h-10 bg-mono-100 dark:bg-white/10 hover:bg-mono-200 dark:hover:bg-white/20 text-mono-900 dark:text-white border border-mono-200 dark:border-white/10 rounded-md flex items-center justify-center active:scale-95 transition-all"
                                        >
                                            <span className="font-bold font-rabar text-[12px] sm:text-xs">چوونا ژوورێ ب ئیمەیڵی</span>
                                            <div className="absolute right-4 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[18px]">login</span>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsLogin(false);
                                                setShowEmailForm(true);
                                            }}
                                            className="relative w-full h-11 sm:h-10 bg-transparent hover:bg-mono-100 dark:hover:bg-white/5 text-mono-900 dark:text-white border border-mono-200 dark:border-white/10 rounded-md flex items-center justify-center active:scale-95 transition-all"
                                        >
                                            <span className="font-bold font-rabar text-[12px] sm:text-xs">تۆمارکرن ب ئیمەیڵی</span>
                                            <div className="absolute right-4 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[18px]">person_add</span>
                                            </div>
                                        </button>`;

if (content.includes('بەردەوامبوون ب ڕێکا ئیمەیڵی')) {
    content = content.replace(searchStr, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Email button split successfully!");
} else {
    console.log("Could not find the email button to split.");
}
