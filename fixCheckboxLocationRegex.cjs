const fs = require('fs');
let code = fs.readFileSync('src/components/AuthView.jsx', 'utf8');

const targetRegex = /<\/AnimatePresence>\s*<button\s*type="submit"\s*disabled=\{loading\}\s*className="w-full h-10/s;
const match = code.match(targetRegex);

if (match) {
    const replacementStr = `                                    </AnimatePresence>

                                    {!isLogin && !isRecovering && (
                                        <label className="flex items-center gap-2 mt-2 mb-2 cursor-pointer bg-mono-100 dark:bg-white/5 p-2 rounded-md border border-mono-200 dark:border-white/10" dir="rtl">
                                          <input 
                                            type="checkbox" 
                                            checked={agreedToTerms} 
                                            onChange={(e) => { triggerHaptic(5); setAgreedToTerms(e.target.checked); }} 
                                            className="w-4 h-4 rounded-sm accent-primary cursor-pointer shrink-0"
                                          />
                                          <span className="text-mono-600 dark:text-mono-300 text-[10px] font-bold font-rabar leading-tight">
                                            ب دروستکرنا هەژمارێ، تو یێ ڕازی ب <button type="button" onClick={(e) => { e.preventDefault(); setActivePolicyModal('terms'); }} className="text-primary hover:underline">مەرجێن بکارئینانێ</button> و <button type="button" onClick={(e) => { e.preventDefault(); setActivePolicyModal('privacy'); }} className="text-primary hover:underline">سیاسەتا تایبەتمەندیێ</button>
                                          </span>
                                        </label>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-10`;
    
    code = code.replace(targetRegex, replacementStr);
    fs.writeFileSync('src/components/AuthView.jsx', code, 'utf8');
    console.log("SUCCESS");
} else {
    console.log("STILL NOT FOUND");
}
