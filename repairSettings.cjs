const fs = require('fs');
let file = 'src/components/SettingsModal.jsx';
let content = fs.readFileSync(file, 'utf8');

// The file was messed up starting from line 164.
// Let's split it into lines.
let lines = content.split('\n');

// Find the first index of `return (`
let firstReturn = lines.findIndex(l => l.includes('return ('));
let secondReturn = lines.findIndex((l, i) => i > firstReturn && l.includes('return ('));

if (secondReturn !== -1) {
    // Keep everything up to the line BEFORE the messed up replacement.
    // The messed up replacement replaced the inside of the feedback button with `return (`.
    // The line with `mailto:support@peyvok.com` is at secondReturn - 1.
    let goodLines = lines.slice(0, secondReturn - 1);
    
    // Now append the correct ending.
    let correctEnding = `                        <button onClick={() => { triggerHaptic(10); window.location.href = 'mailto:support@peyvok.com'; }} className="flex items-center justify-between py-3 w-full group transition-colors">
                           <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-lg text-mono-400 dark:text-mono-500 group-hover:text-mono-900 dark:group-hover:text-white transition-colors">feedback</span>
                              <span className="text-[13px] font-bold font-rabar text-mono-800 dark:text-mono-200">فیدباک</span>
                           </div>
                           <span className="material-symbols-outlined text-[16px] text-mono-300 dark:text-mono-600">chevron_left</span>
                        </button>
                     </div>

                     <div className="pt-4 pb-2">
                        <button
                           onClick={() => { triggerHaptic(15); onLogout?.(); }}
                           className="relative w-full h-11 rounded-md font-bold text-[13px] transition-all active:scale-95 flex items-center justify-center bg-mono-100 dark:bg-white/5 hover:bg-mono-200 dark:hover:bg-white/10 text-mono-700 dark:text-white/70"
                        >
                           <span className="material-symbols-outlined text-lg absolute left-4">logout</span>
                           دەرکەفتن ژ هژمارێ
                        </button>
                     </div>

                     <div className="pt-2 flex flex-col items-center gap-1 opacity-50">
                        <p className="text-[8px] font-black tracking-[0.4em] uppercase text-mono-500">Peyvok v2.1.0</p>
                     </div>
                  </div>
               </Motion.div>
            </Motion.div>
            )}
         </AnimatePresence>
      </>
   );
}

export default SettingsModal;`;

    fs.writeFileSync(file, goodLines.join('\n') + '\n' + correctEnding, 'utf8');
    console.log('Fixed SettingsModal.jsx');
} else {
    console.log('No second return found, might be fine.');
}
