import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/AuthContext';
import { triggerHaptic } from '../utils/haptics';
import { COUNTRIES } from '../data/countries';
import FlagBadge from './FlagBadge';
import { toKuDigits } from '../utils/formatters';

export default function AccountSettings({ updateProfile }) {
   const { user, userNickname, countryCode, isInKurdistan, lastNicknameUpdate } = useUser();

   const [draftNickname, setDraftNickname] = useState(userNickname);
   const [prevUserNickname, setPrevUserNickname] = useState(userNickname);
   if (userNickname !== prevUserNickname) {
      setPrevUserNickname(userNickname);
      setDraftNickname(userNickname);
   }

   const [draftCountryCode, setDraftCountryCode] = useState(countryCode);
   const [prevCountryCode, setPrevCountryCode] = useState(countryCode);
   if (countryCode !== prevCountryCode) {
      setPrevCountryCode(countryCode);
      setDraftCountryCode(countryCode);
   }

   const [draftIsInKurdistan, setDraftIsInKurdistan] = useState(isInKurdistan);
   const [prevIsInKurdistan, setPrevIsInKurdistan] = useState(isInKurdistan);
   if (isInKurdistan !== prevIsInKurdistan) {
      setPrevIsInKurdistan(isInKurdistan);
      setDraftIsInKurdistan(isInKurdistan);
   }


   const [saveError, setSaveError] = useState(null);
   const [isEditNicknameModalOpen, setIsEditNicknameModalOpen] = useState(false);
   const [isEditCountryModalOpen, setIsEditCountryModalOpen] = useState(false);
   const [showLockToast, setShowLockToast] = useState(false);

   let isHardLocked = false;
   let daysRemaining = 0;
   
   if (lastNicknameUpdate) {
      const lastUpdate = new Date(lastNicknameUpdate);
      const now = new Date();
      const diffTime = Math.abs(now - lastUpdate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 14) {
         isHardLocked = true;
         daysRemaining = 14 - diffDays;
      }
   }





   const handleSave = async () => {
      try {
         setSaveError(null);
         triggerHaptic([20, 10, 20]);
         const updates = { 
            country_code: draftCountryCode, 
            is_kurdistan: draftIsInKurdistan 
         };
         
         if (draftNickname !== userNickname) {
            updates.nickname = draftNickname;
            updates.last_nickname_update = new Date().toISOString();
         }
         
         await updateProfile(updates);
         
         setIsEditNicknameModalOpen(false);
         setIsEditCountryModalOpen(false);
      } catch (err) { 
         setSaveError(err.message || 'شاشیەک ڕوویدا');
      }
   };



   const selectedCountry = COUNTRIES.find(c => c.code === countryCode);
   const selectedCountryName = isInKurdistan ? 'کوردستان' : (selectedCountry ? selectedCountry.name : 'ھەلبژێرە');

   return (
      <div className="space-y-4">
         {/* 4. ACCOUNT SETTINGS SECTION */}
         <div className="px-4 py-2 rounded-md bg-mono-50/50 dark:bg-white/5 border border-mono-100 dark:border-white/5 flex flex-col divide-y divide-mono-100 dark:divide-white/5 relative">
            
            <div className="w-full flex items-center justify-between transition-all py-3">
               <div className="flex items-center gap-2">
                  <button
                     onClick={() => { 
                        triggerHaptic(10); 
                        if (isHardLocked) {
                           setShowLockToast(true);
                           setTimeout(() => setShowLockToast(false), 3000);
                           return;
                        }
                        setIsEditNicknameModalOpen(true);
                     }}
                     className={`px-4 py-2.5 rounded-md font-bold font-rabar text-[12px] transition-all flex items-center gap-2 shrink-0 ${isHardLocked ? 'bg-mono-100 dark:bg-mono-800/50 text-mono-400 cursor-not-allowed' : 'bg-mono-100 dark:bg-white/10 text-mono-800 dark:text-mono-100 hover:bg-mono-200 dark:hover:bg-white/20 active:scale-95'}`}
                  >
                     <span>بگوهۆڕە</span>
                     {isHardLocked ? <span className="material-symbols-outlined text-[14px]">lock</span> : <span className="material-symbols-outlined text-[14px]">edit_square</span>}
                  </button>
               </div>
               <span className={`text-[17px] font-bold font-rabar text-mono-900 dark:text-white ${isHardLocked ? 'opacity-50' : ''}`}>{userNickname}</span>
               
               <AnimatePresence>
                  {showLockToast && (
                     <Motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 z-1000 flex items-center justify-center p-6 pointer-events-none"
                     >
                        <div className="bg-amber-500 text-slate-950 px-6 py-4 rounded-md font-black font-rabar text-[13px] shadow-2xl flex items-center gap-3 border-2 border-white/30 backdrop-blur-sm pointer-events-auto">
                           <span className="material-symbols-outlined text-xl">lock</span>
                           تو نەشێی ناسناڤێ خوە بگوهۆڕی هەتا {toKuDigits(daysRemaining)} ڕۆژێن دی
                        </div>
                     </Motion.div>
                  )}
               </AnimatePresence>

               {isEditNicknameModalOpen && createPortal(
                  <AnimatePresence>
                     <Motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-1100 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                        onClick={() => setIsEditNicknameModalOpen(false)}
                     >
                        <Motion.div
                           initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                           className="w-full max-w-[340px] bg-mono-white dark:bg-mono-900 rounded-md p-6 border border-mono-200 dark:border-mono-800 shadow-2xl noise-grain font-rabar flex flex-col gap-5"
                           onClick={e => e.stopPropagation()}
                           dir="rtl"
                        >
                           <h3 className="text-xl font-black text-mono-900 dark:text-white text-center w-full">گوهۆڕینا ناسناڤی</h3>
                           
                           <div className="space-y-2">
                              <label className="text-[12px] font-black text-mono-500 block text-right px-1">ناسناڤی بنڤیسە</label>
                              <input
                                 type="text"
                                 placeholder="ناسناڤ"
                                 value={draftNickname}
                                 onChange={(e) => {
                                    const noSpaceVal = e.target.value.replace(/\s/g, '');
                                    setDraftNickname(noSpaceVal);
                                    if (saveError) setSaveError(null);
                                 }}
                                 maxLength={20}
                                 className="w-full h-14 border rounded-md px-4 font-black font-rabar text-right text-[15px] bg-mono-50 dark:bg-white/5 border-mono-200 dark:border-white/10 text-mono-900 dark:text-white placeholder:text-mono-400 dark:placeholder:text-mono-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                 autoFocus
                              />
                              <AnimatePresence>
                                 {saveError && (
                                    <Motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-rose-500 text-[10px] font-black px-1">{saveError}</Motion.p>
                                 )}
                                 {draftNickname.length > 0 && draftNickname.length < 8 && !saveError && (
                                    <Motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-rose-500 text-[10px] font-black px-1">نابیت ناسناڤ ژ ٨ پیتان کێمتر بیت</Motion.p>
                                 )}
                                 {draftNickname.length > 15 && !saveError && (
                                    <Motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-rose-500 text-[10px] font-black px-1">نابیت ناسناڤ ژ ١٥ پیتان زێدەتر بیت</Motion.p>
                                 )}
                              </AnimatePresence>
                           </div>

                           <div className="flex items-center gap-3 pt-2">
                              <button
                                 onClick={() => {
                                    setDraftNickname(userNickname);
                                    setSaveError(null);
                                    setIsEditNicknameModalOpen(false);
                                 }}
                                 className="flex-1 h-12 rounded-md font-black text-[13px] bg-mono-100 dark:bg-white/10 text-mono-700 dark:text-mono-300 hover:bg-mono-200 dark:hover:bg-white/20 transition-colors"
                              >
                                 هەلوەشاندن
                              </button>
                              <button
                                 onClick={handleSave}
                                 disabled={draftNickname.length < 8 || draftNickname.length > 15 || draftNickname === userNickname}
                                 className="flex-1 h-12 rounded-md font-black text-[13px] bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-green-600/20"
                              >
                                 پاراستن
                              </button>
                           </div>
                        </Motion.div>
                     </Motion.div>
                  </AnimatePresence>,
                  document.body
               )}
            </div>

            <div className="w-full flex items-center justify-between transition-all py-3">
               <div className="flex items-center gap-2">
                  <button
                     onClick={() => { 
                        triggerHaptic(10); 
                        setIsEditCountryModalOpen(true);
                     }}
                     className="px-4 py-2.5 rounded-md font-bold font-rabar text-[12px] transition-all flex items-center gap-2 shrink-0 bg-mono-100 dark:bg-white/10 text-mono-800 dark:text-mono-100 hover:bg-mono-200 dark:hover:bg-white/20 active:scale-95"
                  >
                     <span>بگوهۆڕە</span>
                     <span className="material-symbols-outlined text-[14px]">edit_square</span>
                  </button>
               </div>
               <div className="flex items-center gap-2 flex-row-reverse">
                  <FlagBadge countryCode={countryCode} isInKurdistan={isInKurdistan} size="sm" />
                  <span className="text-[17px] font-bold font-rabar text-mono-900 dark:text-white">{selectedCountryName}</span>
               </div>

               {isEditCountryModalOpen && createPortal(
                  <AnimatePresence>
                     <Motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-1100 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                        onClick={() => setIsEditCountryModalOpen(false)}
                     >
                        <Motion.div
                           initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                           className="w-full max-w-[340px] bg-mono-white dark:bg-mono-900 rounded-md p-6 border border-mono-200 dark:border-mono-800 shadow-2xl noise-grain font-rabar flex flex-col gap-5"
                           onClick={e => e.stopPropagation()}
                           dir="rtl"
                        >
                           <h3 className="text-xl font-black text-mono-900 dark:text-white text-center w-full">گوهۆڕینا وەڵاتی</h3>
                           
                           <div className="space-y-2">
                              <label className="text-[12px] font-black text-mono-500 block text-right px-1">وەڵاتێ خوە هەلبژێرە</label>
                              <div className="p-1.5 max-h-[220px] overflow-y-auto custom-scrollbar bg-mono-50 dark:bg-white/5 border border-mono-200 dark:border-white/10 rounded-md">
                                 <button onClick={() => { triggerHaptic(10); setDraftIsInKurdistan(true); }} className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-mono-100 dark:hover:bg-mono-800 w-full transition-colors flex-row-reverse">
                                    <FlagBadge isInKurdistan={true} size="xs" />
                                    <span className="flex-1 text-right text-[14px] font-bold font-rabar text-mono-900 dark:text-mono-100">کوردستان</span>
                                    {draftIsInKurdistan && <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>}
                                 </button>
                                 {COUNTRIES.map((country) => (
                                    <button key={country.code} onClick={() => { triggerHaptic(10); setDraftIsInKurdistan(false); setDraftCountryCode(country.code); }} className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-mono-100 dark:hover:bg-mono-800 w-full transition-colors flex-row-reverse">
                                       <FlagBadge countryCode={country.code} size="xs" />
                                       <span className="flex-1 text-right text-[14px] font-bold font-rabar text-mono-900 dark:text-mono-100">{country.name}</span>
                                       {!draftIsInKurdistan && draftCountryCode === country.code && <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>}
                                    </button>
                                 ))}
                              </div>
                           </div>

                           <div className="flex items-center gap-3 pt-2">
                              <button
                                 onClick={() => {
                                    setDraftCountryCode(countryCode);
                                    setDraftIsInKurdistan(isInKurdistan);
                                    setSaveError(null);
                                    setIsEditCountryModalOpen(false);
                                 }}
                                 className="flex-1 h-12 rounded-md font-black text-[13px] bg-mono-100 dark:bg-white/10 text-mono-700 dark:text-mono-300 hover:bg-mono-200 dark:hover:bg-white/20 transition-colors"
                              >
                                 هەلوەشاندن
                              </button>
                              <button
                                 onClick={handleSave}
                                 disabled={draftCountryCode === countryCode && draftIsInKurdistan === isInKurdistan}
                                 className="flex-1 h-12 rounded-md font-black text-[13px] bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-green-600/20"
                              >
                                 پاراستن
                              </button>
                           </div>
                        </Motion.div>
                     </Motion.div>
                  </AnimatePresence>,
                  document.body
               )}
            </div>

            <div className="w-full flex items-center justify-between transition-all py-3">
               <div className="flex items-center gap-2"></div>
               <div className="flex items-center gap-2 flex-row-reverse">
                  <span className="material-symbols-outlined text-[18px] text-mono-400 dark:text-mono-500">mail</span>
                  <span className="text-[15px] font-bold font-rabar text-mono-500 dark:text-mono-400 truncate max-w-[200px]" dir="ltr">{user?.email || 'جیمایڵ نەتایبەتە'}</span>
               </div>
            </div>
         </div>
      </div>
   );
}
