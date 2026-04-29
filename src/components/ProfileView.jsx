import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AVATARS, DEFAULT_AVATAR } from '../data/avatars';
import { COUNTRIES } from '../data/countries';
import { supabase } from '../lib/supabase';
import FlagBadge from './FlagBadge';
import StatsView from './StatsView';
import { FilsIcon, DerhemIcon, DinarIcon } from './CurrencyIcon';
import { triggerHaptic } from '../utils/haptics';
import { toKuDigits } from '../utils/formatters';
import ExperienceBar from './ExperienceBar';
import Avatar from './Avatar';
import { useGame } from '../context/GameContext';
import { useAudio } from '../context/AudioContext';
import FloatingLetterBackground from './FloatingLetterBackground';
import { getLevelData } from '../utils/progression';
import { compressImage, getCroppedImg } from '../utils/imageUtils';
import Cropper from 'react-easy-crop';



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
   dinar,
   playerStats,
   userRank,
   onViewChange,
   maxXP,
   dailyStreak
}) {
   const { playTabSound, playSaveSound } = useAudio();
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
   const bgRef = useRef(null);
   const [isCropModalOpen, setIsCropModalOpen] = useState(false);
   const [imageToCrop, setImageToCrop] = useState(null);
   const [crop, setCrop] = useState({ x: 0, y: 0 });
   const [zoom, setZoom] = useState(1);
   const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
   const [croppedBlob, setCroppedBlob] = useState(null);

   const handleBackgroundClick = (e) => {
      // Pulse on background void clicks
      const isInteractiveElement = e.target.closest('button') || e.target.closest('input') || e.target.closest('.interactive-zone');
      if (!isInteractiveElement || e.target.classList.contains('bg-trigger-zone')) {
         const rect = e.currentTarget.getBoundingClientRect();
         const x = (e.clientX - rect.left) / rect.width;
         const y = (e.clientY - rect.top) / rect.height;
         bgRef.current?.pulse(x, y);
      }
   };

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

   if (!user || user === null) {
      return <div className="flex flex-col items-center justify-center h-40"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
   }

   const levelInfo = getLevelData(Number(currentXP) || 0);
   const safeLevel = levelInfo.level;
   const progressPercent = Math.round(levelInfo.progressPercent);
   const effectiveProgress = levelInfo.progressPercent / 100;

   const getLevelTier = (lvl) => {
      if (lvl < 10) return { stop1: '#cd7f32', stop2: '#f97316', shadow: 'rgba(249, 115, 22, 0.4)' };
      if (lvl < 25) return { stop1: '#cbd5e1', stop2: '#94a3b8', shadow: 'rgba(148, 163, 184, 0.4)' };
      if (lvl < 45) return { stop1: '#fbbf24', stop2: '#d97706', shadow: 'rgba(245, 158, 11, 0.4)' };
      if (lvl < 70) return { stop1: '#22d3ee', stop2: '#0891b2', shadow: 'rgba(6, 182, 212, 0.4)' };
      if (lvl < 90) return { stop1: '#a855f7', stop2: '#7c3aed', shadow: 'rgba(139, 92, 246, 0.4)' };
      return { stop1: '#ef4444', stop2: '#b91c1c', shadow: 'rgba(239, 68, 68, 0.4)' };
   };

   const tier = getLevelTier(level);

   const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
         setImageToCrop(reader.result);
         setIsCropModalOpen(true);
         setZoom(1);
         setCrop({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
   };

   const onCropComplete = (croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
   };

   const handleConfirmCrop = async () => {
      if (!imageToCrop || !croppedAreaPixels) return;
      try {
         setIsUploading(true);
         const blob = await getCroppedImg(imageToCrop, croppedAreaPixels);
         
         // Generate unique filename
         const fileName = `${user?.id || 'guest'}-${Date.now()}.jpg`;

         // Upload directly to Supabase Storage
         const { data, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, blob, { 
               contentType: 'image/jpeg',
               upsert: true 
            });

         if (uploadError) throw uploadError;

         // Get the public URL
         const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

         // Close modal and show feedback immediately (Optimistic UI)
         setIsCropModalOpen(false);
         setDraftAvatar(publicUrl);
         setSaveSuccess(true);
         playSaveSound();
         triggerHaptic([20, 10, 20]);

         // Update the profile in the background (don't await)
         onProfileSave({ 
            nickname: draftNickname, 
            avatar_url: publicUrl, 
            countryCode: draftCountryCode, 
            isInKurdistan: draftIsInKurdistan 
         }).then(() => {
            console.log("[ProfileView] Profile synced in background");
         }).catch(err => {
            console.error("[ProfileView] Background sync failed:", err);
         });
         
         // Cleanup
         setCroppedBlob(null);
         if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
         setLocalPreviewUrl(null);
         setTimeout(() => setSaveSuccess(false), 2000);

      } catch (err) {
         console.error("Crop/Save failed:", err);
         alert(`خەلەتی د سەیڤکرنێ دا: ${err.message}`);
      } finally {
         setIsUploading(false);
      }
   };

   const handleInvite = () => {
      const shareLink = `${window.location.origin}/play?invite=${user?.id || 'guest'}`;
      navigator.clipboard.writeText(shareLink);
      alert('لینک ھاتە کۆپیکرن! بۆ ھەڤالێن خۆ بفرێژە.');
   };

   const handleSave = async () => {
      try {
         setIsUploading(true);
         playSaveSound();
         triggerHaptic([20, 10, 20]);
         let finalAvatar = draftAvatar;

         // Use cropped blob if available
         const uploadSource = croppedBlob;

         if (uploadSource) {
            try {
               const fileName = `${user?.id || 'guest'}-${Date.now()}.jpg`;

               const { data, error: uploadError } = await supabase.storage
                  .from('avatars')
                  .upload(fileName, uploadSource, { contentType: 'image/jpeg' });

               if (!uploadError) {
                  const { data: { publicUrl } } = supabase.storage
                     .from('avatars')
                     .getPublicUrl(fileName);
                  finalAvatar = publicUrl;
               } else {
                  console.error("Upload error details:", uploadError);
               }
            } catch (upErr) {
               console.error("Upload process crashed:", upErr);
            }
         } else if (pendingFile) {
             // Fallback for direct avatar selection if any
             try {
                const fileExt = pendingFile.name.split('.').pop();
                const fileName = `${user?.id || 'guest'}-${Date.now()}.${fileExt}`;
 
                const { data, error: uploadError } = await supabase.storage
                   .from('avatars')
                   .upload(fileName, pendingFile);
 
                if (!uploadError) {
                   const { data: { publicUrl } } = supabase.storage
                      .from('avatars')
                      .getPublicUrl(fileName);
                   finalAvatar = publicUrl;
                }
             } catch (err) {}
         }

         await onProfileSave({ nickname: draftNickname, avatar_url: finalAvatar, countryCode: draftCountryCode, isInKurdistan: draftIsInKurdistan });
         setSaveSuccess(true);
         setIsNicknameLocked(true);
         setPendingFile(null);
         setCroppedBlob(null);
         if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
         setLocalPreviewUrl(null);
         setTimeout(() => setSaveSuccess(false), 2000);
      } catch (err) { alert(`خەلەتی: ${err.message}`); } finally { setIsUploading(false); }
   };

   const selectedCountryName = draftIsInKurdistan ? 'کوردستان' : (COUNTRIES.find(c => c.code === draftCountryCode)?.name || 'جیھان');

   return (
      <div 
         onClick={handleBackgroundClick}
         className="w-screen max-w-full mx-auto h-full flex flex-col pt-0 pb-0 overflow-x-hidden relative z-10 bg-[#020617] bg-trigger-zone"
      >
         <div className="absolute inset-0 pointer-events-none z-0">
            <FloatingLetterBackground ref={bgRef} />
         </div>

         <div className="px-5 mb-4 text-center flex flex-col items-center relative z-10 bg-trigger-zone">
            <div className="relative w-full aspect-square max-w-[300px] rounded-[50px] overflow-hidden border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] bg-slate-950 group">

               <div className="absolute inset-0 bg-linear-to-b from-[#1a1c2c] via-[#0a0b14] to-black opacity-100"></div>

               <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/20 z-50 overflow-hidden">
                     <motion.div
                        key="liquid-xp-bar"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: progressPercent / 100 }}
                        transition={{ duration: 2, ease: "circOut" }}
                        className="absolute bottom-0 left-0 w-full rounded-t-full shadow-[0_0_10px_rgba(255,255,255,0.4)] origin-bottom"
                     style={{
                        background: `linear-gradient(to top, ${tier.stop2}, ${tier.stop1}, #fff)`
                     }}
                  >
                     <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(2)].map((_, i) => (
                           <motion.div
                              key={i}
                              className="absolute bottom-0 w-1 h-1 bg-white/40 rounded-full blur-[1px]"
                              animate={{ y: [-10, -100], opacity: [0, 1, 0] }}
                              transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: i * 0.5 }}
                           />
                        ))}
                     </div>
                  </motion.div>
               </div>

               <svg
                  className="absolute inset-0 w-full h-full pointer-events-none z-50 transform -rotate-90"
                  viewBox="0 0 300 300"
                  preserveAspectRatio="none"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
               >
                  <defs>
                     <linearGradient id="barGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={tier.stop1} />
                        <stop offset="100%" stopColor={tier.stop2} />
                     </linearGradient>
                  </defs>
                  <rect
                     x="3" y="3"
                     width="294" height="294"
                     rx="47"
                     stroke="white"
                     strokeWidth="4"
                     strokeOpacity="0.03"
                  />
                  <motion.rect
                     x="3" y="3"
                     width="294" height="294"
                     rx="47"
                     stroke={tier.stop1}
                     strokeWidth="10"
                     strokeLinecap="round"
                     initial={{ pathLength: 0 }}
                     animate={{ pathLength: effectiveProgress }}
                     transition={{ duration: 2, ease: "circOut" }}
                     className="opacity-20 blur-[8px]"
                  />
                  <motion.rect
                     x="3" y="3"
                     width="294" height="294"
                     rx="47"
                     stroke="url(#barGradient)"
                     strokeWidth="6"
                     strokeLinecap="round"
                     initial={{ pathLength: 0 }}
                     animate={{ pathLength: effectiveProgress }}
                     transition={{ duration: 2, ease: "circOut" }}
                  />
               </svg>

               <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] mix-blend-overlay"></div>

               <div className="absolute top-0 left-0 right-0 h-16 z-50 px-6 flex justify-between items-center" dir="ltr">
                  <div className="relative flex flex-col items-center pt-5 w-14 group/streak">
                     <AnimatePresence mode="popLayout">
                        {(draftAvatar !== userAvatar || pendingFile || draftNickname !== userNickname || draftCountryCode !== countryCode) && !saveSuccess ? (
                           <motion.button
                              key="save-btn"
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 90 }}
                              onClick={(e) => { e.stopPropagation(); handleSave(); }}
                              disabled={isUploading}
                              className="w-14 h-14 bg-primary text-slate-950 rounded-[20px] shadow-[0_15px_35px_rgba(var(--primary-rgb),0.5)] flex flex-col items-center justify-center border-t-2 border-white/40 hover:scale-110 active:scale-95 transition-all absolute -top-1"
                           >
                              {isUploading ? (
                                 <div className="w-6 h-6 border-3 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div>
                              ) : (
                                 <>
                                    <span className="material-symbols-outlined text-[26px] font-black leading-none">save</span>
                                    <span className="text-[7px] font-black uppercase tracking-tighter -mt-0.5">پاراستن</span>
                                 </>
                              )}
                           </motion.button>
                        ) : (
                           <motion.div
                              key="streak-badge"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="flex flex-col items-center justify-center relative w-14 h-15"
                           >
                              <div className="relative text-xl leading-none drop-shadow-[0_4px_12px_rgba(249,115,22,0.8)] hover:scale-110 transition-transform cursor-pointer">
                                 🔥
                                 <div className="absolute inset-x-0 bottom-0 top-1/4 bg-orange-500/30 blur-xl rounded-full z-[-1] animate-pulse"></div>
                              </div>
                              <div className="flex flex-col items-center z-10 w-full mt-1">
                                 <span className="text-[8px] font-black text-orange-400 uppercase leading-none mb-0.5 opacity-80 tracking-normal">ستریك</span>
                                 <span className="text-lg font-black text-white leading-none drop-shadow-md">{toKuDigits(dailyStreak || 0)}</span>
                              </div>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>


               </div>

               <div className="absolute top-1 left-0 right-0 flex flex-col items-center z-20">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                     <div
                        className="relative z-10 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300"
                        onClick={() => { triggerHaptic(10); fileInputRef.current?.click(); }}
                     >
                        <div className="relative">
                           <Avatar src={draftAvatar} size="xl" className="w-32 h-32 rounded-full border-4 border-slate-950 shadow-2xl z-20" updatedAt={user?.updated_at} />
                           <div className="absolute bottom-0 right-0 w-10 h-10 bg-white text-slate-950 rounded-full shadow-lg border-2 border-slate-950 flex items-center justify-center z-30">
                              <span className="material-symbols-outlined text-[18px] font-black">photo_camera</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="absolute bottom-4 left-4 right-4 z-40 text-right" dir="rtl">
                  <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[40px] border border-white/5 p-3.5 shadow-2xl relative overflow-hidden">


                     <div className="flex flex-col items-center mb-2.5">
                        <h3 className="text-2xl font-black font-rabar text-white text-center leading-tight tracking-normal">{draftNickname || 'یاریکەر'}</h3>
                     </div>
                     <div className="grid grid-cols-3 gap-2 px-1" dir="ltr" style={{ color: level < 10 ? '#fff' : level < 25 ? '#1e293b' : level < 45 ? '#451a03' : '#000' }}>
                        <div
                           className="flex flex-col items-center justify-center py-1.5 px-1 rounded-md border border-white/10 transition-colors duration-500"
                           style={{ backgroundColor: tier.stop1 + '20', borderColor: tier.stop1 + '30' }}
                        >
                           <span className="text-[8px] font-black uppercase mb-0.5 opacity-60" style={{ color: tier.stop1 }}>XP</span>
                           <span className="text-base font-black leading-none tracking-normal text-white">{toKuDigits(currentXP)}</span>
                        </div>

                        <div
                           className="flex flex-col items-center justify-center py-1.5 px-1 rounded-md shadow-lg border-2 z-10 transition-all duration-500 scale-105"
                           style={{
                              backgroundColor: tier.stop1,
                              borderColor: 'rgba(255,255,255,0.2)',
                              boxShadow: `0 8px 16px -4px ${tier.shadow}`
                           }}
                        >
                           <span className="text-[8px] font-black uppercase mb-0.5" style={{ color: level < 25 ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)' }}>ڕێژە</span>
                           <span className="text-lg font-black leading-none">{toKuDigits(Math.round(effectiveProgress * 100))}</span>
                        </div>

                        <div
                           className="flex flex-col items-center justify-center py-1.5 px-1 rounded-md border border-white/10 relative overflow-hidden group transition-colors duration-500"
                           style={{ backgroundColor: tier.stop1 + '20', borderColor: tier.stop1 + '30' }}
                        >
                           {userRank === 1 && (
                              <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                           )}
                           <span className="text-[8px] font-black uppercase mb-0.5 opacity-60" style={{ color: tier.stop1 }}>ڕێزبەندی</span>
                           <span className={`text-base font-black leading-none tracking-normal text-white`}>
                              #{toKuDigits(userRank || 1)}
                           </span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="mx-6 mb-4">
            <div className="flex p-1 rounded-md border shadow-sm relative overflow-hidden transition-all"
               style={{ backgroundColor: 'rgb(203, 213, 225)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
               {[
                  { id: 'profile', label: 'بەرپەڕ', icon: 'person' },
                  { id: 'stats', label: 'ئامار', icon: 'leaderboard' },
                  { id: 'friends', label: 'ھەڤال', icon: 'group' }
               ].map(tab => {
                  const isActive = activeTab === tab.id;
                  return (
                     <button
                        key={tab.id}
                        onClick={() => { 
                           triggerHaptic(10); 
                           playTabSound();
                           setActiveTab(tab.id); 
                        }}
                        className={`flex-1 relative py-2.5 rounded-md flex items-center justify-center gap-2 transition-all duration-300 z-10 ${isActive
                           ? 'text-white'
                           : 'text-slate-500 hover:text-slate-700'
                           }`}
                     >
                        {isActive && (
                           <motion.div
                              layoutId="activeTabBadge"
                              className="absolute inset-0 bg-slate-800 rounded-md shadow-sm"
                              transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                           />
                        )}
                        <span className={`material-symbols-outlined text-[20px] relative z-10 ${isActive ? 'font-bold' : ''}`}>{tab.icon}</span>
                        <span className="text-xs font-black relative z-10 tracking-normal">{tab.label}</span>
                     </button>
                  );
               })}
            </div>
         </div>

         <div className="flex-1 overflow-y-auto px-4 pb-[max(env(safe-area-inset-bottom),80px)] scrollbar-hide relative z-10 bg-trigger-zone">
            <AnimatePresence mode="wait">
               {activeTab === 'friends' && (
                  <motion.div key="friends" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4 w-full">
                     <div className="bg-[#f8fafc] p-6 rounded-lg border border-slate-200 flex flex-col items-center text-center noise-grain shadow-[4px_4px_0px_rgba(0,0,0,0.04)]">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 shadow-[2px_2px_0px_rgba(0,0,0,0.06)]">
                           <span className="material-symbols-outlined text-2xl text-primary font-bold">person_add</span>
                        </div>
                        <h4 className="text-lg font-black font-body text-slate-900 mb-1">ھەڤالێن خوە داخواز بکە</h4>
                        <p className="text-white/40 text-[11px] font-bold font-body mb-5 leading-relaxed max-w-[200px]">بۆ ھەڤالێ خوە بھنێرە و پێکڤە یاریێ بکەن بۆ بدەستڤەھینانا خەلاتان</p>
                        <button onClick={() => { triggerHaptic(10); handleInvite(); }} className="w-full bg-primary text-black py-2.5 rounded-md font-black font-body text-sm shadow-md hover:brightness-110 active:scale-95 transition-all">
                           کۆپی کرنا لینکی
                        </button>
                     </div>
                  </motion.div>
               )}

               {activeTab === 'stats' && (
                  <motion.div key="stats" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
                     <StatsView playerStats={playerStats} rank={userRank} userNickname={userNickname} userAvatar={userAvatar} level={level} currentXP={currentXP} onViewChange={onViewChange} />
                  </motion.div>
               )}

               {activeTab === 'profile' && (
                  <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 pt-2 w-full">
                     <div className="space-y-2 flex flex-col items-end">
                        <label className="text-[10px] font-bold text-white/60 px-2 uppercase tracking-normal text-right block w-full mt-1">ناسناڤێ تە</label>
                        <div className="flex items-center gap-2 w-full">
                           <div className="relative w-full">
                              <input
                                 ref={nicknameInputRef}
                                 type="text"
                                 value={draftNickname}
                                 onChange={(e) => setDraftNickname(e.target.value)}
                                 readOnly={isNicknameLocked}
                                 maxLength={20}
                                 className={`w-full h-10 border rounded-md px-4 font-bold font-rabar transition-all pr-10 text-right noise-grain shadow-sm text-[13px] ${isNicknameLocked ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-950 border-slate-200 ring-2 ring-primary/20'}`}
                              />
                              <button onClick={() => { triggerHaptic(10); setIsNicknameLocked(false); setTimeout(() => nicknameInputRef.current?.focus(), 50); }} className={`absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] ${isNicknameLocked ? 'text-slate-400 hover:text-primary' : 'text-primary'}`}>{isNicknameLocked ? 'edit' : 'edit_square'}</button>
                           </div>
                           {(draftNickname !== userNickname) && draftNickname.trim() && !saveSuccess && (
                              <motion.button
                                 initial={{ scale: 0.8, opacity: 0 }}
                                 animate={{ scale: 1, opacity: 1 }}
                                 onClick={handleSave}
                                 disabled={draftNickname.length < 8 || draftNickname.length > 15}
                                 className={`h-10 px-3 rounded-md font-black text-[10px] shadow-md whitespace-nowrap transition-all ${draftNickname.length < 8 || draftNickname.length > 15 ? 'bg-slate-300 text-slate-500 opacity-50 cursor-not-allowed' : 'bg-primary text-black'}`}
                              >
                                 پاراستن
                              </motion.button>
                           )}
                        </div>
                        {!isNicknameLocked && (
                           <div className="w-full text-right px-1 mt-1">
                              <AnimatePresence>
                                 {draftNickname.length > 0 && draftNickname.length < 8 && (
                                                                         <motion.p initial={{ opacity: 0, scaleY: 0, transformOrigin: 'top' }} animate={{ opacity: 1, scaleY: 1 }} exit={{ opacity: 0, scaleY: 0 }} className="text-red-500 text-[10px] font-black">نابیت ناسناڤێ تە ژ ٨ پیتان کێمتر بیت</motion.p>
                                 )}

                                 {draftNickname.length > 15 && (
                                                                         <motion.p initial={{ opacity: 0, scaleY: 0, transformOrigin: 'top' }} animate={{ opacity: 1, scaleY: 1 }} exit={{ opacity: 0, scaleY: 0 }} className="text-red-500 text-[10px] font-black">نابیت ناڤێ تە ژ ١٥ پیتان زێدەتر بیت</motion.p>
                                 )}

                              </AnimatePresence>
                           </div>
                        )}
                     </div>

                     <div className="space-y-2 flex flex-col items-end">
                        <label className="text-[10px] font-bold text-white/60 px-2 uppercase tracking-normal text-right block w-full mt-1">ئیمەیڵێ تە (Gmail)</label>
                        <div className="w-full h-11 bg-slate-100 border border-slate-200 rounded-md px-4 flex items-center justify-end font-bold text-slate-500 text-[13px] noise-grain shadow-sm overflow-hidden mb-1">
                           <span className="truncate">{user?.email || 'جیمایڵ نەتایبەتە'}</span>
                           <span className="material-symbols-outlined text-[18px] mr-2 text-slate-400">mail</span>
                        </div>
                     </div>

                     <div className="space-y-2 flex flex-col items-end">
                        <label className="text-[10px] font-bold text-white/60 px-1 uppercase tracking-normal text-right block w-full">وەڵات</label>
                        <div className="flex items-center gap-2 w-full">
                           <div className="relative w-full">
                              <button ref={flagButtonRef} onClick={() => { triggerHaptic(10); setIsFlagBoxOpen(!isFlagBoxOpen); }} className={`flex items-center px-3 h-10 rounded-md border transition-all w-full justify-between flex-row-reverse ${isFlagBoxOpen ? 'bg-primary border-primary shadow-md' : 'bg-white border-slate-200/80 shadow-xs hover:bg-slate-50'}`}>
                                 <span className={`material-symbols-outlined text-[16px] transition-transform ${isFlagBoxOpen ? 'rotate-180 text-slate-950' : 'text-slate-400'}`}>expand_more</span>
                                 <div className="flex items-center gap-2">
                                    <FlagBadge countryCode={draftCountryCode} isInKurdistan={draftIsInKurdistan} size="xs" />
                                    <span className="text-[11px] font-black font-rabar tracking-normal text-slate-600">{selectedCountryName}</span>
                                 </div>
                              </button>
                           </div>
                           {(draftCountryCode !== countryCode || draftIsInKurdistan !== isInKurdistan) && !saveSuccess && (
                              <motion.button initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={handleSave} className="h-10 px-3 bg-primary text-black rounded-md font-black text-[10px] shadow-md whitespace-nowrap">پاراستن</motion.button>
                           )}
                        </div>

                        {isFlagBoxOpen && createPortal(
                           <AnimatePresence mode="wait">
                              <motion.div ref={flagDropdownRef} initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} style={{ position: 'absolute', top: dropdownCoords.top + 6, left: dropdownCoords.left, width: dropdownCoords.width }} className="bg-slate-50 rounded-xl shadow-xl border border-slate-200 z-[9999] overflow-hidden noise-grain">
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
                           </AnimatePresence>,
                           document.body
                        )}
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-bold text-white/60 px-4 uppercase tracking-normal text-right block w-full">ھەلبژارتنا ئاڤاتاری</label>
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
         {isCropModalOpen && createPortal(
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-hidden" dir="rtl">
               <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  className="bg-[#0a0b14] rounded-[40px] w-full max-w-sm overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] relative border border-white/10"
               >
                  {/* Header */}
                  <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                     <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                           <span className="material-symbols-outlined text-primary text-xl font-bold">crop</span>
                        </div>
                        <h3 className="text-white font-black font-rabar text-[15px] tracking-wide">کڕۆپکرنا وێنەی</h3>
                     </div>
                     <button 
                        onClick={() => setIsCropModalOpen(false)} 
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
                     >
                        <span className="material-symbols-outlined text-xl">close</span>
                     </button>
                  </div>

                  {/* Cropper Container */}
                  <div className="relative aspect-square w-full bg-black overflow-hidden cursor-move touch-none">
                     <Cropper
                        image={imageToCrop}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        showGrid={false}
                        cropShape="round"
                        restrictPosition={true}
                        style={{
                           containerStyle: { background: '#000', padding: 0 },
                           cropAreaStyle: { 
                              width: '100%', 
                              height: '100%',
                              border: '1px solid rgba(255,255,255,0.5)',
                              boxShadow: '0 0 0 9999px rgba(0,0,0,0.85)'
                           }
                        }}
                     />
                  </div>

                  {/* Controls */}
                  <div className="p-8 space-y-6 relative z-10 bg-linear-to-b from-transparent to-black/60">
                     <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                           <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">زۆمکرنا وێنەی (Zoom)</span>
                           <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[12px] font-black tabular-nums border border-primary/30">
                              {zoom.toFixed(1)}x
                           </span>
                        </div>
                        
                        <div className="relative flex items-center h-8 group">
                           <input 
                              type="range" 
                              min={1} 
                              max={3} 
                              step={0.01} 
                              value={zoom} 
                              onChange={(e) => setZoom(parseFloat(e.target.value))} 
                              className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer outline-none
                                 [&::-webkit-slider-thumb]:appearance-none 
                                 [&::-webkit-slider-thumb]:w-6 
                                 [&::-webkit-slider-thumb]:h-6 
                                 [&::-webkit-slider-thumb]:rounded-full 
                                 [&::-webkit-slider-thumb]:bg-primary 
                                 [&::-webkit-slider-thumb]:border-2 
                                 [&::-webkit-slider-thumb]:border-white 
                                 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]
                                 [&::-webkit-slider-thumb]:transition-all
                                 [&::-webkit-slider-thumb]:hover:scale-110
                                 [&::-moz-range-thumb]:w-6 
                                 [&::-moz-range-thumb]:h-6 
                                 [&::-moz-range-thumb]:rounded-full 
                                 [&::-moz-range-thumb]:bg-primary 
                                 [&::-moz-range-thumb]:border-2 
                                 [&::-moz-range-thumb]:border-white 
                                 [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]" 
                           />
                        </div>
                     </div>

                     <div className="flex flex-col gap-3 pt-2">
                        <button 
                           onClick={handleConfirmCrop} 
                           className="w-full h-14 rounded-2xl bg-primary text-slate-950 font-black text-sm shadow-[0_12px_30px_-5px_rgba(var(--primary-rgb),0.6)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border-t-2 border-white/40"
                        >
                           <span className="material-symbols-outlined text-2xl">check_circle</span>
                           پاراستن
                        </button>
                        <button 
                           onClick={() => {
                              setIsCropModalOpen(false);
                              setImageToCrop(null);
                           }} 
                           className="w-full h-12 rounded-2xl text-white/40 font-bold text-xs hover:text-white hover:bg-white/5 transition-all active:scale-95"
                        >
                           پەشیمانبوون و گۆهۆڕین
                        </button>
                     </div>
                  </div>
               </motion.div>
            </div>,
            document.body
         )}
      </div>
   );
}
