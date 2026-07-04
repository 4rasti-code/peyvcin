const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update Signup button styling
let signupSearch = `className="relative w-full h-11 sm:h-10 bg-mono-100 dark:bg-white/10 hover:bg-mono-200 dark:hover:bg-white/20 text-mono-900 dark:text-white border border-mono-200 dark:border-white/10 rounded-md flex items-center justify-center active:scale-95 transition-all"
                                        >
                                            <span className="font-bold font-rabar text-[12px] sm:text-xs">تۆمارکرن ب ئیمەیڵی</span>`;

let signupReplace = `className="relative w-full h-11 sm:h-10 bg-[#0095f6] hover:bg-[#1877f2] text-white rounded-md flex items-center justify-center active:scale-95 transition-all shadow-sm"
                                        >
                                            <span className="font-bold font-rabar text-[12px] sm:text-xs">تۆمارکرن ب ئیمەیڵی</span>`;

// 2. Update Login button styling
let loginSearch = `className="relative w-full h-11 sm:h-10 bg-transparent hover:bg-mono-100 dark:hover:bg-white/5 text-mono-900 dark:text-white border border-mono-200 dark:border-white/10 rounded-md flex items-center justify-center active:scale-95 transition-all"
                                        >
                                            <span className="font-bold font-rabar text-[12px] sm:text-xs">چوونا ژوورێ ب ئیمەیڵی</span>`;

let loginReplace = `className="relative w-full h-11 sm:h-10 bg-mono-100 dark:bg-white/10 hover:bg-mono-200 dark:hover:bg-white/20 text-mono-900 dark:text-white border border-mono-200 dark:border-white/10 rounded-md flex items-center justify-center active:scale-95 transition-all"
                                        >
                                            <span className="font-bold font-rabar text-[12px] sm:text-xs">چوونا ژوورێ ب ئیمەیڵی</span>`;

if (content.includes('تۆمارکرن ب ئیمەیڵی') && content.includes('چوونا ژوورێ ب ئیمەیڵی')) {
    content = content.replace(signupSearch, signupReplace);
    content = content.replace(loginSearch, loginReplace);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Colors updated logically!");
} else {
    console.log("Could not find the target strings.");
}
