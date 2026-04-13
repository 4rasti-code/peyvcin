import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AVATARS, DEFAULT_AVATAR } from '../data/avatars';
import { COUNTRIES } from '../data/countries';
import { supabase } from '../lib/supabase';
import FlagBadge from './FlagBadge';
import StatsView from './StatsView';
import { FilsIcon, DerhemIcon, ZerIcon } from './CurrencyIcon';
import { triggerHaptic } from '../utils/haptics';
import { toKuDigits } from '../utils/formatters';
import ExperienceBar from './ExperienceBar';
import Avatar from './Avatar';

export default function ProfileView({
   user,
   userNickname,
   onProfileSave,
   userAvatar,
   userCity,
   isInKurdistan,
   countryCode,
   level,
   currentXP,
   fils,
   derhem,
   zer,
   playerStats,
   userRank,
   onViewChange,
   maxXP
}) {
   const [activeTab, setActiveTab] = useState('profile');
   const [isFlagBoxOpen, setIsFlagBoxOpen] = useState(false);
   const [isAvatarBoxOpen, setIsAvatarBoxOpen] = useState(false);
   const [isUploading, setIsUploading] = useState(false);
   const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0, width: 0 });
   const fileInputRef = useRef(null);
   const flagDropdownRef = useRef(null);
   const flagButtonRef = useRef(null);
   const [draftNickname, setDraftNickname] = useState(userNickname);
   const [draftAvatar, setDraftAvatar] = useState(userAvatar);
   const [draftCountryCode, setDraftCountryCode] = useState(countryCode);
   const [draftIsInKurdistan, setDraftIsInKurdistan] = useState(isInKurdistan);
   const [saveSuccess, setSaveSuccess] = useState(false);
   const [dbLoading, setDbLoading] = useState(false);
   const [isNicknameLocked, setIsNicknameLocked] = useState(true);
   const [pendingFile, setPendingFile] = useState(null);
   const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
   const nicknameInputRef = useRef(null);

   // --- 1. SMART RE-VALIDATION ---
   useEffect(() => {
      setDraftNickname(userNickname);
      setDraftAvatar(userAvatar);
      setDraftCountryCode(countryCode);
      setDraftIsInKurdistan(isInKurdistan);
   }, [userNickname, userAvatar, countryCode, isInKurdistan]);

   useEffect(() => {
      if (isFlagBoxOpen && flagButtonRef.current) {
         const rect = flagButtonRef.current.getBoundingClientRect();
         setDropdownCoords({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width
         });
      }
   }, [isFlagBoxOpen]);

   useEffect(() => {
      function handleClickOutside(event) {
         if (flagDropdownRef.current && !flagDropdownRef.current.contains(event.target) &&
            flagButtonRef.current && !flagButtonRef.current.contains(event.target)) {
            setIsFlagBoxOpen(false);
         }
      }
      if (isFlagBoxOpen) {
         document.addEventListener('mousedown', handleClickOutside);
         window.addEventListener('scroll', () => setIsFlagBoxOpen(false), { once: true });
         window.addEventListener('resize', () => setIsFlagBoxOpen(false), { once: true });
      }
      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
      };
   }, [isFlagBoxOpen]);

   // Calculate progress within current level
   const calculatePrevMaxXP = (lvl) => {
      if (lvl <= 1) return 0;
      return 500 + ((lvl - 2) * 150);
   };
   
   const prevMaxXP = calculatePrevMaxXP(level);
   const progress = Math.max(0, Math.min(1, (currentXP - prevMaxXP) / (maxXP - prevMaxXP)));

   // Define Level Tiers with specific premium gradients
   const getLevelTier = (lvl) => {
      if (lvl < 10) return { stop1: '#cd7f32', stop2: '#8b4513', shadow: 'rgba(139, 69, 19, 0.6)' }; // Bronze
      if (lvl < 25) return { stop1: '#cbd5e1', stop2: '#64748b', shadow: 'rgba(100, 116, 139, 0.6)' }; // Silver
      if (lvl < 45) return { stop1: '#fcd34d', stop2: '#b45309', shadow: 'rgba(180, 83, 9, 0.6)' };  // Gold
      if (lvl < 70) return { stop1: '#22d3ee', stop2: '#0369a1', shadow: 'rgba(6, 182, 212, 0.6)' }; // Cyan/Master
      if (lvl < 90) return { stop1: '#a855f7', stop2: '#4f46e5', shadow: 'rgba(139, 92, 246, 0.6)' }; // Purple/Imperial
      return { stop1: '#ef4444', stop2: '#7f1d1d', shadow: 'rgba(239, 68, 68, 0.6)' };              // God Mode
   };

   const tier = getLevelTier(level);

   const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setPendingFile(file);
      const preview = URL.createObjectURL(file);
      setLocalPreviewUrl(preview);
      setDraftAvatar(preview);
      setIsAvatarBoxOpen(false);
      triggerHaptic(10);
   };

   const handleInvite = () => {
      const shareLink = `${window.location.origin}/play?invite=${user?.id || 'guest'}`;
      navigator.clipboard.writeText(shareLink);
      alert('لینک هاتە کۆپیکرن! بۆ هەڤالێن خۆ بفرێژە.');
   };

   const handleSave = async () => {
      try {
         setIsUploading(true);
         triggerHaptic([20, 10, 20]);
         let finalAvatar = draftAvatar;
         if (pendingFile) {
            try {
               const fileExt = pendingFile.name.split('.').pop();
               const fileName = `${user?.id || 'guest'}-${Date.now()}.${fileExt}`;
               
               const { data, error: uploadError } = await supabase.storage
                  .from('avatars')
                  .upload(fileName, pendingFile);

               if (uploadError) {
                  console.warn("Avatar upload failed, but continuing with nickname:", uploadError);
                  alert("وێنە بار نەبوو (تکایە دڵنیابە Bucket: avatars یێ Public هەیە)، بەس دێ ناڤێ تە سەیڤ کەین.");
               } else {
                  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
                  finalAvatar = publicUrl;
               }
            } catch (upErr) {
               console.error("Upload process error:", upErr);
            }
         }

         const saveResult = await onProfileSave({
            nickname: draftNickname,
            avatar_url: finalAvatar,
            countryCode: draftCountryCode,
            isInKurdistan: draftIsInKurdistan
         });
         
         setSaveSuccess(true);
         setIsNicknameLocked(true);
         setPendingFile(null);
         if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
         setLocalPreviewUrl(null);
         setTimeout(() => setSaveSuccess(false), 2000);
      } catch (err) {
         console.error("Save failed:", err);
         alert(`خەلەتی د سەیڤکرنێ دا: ${err.message || 'Error'}`);
      } finally {
         setIsUploading(false);
      }
   };

   const selectedCountryName = draftIsInKurdistan ? 'کوردستان' : (COUNTRIES.find(c => c.code === draftCountryCode)?.name || 'جیھان');

   return (
      <div className="w-screen max-w-full mx-auto h-full flex flex-col pt-0 pb-0 overflow-x-hidden relative z-10">

         {/* 1. THE ACTION HEADER & MASTER CARD AREA */}
         <div className="px-5 mb-4 text-center flex flex-col items-center">
            {/* THE MASTER BADGE - WIDE & COMPACT ASPECT */}
            <div className="relative w-full aspect-square max-w-[340px] rounded-[40px] overflow-hidden border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] bg-slate-950 group">
               
               {/* Static High-Contrast Background Background */}
               <div className="absolute inset-0 bg-gradient-to-b from-[#1a1c2c] via-[#0a0b14] to-black opacity-100"></div>

               {/* PERIMETER XP PROGRESS STROKE - THE ELITE EXPERIENCE */}
               <svg 
                  className="absolute inset-0 w-full h-full pointer-events-none z-50 transform -rotate-90" 
                  viewBox="0 0 340 340" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
               >
                  {/* Background Path (Empty State) - Slightly more visible track */}
                  <rect x="2" y="2" width="336" height="336" rx="38" stroke="white" strokeWidth="4" strokeOpacity="0.08" />
                  
                  {/* Active Progress Path (Animated) */}
                  <motion.rect 
                     x="2" y="2" width="336" height="336" rx="38" 
                     stroke="url(#cardProgressGradient)" 
                     strokeWidth="6" 
                     strokeLinecap="round"
                     initial={{ pathLength: 0 }}
                     animate={{ pathLength: progress }}
                     transition={{ duration: 2, ease: "circOut" }}
                     style={{ 
                        filter: `drop-shadow(0 0 12px ${tier.shadow})`
                     }}
                  />
                  
                  <defs>
                     <linearGradient id="cardProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={tier.stop1} />
                        <stop offset="100%" stopColor={tier.stop2} />
                     </linearGradient>
                  </defs>
               </svg>

               {/* Technical Hex Grid Texture */}
               <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] mix-blend-overlay"></div>

               {/* Dynamic Core Glow */}
               <div 
                  className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full blur-[90px] pointer-events-none transition-colors duration-500"
                  style={{ backgroundColor: tier.stop1 + '26' }} // primary/15 logic
               ></div>

               {/* Dynamic Technical Rings */}
               <div 
                  className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 rounded-full pointer-events-none transition-colors duration-500"
                  style={{ borderColor: tier.stop1 + '1a' }} // primary/10 logic
               ></div>
               <div 
                  className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border rounded-full pointer-events-none transition-colors duration-500"
                  style={{ borderColor: tier.stop1 + '0d' }} // primary/5 logic
               ></div>

               {/* Top Header Layer: Actions & Medal - Compacted Height */}
               <div className="absolute top-0 left-0 right-0 h-16 z-30 px-6 flex justify-between items-center" dir="ltr">
                  <div className="w-10 h-10 flex items-center justify-center">
                     <AnimatePresence>
                        {(draftAvatar !== userAvatar || pendingFile || draftNickname !== userNickname || draftCountryCode !== countryCode) && !saveSuccess && (
                           <motion.button
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 90 }}
                              onClick={(e) => { e.stopPropagation(); handleSave(); }}
                              disabled={isUploading}
                              className="w-12 h-12 bg-primary text-slate-950 rounded-2xl shadow-[0_0_30px_rgba(var(--primary-rgb),0.6)] flex items-center justify-center border-2 border-white/40 z-50 hover:scale-110 active:scale-95 transition-all"
                           >
                              {isUploading ? (
                                 <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div>
                              ) : (
                                 <span className="material-symbols-outlined text-2xl font-black">check_circle</span>
                              )}
                           </motion.button>
                        )}
                     </AnimatePresence>
                  </div>

                  <div className="relative flex flex-col items-center pt-2">
                     <div className="flex flex-col items-center relative group/medal">
                        {/* Premium Shield Badge Shape */}
                        <div className="relative w-14 h-15 flex items-center justify-center">
                           {/* Outer Glow */}
                           <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 opacity-0 group-hover/medal:opacity-100 transition-opacity"></div>

                           {/* SVG Shield Background */}
                           <svg className="absolute inset-0 w-full h-full drop-shadow-2xl" viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M50 0L95 20V55C95 80 50 115 50 115C50 115 5 80 5 55V20L50 0Z" fill="url(#medalGradient)" stroke="white" strokeWidth="4" strokeOpacity="0.2" />
                              <defs>
                                 <linearGradient id="medalGradient" x1="50" y1="0" x2="50" y2="115" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#FFD700" />
                                    <stop offset="1" stopColor="#B8860B" />
                                 </linearGradient>
                              </defs>
                           </svg>

                           {/* Level Number */}
                           <div className="relative z-10 flex flex-col items-center justify-center -mt-2">
                              <span className="text-[9px] font-black text-slate-950/40 uppercase leading-none mb-0.5">ئاست</span>
                              <span className="text-2xl font-black text-slate-950 leading-none drop-shadow-sm">{toKuDigits(level)}</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Central Player Portrait - Overlapping Banner */}
               <div className="absolute top-8 left-0 right-0 bottom-0 flex flex-col items-center z-20">
                  <div
                     className="relative cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300"
                     onClick={() => { triggerHaptic(10); fileInputRef.current?.click(); }}
                  >
                     <div className="relative">
                        <div className="absolute inset-0 -m-1 rounded-full border border-primary/20"></div>
                        <Avatar src={draftAvatar} size="xxl" className="w-36 h-36 rounded-full border-2 border-slate-950 shadow-[0_0_30px_rgba(0,0,0,0.8)] z-20" updatedAt={user?.updated_at} />
                        <div className="absolute bottom-1 right-1 w-9 h-9 bg-white text-slate-950 rounded-full shadow-xl border-2 border-slate-950 flex items-center justify-center z-30 group-hover:bg-primary transition-colors">
                           <span className="material-symbols-outlined text-lg font-black">photo_camera</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Bottom Identity Plate - Minimalist & Closer */}
               <div className="absolute bottom-4 left-4 right-4 z-40 text-right" dir="rtl">
                  <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[28px] border border-white/5 p-4 shadow-2xl">
                     <div className="flex flex-col items-center mb-4">
                        <h3 className="text-2xl font-black font-rabar text-white text-center leading-tight tracking-tight">{draftNickname || 'یاریکەر'}</h3>
                     </div>
                     <div className="grid grid-cols-3 gap-2 px-1" dir="ltr" style={{ color: level < 10 ? '#fff' : level < 25 ? '#1e293b' : level < 45 ? '#451a03' : '#000' }}>
                        {/* Master XP Bubble */}
                        <div 
                           className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border border-white/10 transition-colors duration-500"
                           style={{ backgroundColor: tier.stop1 + '20', borderColor: tier.stop1 + '30' }}
                        >
                           <span className="text-[8px] font-black uppercase mb-0.5 opacity-60" style={{ color: tier.stop1 }}>ماستەر</span>
                           <span className="text-lg font-black leading-none tracking-tighter text-white">{toKuDigits(currentXP)}</span>
                        </div>

                        {/* Progress Rate Bubble - Most Vibrant */}
                        <div 
                           className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl shadow-lg border-2 z-10 transition-all duration-500 scale-105"
                           style={{ 
                              backgroundColor: tier.stop1, 
                              borderColor: 'rgba(255,255,255,0.2)',
                              boxShadow: `0 10px 20px -5px ${tier.shadow}`
                           }}
                        >
                           <span className="text-[8px] font-black uppercase mb-0.5" style={{ color: level < 25 ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)' }}>ڕێژە</span>
                           <span className="text-xl font-black leading-none">{toKuDigits(Math.round(progress * 100))}</span>
                        </div>

                        {/* Rank Bubble */}
                        <div 
                           className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border border-white/10 relative overflow-hidden group transition-colors duration-500"
                           style={{ backgroundColor: tier.stop1 + '20', borderColor: tier.stop1 + '30' }}
                        >
                           {userRank === 1 && (
                              <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                           )}
                           <span className="text-[8px] font-black uppercase mb-0.5 opacity-60" style={{ color: tier.stop1 }}>ڕێزبەندی</span>
                           <span className={`text-lg font-black leading-none tracking-tighter text-white`}>
                              #{toKuDigits(userRank || 1)}
                           </span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* 2. THE MASTER TAB BAR - MATCHING CARD AESTHETIC */}
         <div className="mx-6 mb-4">
            <div className="flex bg-slate-950/90 backdrop-blur-xl p-1 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
               {/* Subtle technical background decoration for the tab bar */}
               <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
               </div>

               {[
                  { id: 'profile', label: 'بەرپەر', icon: 'person' },
                  { id: 'stats', label: 'ئامار', icon: 'leaderboard' },
                  { id: 'friends', label: 'هەڤال', icon: 'group' }
               ].map(tab => {
                  const isActive = activeTab === tab.id;
                  return (
                     <button
                        key={tab.id}
                        onClick={() => { triggerHaptic(10); setActiveTab(tab.id); }}
                        className={`flex-1 relative py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 z-10 ${isActive
                              ? 'text-slate-950'
                              : 'text-slate-500 hover:text-white/80'
                           }`}
                     >
                        {isActive && (
                           <motion.div
                              layoutId="activeTabBadge"
                              className="absolute inset-0 bg-primary rounded-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                           />
                        )}
                        <span className={`material-symbols-outlined text-[20px] relative z-10 ${isActive ? 'font-bold' : ''}`}>{tab.icon}</span>
                        <span className="text-xs font-black relative z-10 tracking-tight">{tab.label}</span>
                     </button>
                  );
               })}
            </div>
         </div>

         {/* 3. CONTENT AREA (SCROLLABLE) */}
         <div className="flex-1 overflow-y-auto px-4 pb-[80px] scrollbar-hide">
            <AnimatePresence mode="wait">
               {activeTab === 'friends' && (
                  <motion.div key="friends" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                     <div className="bg-[#f8fafc] p-6 rounded-lg border border-slate-200 flex flex-col items-center text-center noise-grain shadow-[4px_4px_0px_rgba(0,0,0,0.04)]">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 shadow-[2px_2px_0px_rgba(0,0,0,0.06)]">
                           <span className="material-symbols-outlined text-2xl text-primary font-bold">person_add</span>
                        </div>
                        <h4 className="text-lg font-black font-body text-slate-900 mb-1">هەڤالێن خوە داخواز بکە</h4>
                        <p className="text-slate-500 text-[11px] font-bold font-body mb-5 leading-relaxed max-w-[200px]">بۆ هەڤالێ خوە بهنێرە و پێکڤە یاریێ بکەن بۆ بدەستڤەهینانا خەلاتان</p>
                        <button onClick={() => { triggerHaptic(10); handleInvite(); }} className="w-full bg-primary text-black py-2.5 rounded-md font-black font-body text-sm shadow-md hover:brightness-110 active:scale-95 transition-all">
                           کۆپی کرنا لینکی
                        </button>
                     </div>
                  </motion.div>
               )}

               {activeTab === 'stats' && (
                  <motion.div key="stats" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                     <StatsView playerStats={playerStats} rank={userRank} userNickname={userNickname} userAvatar={userAvatar} level={level} currentXP={currentXP} onViewChange={onViewChange} />
                  </motion.div>
               )}

               {activeTab === 'profile' && (
                  <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                     {/* Nickname Section */}
                     <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-500 px-4 uppercase tracking-widest">ناڤێ تە</label>
                        <div className="relative group flex items-center gap-2">
                           <div className="relative flex-1">
                              <input ref={nicknameInputRef} type="text" value={draftNickname} onChange={(e) => setDraftNickname(e.target.value)} readOnly={isNicknameLocked} className={`w-full h-11 border rounded-md px-4 font-black font-rabar transition-all pr-10 text-right noise-grain shadow-sm ${isNicknameLocked ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-950 border-primary ring-2 ring-primary/20'}`} />
                              <button onClick={() => { triggerHaptic(10); setIsNicknameLocked(false); setTimeout(() => nicknameInputRef.current?.focus(), 50); }} className={`absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] ${isNicknameLocked ? 'text-slate-400 hover:text-primary' : 'text-primary'}`}>{isNicknameLocked ? 'edit' : 'edit_square'}</button>
                           </div>
                           {(draftNickname !== userNickname) && draftNickname.trim() && !saveSuccess && (
                              <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onClick={handleSave} className="h-11 px-4 bg-[#007AFF] text-white rounded-md font-bold text-sm shadow-md transition-all">پاراستن</motion.button>
                           )}
                        </div>
                        {/* Flag Selection */}
                        <div className="flex justify-start px-1 mt-2">
                           <div className="relative flex items-center gap-2">
                              <button ref={flagButtonRef} onClick={() => { triggerHaptic(10); setIsFlagBoxOpen(!isFlagBoxOpen); }} className={`flex items-center gap-1.5 px-3 py-0.5 rounded-md border transition-all ${isFlagBoxOpen ? 'bg-primary border-primary shadow-md' : 'bg-white border-slate-200/80 shadow-xs hover:bg-slate-50'}`}>
                                 <FlagBadge countryCode={draftCountryCode} isInKurdistan={draftIsInKurdistan} size="xs" />
                                 <span className="text-[10px] font-black font-rabar tracking-wide text-slate-600">{selectedCountryName}</span>
                                 <span className={`material-symbols-outlined text-[16px] transition-transform ${isFlagBoxOpen ? 'rotate-180 text-slate-950' : 'text-slate-400'}`}>expand_more</span>
                              </button>
                              {(draftCountryCode !== countryCode || draftIsInKurdistan !== isInKurdistan) && !saveSuccess && (
                                 <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={handleSave} className="w-8 h-8 bg-[#007AFF] text-white rounded-lg flex items-center justify-center shadow-sm">
                                    <span className="material-symbols-outlined text-lg">check</span>
                                 </motion.button>
                              )}
                              {isFlagBoxOpen && createPortal(
                                 <AnimatePresence mode="wait">
                                    <motion.div ref={flagDropdownRef} initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} style={{ position: 'absolute', top: dropdownCoords.top + 6, left: dropdownCoords.left, width: dropdownCoords.width }} className="bg-slate-50 rounded-xl shadow-xl border border-slate-200 z-9999 overflow-hidden noise-grain">
                                       <div className="p-1.5 max-h-55 overflow-y-auto no-scrollbar">
                                          <button onClick={() => { triggerHaptic(10); setDraftIsInKurdistan(true); setIsFlagBoxOpen(false); }} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-white w-full">
                                             <FlagBadge isInKurdistan={true} size="xs" />
                                             <span className="flex-1 text-left text-[11px] font-bold font-rabar text-slate-700">کوردستان</span>
                                             {draftIsInKurdistan && <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>}
                                          </button>
                                          {COUNTRIES.map((country) => (
                                             <button key={country.code} onClick={() => { triggerHaptic(10); setDraftIsInKurdistan(false); setDraftCountryCode(country.code); setIsFlagBoxOpen(false); }} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-white w-full">
                                                <FlagBadge countryCode={country.code} size="xs" />
                                                <span className="flex-1 text-left text-[11px] font-bold font-rabar text-slate-700">{country.name}</span>
                                                {!draftIsInKurdistan && draftCountryCode === country.code && <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>}
                                             </button>
                                          ))}
                                       </div>
                                    </motion.div>
                                 </AnimatePresence>, document.body
                              )}
                           </div>
                        </div>
                     </div>
                     {/* Avatar Selection */}
                     <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-500 px-4 uppercase tracking-widest">هەلبژارتنا ئاڤاتاری</label>
                        <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 noise-grain">
                           <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-3 max-h-55 overflow-y-auto pr-1 scrollbar-hide py-2 justify-items-center">
                              {AVATARS.map((avatar) => (
                                 <button key={avatar.id} onClick={() => { triggerHaptic(10); setDraftAvatar(avatar.id); }} className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all relative overflow-hidden ${draftAvatar === avatar.id ? 'bg-primary shadow-lg scale-110 z-10' : 'bg-white border border-slate-200'}`}><Avatar src={avatar.id} size="sm" border={false} />{draftAvatar === avatar.id && <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 text-white w-4 h-4 rounded-full flex items-center justify-center border-2 border-white z-20"><span className="material-symbols-outlined text-[10px] font-bold">check</span></div>}</button>
                              ))}
                           </div>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
   );
}
