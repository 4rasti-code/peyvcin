const fs = require('fs');
let file = 'src/components/SettingsModal.jsx';
let content = fs.readFileSync(file, 'utf8');

// The file got messed up after `<div className="pt-2 flex flex-col items-center gap-1 opacity-20">`
// Let's truncate and rewrite the end of the file.

let cutIdx = content.indexOf('<div className="pt-2 flex flex-col items-center gap-1 opacity-20">');
if (cutIdx !== -1) {
    let goodPart = content.substring(0, cutIdx);
    
    let rest = `                     <div className="pt-2 flex flex-col items-center gap-1 opacity-20">
                        <p className="text-[8px] font-black tracking-[0.4em] uppercase text-mono-400">Peyvok v2.1.0</p>
                     </div>
                  </div>
               </Motion.div>
            </Motion.div>
            )}
         </AnimatePresence>

         {/* DELETE CONFIRMATION OVERLAY */}
         <AnimatePresence>
            {showDeleteConfirm && (
               <Motion.div
                  key="delete-confirm-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
               >
                  <Motion.div
                     initial={{ scale: 0.9, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     exit={{ scale: 0.9, opacity: 0 }}
                     className="bg-mono-white dark:bg-[#1A1A1A] w-full max-w-sm rounded-[24px] p-6 shadow-2xl font-rabar border border-mono-100 dark:border-white/10"
                  >
                     <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4 mx-auto">
                        <span className="material-symbols-outlined text-2xl">warning</span>
                     </div>
                     <h3 className="text-xl font-black text-center text-mono-900 dark:text-white mb-2">ژێبرنا هژمارێ!</h3>
                     <p className="text-[13px] font-bold text-center text-mono-500 dark:text-white/50 mb-6 leading-relaxed">
                        تۆ دڵنیایی؟ ئەگەر ڤێ کردارێ ئەنجام بدەی، هەمی داتا و پێشکەفتنێن تە دێ ب یەکجاری هێنە ژێبرن و ڤەگەڕاندن تێدا نینە.
                     </p>
                     
                     <div className="flex flex-col gap-3">
                        <button
                           onClick={() => { triggerHaptic(10); handleDeleteAccount(); }}
                           className="w-full h-[54px] rounded-[16px] bg-red-500 text-white font-black text-[15px] flex items-center justify-center transition-transform active:scale-95"
                        >
                           بەلێ، ژێببە
                        </button>
                        <button
                           onClick={() => { triggerHaptic(10); setShowDeleteConfirm(false); }}
                           className="w-full h-[54px] rounded-[16px] bg-mono-100 dark:bg-white/5 text-mono-700 dark:text-white/70 font-bold text-[15px] flex items-center justify-center transition-transform active:scale-95"
                        >
                           نەخێر، پەشیمان بووم
                        </button>
                     </div>
                  </Motion.div>
               </Motion.div>
            )}
         </AnimatePresence>
           
         <AnimatePresence>
            {isHelpCenterOpen && (
               <HelpCenterModal 
                  key="help-center-modal"
                  onClose={() => setIsHelpCenterOpen(false)} 
                  triggerHaptic={triggerHaptic} 
               />
            )}
         </AnimatePresence>
         
         <BlockedUsersModal
            isOpen={isBlockedModalOpen}
            onClose={() => setIsBlockedModalOpen(false)}
            user={user}
            handleToggleBlock={handleToggleBlock}
         />
      </>
   );
}

export default SettingsModal;
`;

    fs.writeFileSync(file, goodPart + rest, 'utf8');
    console.log('Fixed end of SettingsModal');
} else {
    console.log('Could not find marker');
}
