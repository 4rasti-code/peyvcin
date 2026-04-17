import React from 'react';
import { motion } from 'framer-motion';
import { toKuDigits } from '../utils/formatters';

export default function StatsView({ playerStats, userNickname, userAvatar, level, currentXP, rank, onViewChange }) {
  // Trophy Definition
  const trophies = [
    { id: 1, name: 'نۆبەرە', icon: 'emoji_events', color: 'text-orange-400', threshold: 10 },
    { id: 2, name: 'پالەوان', icon: 'military_tech', color: 'text-slate-300', threshold: 100 },
    { id: 3, name: 'مامۆستا', icon: 'workspace_premium', color: 'text-yellow-400', threshold: 250 },
    { id: 4, name: 'شانازیا کوردستانێ', icon: 'stars', color: 'text-purple-400', threshold: 500 },
    { id: 5, name: 'شانازییا جیھانێ', icon: 'diamond', color: 'text-blue-400', threshold: 1000 },
  ];

  const stats = playerStats || { 
    classic: { totalCorrect: 0, bestStreak: 0, currentStreak: 0 }, 
    daily: { regularDays: 0, plusDays: 0 }, 
    global: { bestRoundsStreak: 0, totalRoundsPlayed: 0 } 
  };
  
  const totalWins = (stats.classic?.totalCorrect || 0) + 
                    (stats.daily?.regularDays || 0) + 
                    (stats.daily?.plusDays || 0);

  const earnedTrophies = trophies.filter(t => totalWins >= t.threshold);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ku-IQ');
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-full"
    >

      {/* Stats Grid - High Density 2-column layout */}
      <div className="grid grid-cols-2 gap-2.5 px-2">
        
        {/* Classic Mode Section */}
        <motion.div variants={itemVariants} className="flex flex-col items-center relative overflow-visible group h-full">
           <div className="relative z-10 w-full h-[145px] overflow-hidden rounded-lg bg-[#2563eb] shadow-md border border-white/10 noise-grain flex flex-col">
             
             {/* Header Row */}
             <div className="flex items-center gap-1.5 p-2 border-b border-white/10">
                <div className="flex items-center justify-center">
                   <span className="material-symbols-outlined text-white text-sm" style={{fontVariationSettings: "'FILL' 1"}}>history</span>
                </div>
                <h3 className="text-[12px] font-bold font-rabar text-white text-pop leading-tight">کلاسیک</h3>
             </div>
             
             {/* Stats Data */}
             <div className="flex justify-between items-center p-1.5 px-2.5 border-b border-white/5">
                <span className="text-white/80 text-[10px] font-medium font-body no-stroke">باشترین زنجیرە</span>
                <span className="text-white text-[13px] font-semibold font-ui tracking-tight text-pop">{toKuDigits(playerStats.classic?.bestStreak || 0)}</span>
             </div>
             <div className="flex justify-between items-center p-1.5 px-2.5 border-b border-white/5">
                <span className="text-white/80 text-[10px] font-medium font-body no-stroke">زنجیرەیا نوکە</span>
                <span className="text-white text-[13px] font-semibold font-ui tracking-tight text-pop">{toKuDigits(playerStats.classic?.currentStreak || 0)}</span>
             </div>
             <div className="flex justify-between items-center p-1.5 px-2.5">
                <span className="text-white/80 text-[10px] font-medium font-body no-stroke">ھەمی پەیڤ</span>
                <span className="text-white text-[13px] font-semibold font-ui tracking-tight text-pop">{toKuDigits(playerStats.classic?.totalCorrect || 0)}</span>
             </div>
           </div>
        </motion.div>

        {/* Daily Puzzle Section */}
        <motion.div variants={itemVariants} className="flex flex-col items-center relative overflow-visible group h-full">
           <div className="relative z-10 w-full h-[145px] overflow-hidden rounded-lg bg-[#ea580c] shadow-md border border-white/10 noise-grain flex flex-col">
             
             {/* Header Row */}
             <div className="flex items-center gap-1.5 p-2 border-b border-white/10">
                <div className="flex items-center justify-center">
                   <span className="material-symbols-outlined text-white text-sm" style={{fontVariationSettings: "'FILL' 1"}}>calendar_today</span>
                </div>
                <h3 className="text-[12px] font-bold font-rabar text-white text-pop leading-tight">پازڵ پڵەس</h3>
             </div>

             {/* Stats Data */}
             <div className="flex justify-between items-center p-1.5 px-2.5 border-b border-white/5">
                <span className="text-white/80 text-[10px] font-medium font-body no-stroke">ڕۆژێن ئاسایی</span>
                <span className="text-white text-[13px] font-semibold font-ui tracking-tight text-pop">{toKuDigits(playerStats.daily?.regularDays || 0)}</span>
             </div>
             <div className="flex justify-between items-center p-1.5 px-2.5 border-b border-white/5">
                <span className="text-white/80 text-[10px] font-medium font-body no-stroke">نمرێن زێدە</span>
                <span className="text-white text-[13px] font-semibold font-ui tracking-tight text-pop">{toKuDigits(playerStats.daily?.plusDays || 0)}</span>
             </div>
             <div className="flex justify-between items-center p-1.5 px-2.5">
                <span className="text-white/80 text-[10px] font-medium font-body no-stroke">میدالیا</span>
                <span className="text-white text-[13px] font-semibold font-ui tracking-tight text-pop">{toKuDigits(earnedTrophies.length)}</span>
             </div>
           </div>
        </motion.div>

        {/* Tournament Section */}
        <motion.div variants={itemVariants} className="flex flex-col items-center relative overflow-visible group h-full">
           <div className="relative z-10 w-full h-[145px] overflow-hidden rounded-lg bg-[#7c3aed] shadow-md border border-white/10 noise-grain flex flex-col">
             
             {/* Header Row */}
             <div className="flex items-center gap-1.5 p-2 border-b border-purple-500/20">
                <div className="flex items-center justify-center">
                   <span className="material-symbols-outlined text-purple-200 text-sm" style={{fontVariationSettings: "'FILL' 1"}}>emoji_events</span>
                </div>
                <h3 className="text-[12px] font-bold font-rabar text-white text-pop leading-tight">خولێن یاریێ</h3>
             </div>
             <div className="flex justify-between items-center p-1.5 px-2.5 border-b border-purple-500/10">
                <span className="text-white/70 text-[10px] font-medium font-body no-stroke">باشترین نمرە</span>
                <span className="text-white text-[13px] font-semibold font-ui tracking-tight text-pop">{toKuDigits(0)}</span>
             </div>
             <div className="flex justify-between items-center p-1.5 px-2.5 border-b border-purple-500/10">
                <span className="text-white/70 text-[10px] font-medium font-body no-stroke">پشکداری</span>
                <span className="text-white text-[13px] font-semibold font-ui tracking-tight text-pop">{toKuDigits(0)}</span>
             </div>
             <p className="text-[7px] text-primary/60 font-black uppercase tracking-widest text-center py-1 bg-purple-500/15">زویترین دەم</p>
           </div>
        </motion.div>

        {/* Global Stats Section */}
        <motion.div variants={itemVariants} className="relative overflow-visible group h-full">
           <div className="relative z-10 w-full h-[145px] overflow-hidden rounded-lg bg-[#059669] shadow-md border border-white/10 noise-grain flex flex-col">
             
             {/* Header Row */}
             <div className="flex items-center gap-1.5 p-2 border-b border-emerald-500/20">
                <div className="flex items-center justify-center">
                   <span className="material-symbols-outlined text-emerald-200 text-sm" style={{fontVariationSettings: "'FILL' 1"}}>public</span>
                </div>
                <h3 className="text-[12px] font-bold font-rabar text-white text-pop leading-tight">جیھانی</h3>
             </div>
             <div className="flex justify-between items-center p-1.5 px-2.5 border-b border-emerald-500/10">
                <span className="text-white/70 text-[10px] font-medium font-body no-stroke">باشترین زنجیرە</span>
                <span className="text-white text-[13px] font-semibold font-ui tracking-tight text-pop">{toKuDigits(playerStats.global?.bestRoundsStreak || 0)}</span>
             </div>
             <div className="flex justify-between items-center p-1.5 px-2.5 border-b border-emerald-500/10">
                <span className="text-white/70 text-[10px] font-medium font-body no-stroke">گەڕێن تەمام</span>
                <span className="text-white text-[13px] font-semibold font-ui tracking-tight text-pop">{toKuDigits(playerStats.global?.totalRoundsPlayed || 0)}</span>
             </div>
             <div className="flex justify-between items-center p-1.5 px-2.5">
                <span className="text-white/80 text-[10px] font-medium font-body no-stroke">پلە</span>
                <span className="text-white text-[14px] font-bold font-ui tracking-tight text-pop">#{toKuDigits(rank || 0)}</span>
             </div>
           </div>
        </motion.div>

      </div>

      {/* Trophies Collection Bento Card */}
      <motion.div variants={itemVariants} className="mt-4 mx-2">
        <div className="relative z-10 w-full overflow-hidden rounded-lg bg-[#111827] shadow-md border border-white/10 noise-grain p-4">
          <div className="flex items-center gap-2 mb-4 relative z-10 w-full">
            <div className="flex items-center justify-center">
               <span className="material-symbols-outlined text-amber-500 text-lg" style={{fontVariationSettings: "'FILL' 1"}}>stars</span>
            </div>
            <h3 className="text-[13px] font-bold font-rabar text-white text-pop leading-tight uppercase tracking-wide">میدالیا و دەستکەفتن</h3>
          </div>

          <div className="grid grid-cols-5 gap-2 relative z-10">
            {trophies.map((trophy) => {
              const isEarned = totalWins >= trophy.threshold;
              return (
                <div key={trophy.id} className="flex flex-col items-center gap-1.5 group/trophy">
                  <div className={`w-full aspect-square rounded-lg flex items-center justify-center relative transition-all duration-300 noise-grain ${isEarned ? 'bg-amber-600 shadow-lg border border-amber-400/30' : 'bg-black/20 border border-white/5 opacity-40'}`}>
                    <span className={`material-symbols-outlined text-lg ${isEarned ? 'text-white' : 'text-white/50'}`} style={{ fontVariationSettings: isEarned ? "'FILL' 1" : "''" }}>
                      {trophy.icon}
                    </span>
                  </div>
                  <span className={`text-[10px] font-medium font-body uppercase tracking-tight no-stroke text-center truncate w-full ${isEarned ? 'text-white' : 'text-white/50'}`}>
                    {trophy.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Hero Bento: Dictionary Feature Card */}
      <motion.div variants={itemVariants} className="mt-6 mb-4 mx-2">
        <button 
          onClick={() => onViewChange('dictionary')}
          className="w-full h-26 rounded-2xl flex items-center justify-between px-8 group transition-all duration-500 puzzle-tile relative overflow-hidden shadow-2xl border border-white/10"
        >
          {/* Enhanced Mesh Gradient Background */}
          <div className="absolute inset-0 bg-emerald-600/80" />
          <div className="absolute inset-0 bg-linear-to-br from-emerald-500 via-teal-600 to-indigo-900 opacity-90" />
          
          {/* Central Glowing Aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-400/30 blur-[50px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="relative">
               {/* Icon Glow */}
               <div className="absolute inset-0 bg-white/20 blur-xl rounded-full animate-pulse" />
               <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:rotate-12 transition-transform duration-700 border border-white/40 shadow-2xl relative z-10">
                 <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
               </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-white/60 text-[9px] font-black font-ui uppercase tracking-[0.2em] mb-0.5 no-stroke">گەوھەرا زمانێ مە</span>
              <h3 className="text-2xl font-black font-rabar text-white text-pop drop-shadow-lg">فەرھەنگا من</h3>
              <p className="text-white/40 text-[10px] font-bold font-body mt-0.5">ھەمی پەیڤێن تە د ڤێرێ نە</p>
            </div>
          </div>

          {/* Action Indicator */}
          <div className="flex flex-col items-center gap-1.5 relative z-10 opacity-60 group-hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center group-hover:translate-x--1 transition-transform shadow-inner border border-white/10">
               <span className="material-symbols-outlined text-white text-xl font-black">chevron_left</span>
            </div>
            <span className="text-[8px] font-black text-white/50 uppercase tracking-widest hidden sm:block">ڤەکەرە</span>
          </div>

          {/* Premium Glass Highlights */}
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/5 to-transparent" />
          
          {/* Animated Shimmer Overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
        </button>
      </motion.div>

    </motion.div>
  );
}
