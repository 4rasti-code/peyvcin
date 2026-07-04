const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Checkbox simplification
// Find the label class
let checkboxRegex = /<label className="flex items-start gap-3 mt-4 mb-3 cursor-pointer bg-mono-100 dark:bg-white\/5 p-3 rounded-md border border-mono-200 dark:border-white\/10" dir="rtl">/;
content = content.replace(
    checkboxRegex,
    '<label className="flex items-start gap-3 mt-4 mb-3 cursor-pointer p-1" dir="rtl">'
);

// 2. Social Login warning text tightening
let warningRegex = /<p className="text-\[10px\] font-bold font-rabar text-mono-400 dark:text-white\/40 leading-relaxed">/g;
content = content.replace(
    warningRegex,
    '<p className="text-[9px] font-bold font-rabar text-mono-400 dark:text-white/40 leading-tight">'
);
// Make the container tighter
let warningContainerRegex = /<div className="text-center mb-3 px-2 mt-4">/g;
content = content.replace(
    warningContainerRegex,
    '<div className="text-center mb-2 px-1 mt-3">'
);

// 3. Social buttons side-by-side
// We have Google button and Discord button consecutively.
// We need to wrap them in a flex container.
let googleBtnRegex = /<button\s+type="button"\s+onClick=\{[^}]*handleSocialLogin\('google'\)[^}]*\}\s+disabled=\{loading\}\s+className="w-full h-10 sm:h-9 rounded-md bg-white text-mono-900 border border-mono-200 flex items-center justify-center gap-3 hover:bg-gray-50 active:scale-95 transition-all shadow-sm font-bold font-rabar text-sm sm:text-xs"\s+title="Google"\s+>/g;

let newGoogleBtn = `<div className="flex items-center gap-3 w-full">
                                        <button
                                            type="button"
                                            onClick={() => handleSocialLogin('google')}
                                            disabled={loading}
                                            className="flex-1 h-10 sm:h-9 rounded-md bg-white text-mono-900 border border-mono-200 flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all shadow-sm font-bold font-rabar text-xs sm:text-[11px]"
                                            title="Google"
                                        >`;
content = content.replace(googleBtnRegex, newGoogleBtn);

let discordBtnRegex = /<button\s+type="button"\s+onClick=\{[^}]*handleSocialLogin\('discord'\)[^}]*\}\s+disabled=\{loading\}\s+className="w-full mt-3 bg-\[#5865F2\] hover:bg-\[#4752C4\] text-white rounded-md h-10 sm:h-9 font-bold font-rabar text-sm sm:text-xs transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"\s+>/g;

let newDiscordBtn = `<button
                                            type="button"
                                            onClick={() => handleSocialLogin('discord')}
                                            disabled={loading}
                                            className="flex-1 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-md h-10 sm:h-9 font-bold font-rabar text-xs sm:text-[11px] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                        >`;
content = content.replace(discordBtnRegex, newDiscordBtn);

// Close the flex container after Discord button text
let discordTextRegex = /<span className="relative z-10 font-bold text-\[15px\]">دیسکۆرد<\/span>\s*<\/button>/;
let discordTextReplace = `<span className="relative z-10 font-bold text-sm">دیسکۆرد</span>
                                        </button>
                                    </div>`;
content = content.replace(discordTextRegex, discordTextReplace);

// Fix Google text size
let googleTextRegex = /<span className="relative z-10 font-bold text-\[15px\]">گۆگڵ<\/span>/;
let googleTextReplace = `<span className="relative z-10 font-bold text-sm">گۆگڵ</span>`;
content = content.replace(googleTextRegex, googleTextReplace);


// 4. Guest button outline style
let guestBtnRegex = /<button\s+type="button"\s+onClick=\{handleGuestLogin\}\s+disabled=\{loading\}\s+className="w-full h-9 sm:h-8 mb-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md font-bold font-rabar text-\[11px\] sm:text-xs transition-all flex items-center justify-center gap-2"\s+>/;

let newGuestBtn = `<button
                                        type="button"
                                        onClick={handleGuestLogin}
                                        disabled={loading}
                                        className="w-full h-9 sm:h-8 mb-3 bg-transparent border-2 border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-500 rounded-md font-bold font-rabar text-[11px] sm:text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
                                    >`;
content = content.replace(guestBtnRegex, newGuestBtn);

fs.writeFileSync(file, content, 'utf8');
console.log("UI simplified successfully");
