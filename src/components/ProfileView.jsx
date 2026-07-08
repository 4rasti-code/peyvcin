import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { AVATARS, DEFAULT_AVATAR } from '../data/avatars';
import { COUNTRIES } from '../data/countries';
import { supabase } from '../lib/supabase';
import FlagBadge from './FlagBadge';
import { FilsIcon, DerhemIcon, DinarIcon } from './CurrencyIcon';
import { triggerHaptic } from '../utils/haptics';
import { toKuDigits } from '../utils/formatters';
import ExperienceBar from './ExperienceBar';
import Avatar from './Avatar';
import { useUser } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { useAudio } from '../context/AudioContext';

import { getLevelFromXP, getLevelTier } from '../utils/progression';
import { getCroppedImg } from '../utils/imageUtils';
import Cropper from 'react-easy-crop';
import { MEDALS } from '../constants/medals';
import FriendsList from './FriendsList';

export default function ProfileView({ onProfileSave, onOpenSettings, onViewChange, onOpenChat, pendingFriendsCount, initialFriendsModalOpen, onFriendsModalConsumed }) {
   const {
      user, userNickname, userAvatar, profileData
   } = useUser();

   const {
      currentXP, level, dailyStreak, lastStreakAt,
      userRank, progressPercent, solvedWords, hasUnclaimedMedals
      // updateInventory, addXP
   } = useGame();

   const audioContext = useAudio();
   const { playSaveSound, playTabSound /* , playVictorySound */ } = audioContext;
   const [draftAvatar, setDraftAvatar] = useState(userAvatar);

   const [saveSuccess, setSaveSuccess] = useState(false);
   const [isUploading, setIsUploading] = useState(false);
   const fileInputRef = useRef(null);

   const today = new Date();
   today.setHours(0, 0, 0, 0);
   let isStreakAtRisk = false;
   if (lastStreakAt) {
      const streakDate = new Date(lastStreakAt);
      streakDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - streakDate) / (1000 * 60 * 60 * 24));
      if (diffDays >= 1) isStreakAtRisk = true;
   }

   const [pendingFile, setPendingFile] = useState(null);
   const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
   const bgRef = useRef(null);
   const [isCropModalOpen, setIsCropModalOpen] = useState(false);
   const [imageToCrop, setImageToCrop] = useState(null);
   const [crop, setCrop] = useState({ x: 0, y: 0 });
   const [zoom, setZoom] = useState(1);
   const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
   const [croppedBlob, setCroppedBlob] = useState(null);

   const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);

   useEffect(() => {
      if (initialFriendsModalOpen) {
         setIsFriendsModalOpen(true);
         if (onFriendsModalConsumed) onFriendsModalConsumed();
      }
   }, [initialFriendsModalOpen, onFriendsModalConsumed]);

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
      setDraftAvatar(userAvatar);
   }, [userAvatar]);

   if (!user || user === null) {
      return <div className="flex flex-col items-center justify-center h-40"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
   }

   const safeLevel = getLevelFromXP(currentXP || 0);
   const effectiveProgress = (progressPercent || 0) / 100;

   // Country and Nickname are handled in SettingsModal

   const tier = getLevelTier(safeLevel);

   const displayData = { ...(profileData || {}), ...(profileData?.statistics || {}), level: safeLevel };
   const medals = MEDALS;
   const bestMedal = [...medals].reverse().find(m => m.condition(displayData)) || medals[0];
   const isBestUnlocked = bestMedal.condition(displayData);

   const isLoading = !user || userNickname === 'یاریزان';

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
         const { error: uploadError } = await supabase.storage
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
            avatar_url: publicUrl
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
         alert(err.message || 'شاشیەک ڕوویدا د سەیڤکرنا وێنەی دا');
      } finally {
         setIsUploading(false);
      }
   };



   const handleSave = async () => {
      try {
         setIsUploading(true);
         playSaveSound();
         triggerHaptic([20, 10, 20]);
         let finalAvatar = draftAvatar;

         // Use cropped blob if available
         const uploadSource = croppedBlob;

         if (uploadSource || pendingFile) {
            try {
               const fileExt = pendingFile ? pendingFile.name.split('.').pop() : 'jpg';
               const fileName = `${user?.id || 'guest'}-${Date.now()}.${fileExt}`;
               const uploadData = uploadSource || pendingFile;

               const { error: uploadError } = await supabase.storage
                  .from('avatars')
                  .upload(fileName, uploadData, { contentType: uploadSource ? 'image/jpeg' : undefined });

               if (!uploadError) {
                  const { data: { publicUrl } } = supabase.storage
                     .from('avatars')
                     .getPublicUrl(fileName);
                  finalAvatar = publicUrl;
               } else {
                  console.error("Upload error details:", uploadError);
                  alert("نەتوانرا وێنە باربکرێت! ڕەنگە سەتڵا (avatars) ل Supabase نەیێ دروستکری یان ڕێگەپێدان نینە.");
                  setIsUploading(false);
                  return; // Stop saving!
               }
            } catch (upErr) {
               console.error("Upload process crashed:", upErr);
               alert("هەڵەیەک ڕوویدا لە بارکردنی وێنەکە");
               setIsUploading(false);
               return; // Stop saving!
            }
         }

         await onProfileSave({ avatar_url: finalAvatar });
         setSaveSuccess(true);
         setPendingFile(null);
         setCroppedBlob(null);
         setLocalPreviewUrl(null);
         setTimeout(() => setSaveSuccess(false), 2000);
      } catch (err) {
         alert(err.message || 'شاشیەک ڕوویدا');
      } finally {
         setIsUploading(false);
      }
   };


   return (
      <div
         onClick={handleBackgroundClick}
         className="w-screen max-w-full mx-auto h-full flex flex-col pt-0 pb-0 overflow-x-hidden relative z-10 bg-mono-white dark:bg-black bg-trigger-zone transition-colors duration-500"
      >
         <div className="absolute inset-0 pointer-events-none z-0">

         </div>

         <div className="mb-4 text-center flex flex-col items-center relative z-10 bg-trigger-zone w-full">
            <div className="relative w-full aspect-[1.15/1] sm:aspect-2/1 sm:max-h-[380px] overflow-hidden border-b border-mono-200 dark:border-mono-800 bg-mono-white dark:bg-black group transition-colors duration-300">

               {/* 1. Texture Layer */}
               <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08] bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] pointer-events-none"></div>


               {/* 3. Top Header: Save & Badges */}
               <div className="absolute top-0 left-0 right-0 h-[62%] sm:h-[65%] z-60 px-6 pt-12 sm:pt-6 flex justify-between items-start pointer-events-none" dir="ltr">
                  {/* Left: Settings Icon */}
                  <div className="relative pointer-events-auto mt-[-6px]">
                     <Motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        onClick={(e) => { e.stopPropagation(); triggerHaptic(10); onOpenSettings?.(); }}
                        className="w-12 h-12 flex items-center justify-center text-mono-600 dark:text-mono-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all -ml-2"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '36px', height: '36px' }}>
                           <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
                        </svg>
                     </Motion.button>
                  </div>

                  {/* Right: Level Shield (Restored Original Style) */}
                  <div className="relative w-20 flex flex-col items-end pointer-events-auto">
                     <div className="relative flex flex-col items-center justify-center">
                        <svg width="48" height="55" viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M50 0L95 20V55C95 80 50 115 50 115C50 115 5 80 5 55V20L50 0Z" fill="url(#levelMedalGradient)" stroke="white" strokeWidth="4" strokeOpacity="0.3" />
                           <defs>
                              <linearGradient id="levelMedalGradient" x1="50" y1="0" x2="50" y2="115" gradientUnits="userSpaceOnUse">
                                 <stop stopColor={tier.stop1} />
                                 <stop offset="1" stopColor={tier.stop2} />
                              </linearGradient>
                           </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1" dir="rtl">
                           <span className="text-[9px] font-black text-slate-900 uppercase leading-none mb-0.5">ئاست</span>
                           <span className="text-[14px] font-black text-slate-950 leading-none tabular-nums">{toKuDigits(safeLevel || level || 1)}</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* 4. Central Avatar Section - Maximum Top Position with Progress Ring */}
               <div className="absolute top-0 left-0 right-0 h-[62%] sm:h-[65%] flex items-center justify-center z-30 pointer-events-none">
                  <Motion.div
                     className="relative pointer-events-auto cursor-pointer group/avatar p-2 mt-8 sm:mt-4"
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={() => { triggerHaptic(10); fileInputRef.current?.click(); }}
                  >
                     {/* LOOT GLOW / MAGIC BURST (LEGENDARY ONLY) */}
                     {tier.isLegendary && (
                        <div className="absolute inset-0 flex items-center justify-center">
                           <Motion.div
                              animate={{
                                 rotate: [0, 360]
                              }}
                              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                              className="absolute w-44 h-44 bg-radial from-cyan-400/10 via-purple-500/5 to-transparent blur-2xl opacity-40"
                           />

                           {/* DIAMOND SHARDS PARTICLES - Emitting from edges */}
                           {[...Array(8)].map((_, i) => {
                              const angle = (i * 45) * (Math.PI / 180);
                              const radius = 46; // Emerges from the ring edge
                              const startX = Math.cos(angle) * radius;
                              const startY = Math.sin(angle) * radius;

                              return (
                                 <Motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0, x: startX, y: startY }}
                                    animate={{
                                       opacity: [0, 0.8, 0],
                                       scale: [0.5, 1, 0.2],
                                       x: startX + (Math.cos(angle) * 30),
                                       y: startY + (Math.sin(angle) * 30),
                                       rotate: [0, 180]
                                    }}
                                    transition={{
                                       duration: 3 + Math.random() * 2,
                                       repeat: Infinity,
                                       delay: i * 0.5,
                                       ease: "easeOut"
                                    }}
                                    style={{
                                       clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                                    }}
                                    className="absolute w-2 h-3 bg-cyan-100/60 shadow-[0_0_10px_rgba(180,251,255,0.8)] backdrop-blur-sm z-50"
                                 />
                              );
                           })}
                        </div>
                     )}

                     {/* Perimeter Progress Ring - Enhanced Visibility */}
                     <div className="absolute inset-0 z-0">
                        <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 100 100">
                           {/* Inner Track (Subtle) */}
                           <circle cx="50" cy="50" r="38" fill="none" className="stroke-mono-200/20 dark:stroke-mono-800/40" strokeWidth="1" />
                           {/* Outer Track (Main) */}
                           <circle cx="50" cy="50" r="41" fill="none" className="stroke-mono-200/10 dark:stroke-mono-800/20" strokeWidth="1" />

                           {/* Progress Path (Thick & Vibrant) */}
                           <Motion.circle
                              cx="50"
                              cy="50"
                              r="41"
                              fill="none"
                              stroke="url(#avatarProgressGradient)"
                              strokeWidth="16"
                              strokeLinecap="butt"
                              strokeDasharray="257.61"
                              initial={{ strokeDashoffset: 257.61 }}
                              animate={{
                                 strokeDashoffset: 257.61 - (257.61 * (effectiveProgress || 0)),
                                 filter: tier.isLegendary ? "drop-shadow(0 0 10px #b4fbff)" : "none"
                              }}
                              transition={{
                                 strokeDashoffset: { duration: 1.5, ease: "circOut" }
                              }}
                           />
                           <defs>
                              <linearGradient id="avatarProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                 <stop offset="0%" stopColor={tier.stop1} />
                                 <stop offset="100%" stopColor={tier.stop2} />
                              </linearGradient>
                           </defs>
                        </svg>
                     </div>

                     <div className="relative p-0.5 bg-mono-white dark:bg-black rounded-full border-[0.5px] border-mono-200 dark:border-mono-800 z-10">
                        <Avatar src={draftAvatar} size="xl" className="w-32 h-32 rounded-full border border-mono-100 dark:border-mono-800 object-cover" updatedAt={user?.updated_at} />
                        <div
                           className="absolute bottom-0 right-0 w-9 h-9 text-slate-950 rounded-full border-2 border-white flex items-center justify-center z-50 transition-transform active:scale-90"
                           style={{ backgroundColor: tier.stop1 }}
                        >
                           <span className="material-symbols-outlined text-[20px] font-black leading-none">edit</span>
                        </div>
                     </div>
                  </Motion.div>
               </div>

               {/* 5. Bottom Info Dock */}
               <div className="absolute top-[62%] sm:top-[65%] bottom-0 left-0 right-0 z-40 bg-mono-50/95 dark:bg-mono-900/95 backdrop-blur-xl border-t border-mono-200 dark:border-mono-800 px-3 pb-[18px] sm:pb-3 pt-2 flex flex-col justify-end shadow-sm" dir="rtl">
                  <div className="flex flex-row items-center justify-between w-full mb-[14px] px-2" dir="ltr">
                     {/* Left: Medal Badge */}
                     <div
                        className="w-12 h-12 flex items-center justify-center shrink-0"
                     >
                        <bestMedal.IconComponent className={`w-10 h-10 drop-shadow-[0_3px_5px_rgba(0,0,0,0.6)] ${!isBestUnlocked ? 'brightness-90 contrast-125' : ''}`} disabled={!isBestUnlocked} isBadge={true} />
                     </div>

                     {/* Center: Name */}
                     <div className="flex-1 flex flex-col items-center px-2 min-w-0">
                        <h3
                           className="text-[22px] font-black font-rabar leading-tight truncate w-full text-center transition-all duration-500"
                           style={{ color: tier.stop1 }}
                        >
                           {userNickname || 'یاریکەر'}
                        </h3>
                     </div>

                     {/* Right: Streak / Save */}
                     <div className="w-12 h-12 flex items-center justify-center shrink-0">
                        <AnimatePresence mode="popLayout">
                           {(draftAvatar !== userAvatar || pendingFile) && !saveSuccess ? (
                              <Motion.button
                                 key="save-btn"
                                 initial={{ scale: 0, rotate: -90 }}
                                 animate={{ scale: 1, rotate: 0 }}
                                 exit={{ scale: 0, rotate: 90 }}
                                 onClick={(e) => { e.stopPropagation(); handleSave(); }}
                                 disabled={isUploading}
                                 className="w-12 h-12 bg-green-600 text-white rounded-md flex flex-col items-center justify-center border-b-2 border-white/40 hover:scale-110 active:scale-95 transition-all shadow-lg absolute"
                              >
                                 {isUploading ? (
                                    <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div>
                                 ) : (
                                    <>
                                       <span className="material-symbols-outlined text-[20px] font-black leading-none">save</span>
                                       <span className="text-[7px] font-black uppercase -mt-0.5">پاشەکەفت</span>
                                    </>
                                 )}
                              </Motion.button>
                           ) : (
                              <Motion.div
                                 key="streak-badge"
                                 initial={{ opacity: 0, scale: 0.8 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 className="flex flex-col items-center justify-center relative w-12 h-12 transition-transform cursor-pointer"
                              >
                                 <Motion.div
                                    className="relative text-xl leading-none"
                                    animate={{ 
                                       filter: [
                                          "drop-shadow(0 0 8px rgba(255, 159, 28, 0.4))",
                                          "drop-shadow(0 0 20px rgba(255, 159, 28, 0.8))",
                                          "drop-shadow(0 0 8px rgba(255, 159, 28, 0.4))"
                                       ]
                                    }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                                 >
                                    {isStreakAtRisk ? '⏳' : '🔥'}
                                    <Motion.div
                                       className="absolute inset-x-0 bottom-0 top-1/4 bg-orange-500/30 rounded-full blur-lg z-[-1]"
                                       animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                                       transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                                    />
                                 </Motion.div>
                                 <div className="flex flex-col items-center z-10 w-full mt-0.5">
                                    <span className="text-[7px] font-black text-orange-400 uppercase leading-none mb-0.5 opacity-80">ستریك</span>
                                    <div className="flex items-baseline gap-0.5">
                                       <span className="text-sm font-black text-mono-900 dark:text-mono-100 leading-none tabular-nums">{toKuDigits(dailyStreak || 0)}</span>
                                       <span className="text-[8px] font-bold text-mono-600 dark:text-mono-400">ڕۆژ</span>
                                    </div>
                                 </div>
                              </Motion.div>
                           )}
                        </AnimatePresence>
                     </div>
                  </div>

                  {/* Unified 3-Column Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 px-4" dir="ltr">

                     <div
                        className="flex flex-col items-center justify-center py-2 rounded-md border border-white/5 shadow-sm transition-all duration-500 backdrop-blur-md"
                        style={{
                           backgroundColor: `rgba(${parseInt(tier.stop1.slice(1, 3), 16)}, ${parseInt(tier.stop1.slice(3, 5), 16)}, ${parseInt(tier.stop1.slice(5, 7), 16)}, 0.12)`,
                           borderColor: `${tier.stop1}30`
                        }}
                     >
                        <span className="text-[10px] font-black uppercase mb-0.5 opacity-60 dark:text-mono-300 text-mono-600">XP سەرجەمێ</span>
                        <span className="text-[13px] font-black dark:text-mono-100 text-mono-900 tabular-nums leading-none">
                           {isLoading ? <div className="w-6 h-2 bg-mono-100 dark:bg-mono-800 animate-pulse rounded"></div> : toKuDigits(currentXP || 0)}
                        </span>
                     </div>

                     <div
                        className="flex flex-col items-center justify-center py-2 rounded-md border border-white/5 shadow-sm transition-all duration-500 backdrop-blur-md"
                        style={{
                           backgroundColor: `rgba(${parseInt(tier.stop1.slice(1, 3), 16)}, ${parseInt(tier.stop1.slice(3, 5), 16)}, ${parseInt(tier.stop1.slice(5, 7), 16)}, 0.22)`,
                           borderColor: `${tier.stop1}40`
                        }}
                     >
                        <span className="text-[10px] font-black uppercase mb-0.5 opacity-60 dark:text-mono-300 text-mono-600">ڕێزبەندی</span>
                        <span className="text-[13px] font-black dark:text-mono-100 text-mono-900 tabular-nums leading-none">
                           {isLoading ? '...' : `#${toKuDigits(userRank || 0)}`}
                        </span>
                     </div>

                     <div
                        className={`flex flex-col items-center justify-center py-2 rounded-md border border-white/10 shadow-sm transition-all duration-500 backdrop-blur-md ${isLoading ? 'animate-pulse opacity-50' : ''}`}
                        style={{
                           backgroundColor: tier.stop1
                        }}
                     >
                        <span className="text-[10px] font-black uppercase mb-0.5 text-mono-950/80">پەیڤێن دیتی</span>
                        <span className="text-[13px] font-black text-mono-950 leading-none tabular-nums">
                           {isLoading ? '...' : toKuDigits(solvedWords?.length || 0)}
                        </span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="flex-1 px-4 pb-[max(env(safe-area-inset-bottom),80px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10 bg-trigger-zone flex flex-col justify-start pt-2">
            <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full flex flex-col items-center">

               {/* Friends Button (Tab Design) */}
               <div className="flex p-1 bg-mono-100 dark:bg-mono-900 rounded-md relative shadow-sm border border-mono-200 dark:border-mono-800 transition-colors duration-300 w-full max-w-sm mx-auto mt-2 mb-4" dir="rtl">
                  <button
                     onPointerDown={(e) => { e.stopPropagation(); triggerHaptic(15); if (playTabSound) playTabSound(); setIsFriendsModalOpen(true); }}
                     onClick={(e) => { e.stopPropagation(); triggerHaptic(15); if (playTabSound) playTabSound(); setIsFriendsModalOpen(true); }}
                     className="w-full py-2.5 rounded-sm bg-black dark:bg-mono-800 shadow-md text-mono-50 font-black text-[14px] flex items-center justify-center gap-2 transition-all relative z-10 hover:brightness-110 active:scale-[0.98] cursor-pointer"
                  >
                     <span className="material-symbols-outlined text-[20px]">group</span>
                     لیستا هەڤالان
                     {pendingFriendsCount > 0 && (
                        <div className="absolute -top-2 -right-2 bg-red-500 min-w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 border-white dark:border-[#141414] z-20 shadow-md px-1">
                           <span className="text-[11px] font-black text-white leading-none mt-0.5">{pendingFriendsCount > 99 ? '99+' : pendingFriendsCount}</span>
                        </div>
                     )}
                  </button>
               </div>

               {/* Quick Actions (Stats, Missions, Medals, Dictionary) */}
               <div className="flex flex-row items-center justify-between gap-2 w-full max-w-sm mx-auto mt-6 mb-4 relative z-10 px-4">

                  {/* Stats */}
                  <Motion.button
                     whileHover={{ scale: 1.05, y: -2 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={() => { triggerHaptic(15); onViewChange('stats'); }}
                     className="flex flex-col items-center justify-center transition-all group"
                  >
                     <span className="material-symbols-outlined text-mono-500 dark:text-mono-400 text-[48px] sm:text-[56px] group-hover:text-[#8b5cf6] transition-colors mb-2">
                        bar_chart
                     </span>
                     <span className="text-[12px] sm:text-[14px] font-black text-mono-500 dark:text-mono-400 group-hover:text-mono-900 dark:group-hover:text-white uppercase">ئامار</span>
                  </Motion.button>

                  {/* Missions */}
                  <Motion.button
                     whileHover={{ scale: 1.05, y: -2 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={() => { triggerHaptic(15); onViewChange('achievements'); }}
                     className="flex flex-col items-center justify-center transition-all group"
                  >
                     <span className="material-symbols-outlined text-mono-500 dark:text-mono-400 text-[48px] sm:text-[56px] group-hover:text-yellow-500 transition-colors mb-2">
                        track_changes
                     </span>
                     <span className="text-[12px] sm:text-[14px] font-black text-mono-500 dark:text-mono-400 group-hover:text-mono-900 dark:group-hover:text-white uppercase">ئەرک</span>
                  </Motion.button>

                  {/* Rank (New Button) */}
                  <Motion.button
                     whileHover={{ scale: 1.05, y: -2 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={() => { triggerHaptic(15); onViewChange('medals'); }}
                     className="flex flex-col items-center justify-center transition-all group relative"
                  >
                     {hasUnclaimedMedals && (
                        <div className="absolute top-0 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-mono-white dark:border-black z-20 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
                     )}
                     <span className="material-symbols-outlined text-mono-500 dark:text-mono-400 text-[48px] sm:text-[56px] group-hover:text-amber-500 transition-colors mb-2">
                        military_tech
                     </span>
                     <span className="text-[12px] sm:text-[14px] font-black text-mono-500 dark:text-mono-400 group-hover:text-mono-900 dark:group-hover:text-white uppercase">پلە</span>
                  </Motion.button>

                  {/* Dictionary */}
                  <Motion.button
                     whileHover={{ scale: 1.05, y: -2 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={() => { triggerHaptic(15); onViewChange('dictionary'); }}
                     className="flex flex-col items-center justify-center transition-all group"
                  >
                     <span className="material-symbols-outlined text-mono-500 dark:text-mono-400 text-[48px] sm:text-[56px] group-hover:text-cyan-500 transition-colors mb-2">
                        menu_book
                     </span>
                     <span className="text-[12px] sm:text-[14px] font-black text-mono-500 dark:text-mono-400 group-hover:text-mono-900 dark:group-hover:text-white uppercase">فەرهەنگ</span>
                  </Motion.button>

               </div>



               <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </Motion.div>
         </div>
         {isCropModalOpen && createPortal(
            <div className="fixed inset-0 z-10000 flex items-center justify-center p-4 bg-black/90 overflow-hidden" dir="rtl">
               <Motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="bg-mono-white dark:bg-black rounded-md w-full max-w-2xl overflow-hidden relative border border-mono-200 dark:border-mono-800 transition-colors duration-300 shadow-2xl flex flex-col max-h-[90vh]"
               >
                  {/* Header */}
                  <div className="p-5 border-b border-mono-200 dark:border-mono-800 flex items-center justify-between bg-mono-50 dark:bg-mono-900/50 relative z-10 shadow-sm">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/30 shadow-inner">
                           <span className="material-symbols-outlined text-primary text-xl font-bold">crop</span>
                        </div>
                        <h3 className="text-mono-900 dark:text-white font-black font-rabar text-[16px]">بڕینا وێنەی</h3>
                     </div>
                     <button
                        onClick={() => setIsCropModalOpen(false)}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-mono-400 hover:text-mono-900 dark:text-mono-500 dark:hover:text-white hover:bg-mono-200 dark:hover:bg-mono-800 transition-all border border-transparent hover:border-mono-300 dark:hover:border-mono-700 active:scale-95"
                     >
                        <span className="material-symbols-outlined text-xl">close</span>
                     </button>
                  </div>

                  {/* Cropper Container */}
                  <div className="relative w-full flex-1 min-h-[300px] h-[50vh] bg-black overflow-hidden cursor-move touch-none">
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
                              border: '2px solid rgba(255,255,255,0.5)'
                           }
                        }}
                     />
                  </div>

                  {/* Controls */}
                  <div className="p-8 space-y-6 relative z-10 bg-mono-50 dark:bg-mono-900">
                     <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                           <span className="text-[10px] font-black text-white/40 uppercase ]">نێزیکرن و دویرکرنا وێنەی</span>
                           <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[12px] font-black tabular-nums border border-primary/30">
                              {zoom.toFixed(1)}x
                           </span>
                        </div>

                        <div className="relative flex items-center h-8 group">
                           <input
                              type="range"
                              id="avatar-zoom"
                              name="avatar-zoom"
                              aria-label="Zoom avatar image"
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
                                 [&::-webkit-slider-thumb]:transition-all
                                 [&::-webkit-slider-thumb]:hover:scale-110
                                 [&::-moz-range-thumb]:w-6 
                                 [&::-moz-range-thumb]:h-6 
                                 [&::-moz-range-thumb]:rounded-full 
                                 [&::-moz-range-thumb]:bg-primary 
                                 [&::-moz-range-thumb]:border-2 
                                 [&::-moz-range-thumb]:border-white"
                           />
                        </div>
                     </div>

                     <div className="flex flex-col gap-3 pt-2">
                        <button
                           onClick={handleConfirmCrop}
                           className="w-full h-14 rounded-md bg-linear-to-b from-green-500 to-green-600 border-b-4 border-green-700 text-white font-black text-sm active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                           <span className="material-symbols-outlined text-xl">check_circle</span>
                           پاراستن
                        </button>
                        <button
                           onClick={() => {
                              setIsCropModalOpen(false);
                              setImageToCrop(null);
                           }}
                           className="w-full h-12 rounded-md bg-white/5 dark:bg-black/20 text-red-500 font-bold text-xs hover:bg-white/10 dark:hover:bg-white/5 active:scale-95 transition-all border-2 border-red-500/20 hover:border-red-500/40"
                        >
                           هەلوەشاندن
                        </button>
                     </div>
                  </div>
               </Motion.div>
            </div>,
            document.body
         )}


         {/* Friends Modal Inline (No Portal/AnimatePresence to fix iOS touch bugs) */}
         {isFriendsModalOpen && (
            <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-mono-white dark:bg-black" dir="rtl">
               <Motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="bg-mono-white dark:bg-black w-full h-full max-w-md mx-auto shadow-2xl flex flex-col overflow-hidden relative z-10"
               >
                  <div className="p-4 border-b border-mono-200 dark:border-mono-800 flex items-center justify-between bg-mono-50 dark:bg-mono-900/50 shrink-0">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center border border-emerald-500/30 text-emerald-500">
                           <span className="material-symbols-outlined font-bold">group</span>
                        </div>
                        <h3 className="text-mono-900 dark:text-white font-black font-rabar text-lg">لیستا ھەڤالان</h3>
                     </div>
                     <button
                        onPointerDown={() => setIsFriendsModalOpen(false)}
                        className="w-10 h-10 flex items-center justify-center rounded-2xl text-mono-400 hover:text-mono-900 dark:text-mono-500 dark:hover:text-white hover:bg-mono-200 dark:hover:bg-mono-800 transition-all active:scale-95 border border-transparent hover:border-mono-300 dark:hover:border-mono-700"
                     >
                        <span className="material-symbols-outlined">close</span>
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                     <FriendsList
                        onOpenChat={(player) => {
                           setIsFriendsModalOpen(false);
                           if (onOpenChat) onOpenChat(player);
                        }}
                     />
                  </div>
               </Motion.div>
            </div>
         )}


      </div>
   );
}
