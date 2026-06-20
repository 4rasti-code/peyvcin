import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/AuthContext';
import { triggerHaptic } from '../utils/haptics';
import { COUNTRIES } from '../data/countries';
import FlagBadge from './FlagBadge';
import { toKuDigits } from '../utils/formatters';
import UpgradeAccountModal from './UpgradeAccountModal';
import LinkEmailModal from './LinkEmailModal';

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
   const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
   const [isLinkEmailModalOpen, setIsLinkEmailModalOpen] = useState(false);

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
            
            <div className="w-full flex flex-col transition-all py-3 border-b border-mono-100 dark:border-white/5">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <button
                        onClick={() => { 
                           if (user?.is_anonymous) return;
                           triggerHaptic(10); 
                           if (isHardLocked) {
                              setShowLockToast(true);
                              setTimeout(() => setShowLockToast(false), 3000);
                              return;
                           }
                           setIsEditNicknameModalOpen(true);
                        }}
                        className={`px-4 py-2.5 rounded-md font-bold font-rabar text-[12px] transition-all flex items-center gap-2 shrink-0 ${user?.is_anonymous || isHardLocked ? 'bg-mono-100 dark:bg-mono-800/50 text-mono-400 cursor-not-allowed' : 'bg-mono-100 dark:bg-white/10 text-mono-800 dark:text-mono-100 hover:bg-mono-200 dark:hover:bg-white/20 active:scale-95'}`}
                     >
                        <span>{user?.is_anonymous ? 'قوفلکریە' : 'بگوهۆڕە'}</span>
                        {user?.is_anonymous || isHardLocked ? <span className="material-symbols-outlined text-[14px]">lock</span> : <span className="material-symbols-outlined text-[14px]">edit_square</span>}
                     </button>
                  </div>
                  <span className={`text-[17px] font-bold font-rabar text-mono-900 dark:text-white ${isHardLocked || user?.is_anonymous ? 'opacity-50' : ''}`}>{userNickname}</span>
               </div>
               
               {user?.is_anonymous && (
                  <div className="flex flex-col items-end mt-1 w-full">
                     <span className="text-[11px] font-bold font-rabar text-mono-500">هیڤیە بۆ گۆهۆڕینا ناسناڤی، خوە تۆمار بکە</span>
                  </div>
               )}
               
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
                                 className="w-full h-14 border rounded-md px-4 font-black font-rabar text-right text-[15px] transition-all outline-none bg-mono-50 dark:bg-white/5 border-mono-200 dark:border-white/10 text-mono-900 dark:text-white placeholder:text-mono-400 dark:placeholder:text-mono-500 focus:border-primary focus:ring-1 focus:ring-primary"
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

         </div>

         {/* ACCOUNT LINKING SECTION */}
         <div className="w-full pt-2">
            <div className="flex items-center w-full pb-4">
               <div className="flex-1 h-px bg-mono-200 dark:bg-white/10"></div>
               <span className="px-4 text-[13px] font-black font-rabar text-mono-400 dark:text-mono-500">هەژمار</span>
               <div className="flex-1 h-px bg-mono-200 dark:bg-white/10"></div>
            </div>
            
            {/* EMAIL BUTTON */}
            {(user?.is_anonymous || user?.app_metadata?.providers?.includes('email')) && (
               <button
                  onClick={() => {
                     triggerHaptic(10);
                     if (user?.is_anonymous) {
                        setIsUpgradeModalOpen(true);
                     } else if (!user?.app_metadata?.providers?.includes('email')) {
                        setIsLinkEmailModalOpen(true);
                     }
                  }}
                  disabled={!user?.is_anonymous && user?.app_metadata?.providers?.includes('email')}
                  className={`w-full h-[54px] rounded-[12px] relative flex flex-col items-center justify-center font-black font-rabar transition-all ${user?.app_metadata?.providers?.includes('email') ? 'bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-default border border-emerald-200 dark:border-emerald-500/20' : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-lg shadow-emerald-600/20 active:scale-[0.98]'}`}
                  dir="rtl"
               >
                  <span className={`material-symbols-outlined text-[20px] absolute left-5 ${user?.app_metadata?.providers?.includes('email') ? '' : 'text-white'}`}>
                     mail
                  </span>
                  <span className={`text-[14px] truncate w-full px-12 text-center pt-1 ${user?.app_metadata?.providers?.includes('email') ? '' : 'text-white'}`}>
                     {user?.is_anonymous ? 'ئیمەیل' : user?.app_metadata?.providers?.includes('email') ? 'ب ئیمێلی ڤە گرێداییە' : 'گرێدان ب ئیمێلەکێ دیڤە'}
                  </span>
                  {!user?.is_anonymous && user?.app_metadata?.providers?.includes('email') && (
                     <span className="text-[11px] font-bold truncate opacity-60 w-full px-12 text-center" dir="ltr">{user?.email}</span>
                  )}
               </button>
            )}

            {/* GOOGLE BUTTON */}
            <button
               onClick={async () => {
                  if (!user?.is_anonymous && !user?.app_metadata?.providers?.includes('google')) {
                     triggerHaptic(10);
                     try {
                        const { error } = await supabase.auth.linkIdentity({
                           provider: 'google',
                           options: {
                              redirectTo: `${window.location.origin}/`,
                           }
                        });
                        if (error) throw error;
                     } catch (err) {
                        console.error('Error linking Google account:', err);
                     }
                  }
               }}
               disabled={user?.is_anonymous || user?.app_metadata?.providers?.includes('google')}
               className={`w-full h-[54px] mt-3 rounded-[12px] relative flex flex-col items-center justify-center font-black font-rabar transition-all ${user?.app_metadata?.providers?.includes('google') ? 'bg-mono-50 dark:bg-white/5 text-mono-500 cursor-default border border-mono-200 dark:border-white/10' : 'bg-white text-mono-900 cursor-pointer shadow-md hover:bg-mono-50 active:scale-[0.98]'}`}
               dir="rtl"
            >
               <svg className={`w-5 h-5 absolute left-5 ${user?.app_metadata?.providers?.includes('google') ? 'grayscale' : ''}`} viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1c-4.3 0-8.01 2.47-9.82 6.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
               </svg>
               <span className={`text-[14px] truncate w-full px-12 text-center pt-1 ${user?.app_metadata?.providers?.includes('google') ? '' : 'text-mono-900'}`}>
                  {user?.app_metadata?.providers?.includes('google') ? 'ب گۆگڵی ڤە گرێداییە' : 'گرێدان ب گۆگڵیڤە'}
               </span>
               {user?.app_metadata?.providers?.includes('google') && (
                  <span className="text-[11px] font-bold truncate opacity-60 w-full px-12 text-center" dir="ltr">{user?.email}</span>
               )}
            </button>

            {/* DISCORD BUTTON */}
            <button
               onClick={async () => {
                  if (!user?.is_anonymous && !user?.app_metadata?.providers?.includes('discord')) {
                     triggerHaptic(10);
                     try {
                        const { error } = await supabase.auth.linkIdentity({
                           provider: 'discord',
                           options: {
                              redirectTo: `${window.location.origin}/`,
                           }
                        });
                        if (error) throw error;
                     } catch (err) {
                        console.error('Error linking Discord account:', err);
                        alert("Error: " + err.message);
                     }
                  }
               }}
               disabled={user?.is_anonymous || user?.app_metadata?.providers?.includes('discord')}
               className={`w-full h-[54px] mt-3 rounded-[12px] relative flex flex-col items-center justify-center font-black font-rabar transition-all ${user?.app_metadata?.providers?.includes('discord') ? 'bg-mono-50 dark:bg-white/5 text-mono-500 cursor-default border border-mono-200 dark:border-white/10' : 'bg-[#5865F2] hover:bg-[#4752C4] text-white cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98]'}`}
               dir="rtl"
            >
               <svg className={`w-5 h-5 absolute left-5 ${user?.app_metadata?.providers?.includes('discord') ? 'grayscale opacity-50' : ''}`} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
               </svg>
               <span className={`text-[14px] truncate w-full px-12 text-center pt-1 ${user?.app_metadata?.providers?.includes('discord') ? '' : 'text-white'}`}>
                  {user?.app_metadata?.providers?.includes('discord') ? 'ب دیسکۆردی ڤە گرێداییە' : 'گرێدان ب دیسکۆردیڤە'}
               </span>
            </button>
         </div>

         {/* UPGRADE ACCOUNT MODAL FOR GUESTS */}
         <UpgradeAccountModal 
            isOpen={isUpgradeModalOpen} 
            onSuccess={() => {
               setIsUpgradeModalOpen(false);
               setIsEditNicknameModalOpen(false); // Close settings if they registered successfully
            }} 
            onClose={() => setIsUpgradeModalOpen(false)}
         />

         {/* LINK EMAIL MODAL FOR GOOGLE USERS */}
         <LinkEmailModal 
            isOpen={isLinkEmailModalOpen} 
            onSuccess={() => {
               setIsLinkEmailModalOpen(false);
            }} 
            onClose={() => setIsLinkEmailModalOpen(false)}
         />
      </div>
   );
}
