import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import FlagBadge from './FlagBadge';
import { AVATARS, DEFAULT_AVATAR } from '../data/avatars';
import Avatar from './Avatar';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import Podium from './Podium';
import PublicProfileModal from './PublicProfileModal';
import { FilsIcon } from './CurrencyIcon';
import { triggerHaptic } from '../utils/haptics';
import { toKuDigits } from '../utils/formatters';

export default function LeaderboardView({ userId, userXP, userFils, userCity = "زاخۆ", userNickname = "تو", userAvatar = 'default', isInKurdistan = true, countryCode = 'IQ', lastProfileUpdate, onOpenChat }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState('--');
  const [view, setView] = useState('global');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const { data: leaderData, error: leaderError } = await supabase
        .from('profiles')
        .select('*')
        .order('xp', { ascending: false })
        .limit(20);

      if (!leaderError) {
        setLeaders(leaderData || []);
      }

      // GLOBAL RANK FETCH
      const { count, error: rankError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('xp', userXP);
      
      if (!rankError) setUserRank(count + 1);
      setLoading(false);
    };

    fetchData();
    
    // ⚡️ REAL-TIME SYNC - Auto refresh when ANY profile in the top 20 changes
    const channel = supabase
      .channel('leaderboard-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
        console.log('Leaderboard sync triggered:', payload);
        fetchData();
      })
      .subscribe();
    
    const handleFocus = () => fetchData();
    window.addEventListener('focus', handleFocus);
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchData();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userXP, lastProfileUpdate, view, userId]);

  // --- MANUAL REFRESH (PULL-TO-REFRESH STYLE) ---
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    triggerHaptic(15);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const getMatteRankStyles = (rank) => {
    if (rank === 1) return "bg-[#facc15] text-amber-950 border-amber-300";
    if (rank === 2) return "bg-slate-200 text-slate-800 border-white";
    if (rank === 3) return "bg-orange-400 text-orange-950 border-orange-300";
    return "bg-slate-700 text-slate-400 border-white/5";
  };

  const getThemeCardStyles = (themeId, isTop3) => {
    switch (themeId) {
      case 'zakho_nights':
        return {
          bg: 'bg-[#020617]', 
          border: isTop3 ? 'border-[#facc15]/40' : 'border-[#facc15]/20',
          accent: 'bg-[#facc15]'
        };
      case 'duhok_theme':
        return {
          bg: 'bg-[#064e3b]', 
          border: isTop3 ? 'border-[#10b981]/40' : 'border-[#10b981]/20',
          accent: 'bg-[#10b981]'
        };
      case 'kurdish_puzzle_3d_free':
        return {
          bg: 'bg-black', 
          border: isTop3 ? 'border-[#58cc02]/40' : 'border-[#58cc02]/20',
          accent: 'bg-[#58cc02]'
        };
      default:
        return {
          bg: 'bg-slate-800',
          border: isTop3 ? 'border-slate-700' : 'border-slate-700',
          accent: isTop3 ? 'bg-[#facc15]' : 'bg-slate-700'
        };
    }
  };

  const getTopTrophy = (points) => {
    if (points >= 1000) return { icon: 'diamond', color: 'text-blue-400' };
    if (points >= 500) return { icon: 'stars', color: 'text-purple-400' };
    if (points >= 250) return { icon: 'workspace_premium', color: 'text-yellow-400' };
    if (points >= 100) return { icon: 'military_tech', color: 'text-slate-300' };
    if (points >= 10) return { icon: 'emoji_events', color: 'text-orange-400' };
    return null;
  };

  return (
    <div className="w-full max-w-full px-4 md:px-6 pb-56 min-h-screen relative animate-in fade-in duration-700 bg-[#0f172a] overflow-x-hidden pt-[calc(env(safe-area-inset-top,24px)+32px)] md:pt-20">
      
      {/* 1. Premium Notion-Style Header */}
      <div className="flex flex-col items-center mb-10 max-w-md mx-auto text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-2">
          <span className="material-symbols-outlined text-primary text-[14px]">leaderboard</span>
          <span className="text-[10px] font-black font-rabar text-primary uppercase tracking-wider">باشترینێن یاریێ</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-black font-rabar text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          رێزبەندی
        </h2>
        
        <div className="w-12 h-1.5 bg-primary rounded-full mx-auto opacity-50 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
      </div>

      {/* 2. Flat Tab Toggles */}
      <div className="flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700 mb-10 w-full max-w-xs mx-auto relative z-30 shadow-2xl">
        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={() => { triggerHaptic(10); setView('global'); }}
          className={`flex-1 py-3 rounded-xl font-black font-rabar text-[13px] transition-all duration-300 ${view === 'global' ? 'bg-[#facc15] text-amber-950 shadow-md' : 'text-slate-500 hover:text-white'}`}
        >
          <span>جیهانی</span>
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={() => { triggerHaptic(10); setView('friends'); }}
          className={`flex-1 py-3 rounded-xl font-black font-rabar text-[13px] transition-all duration-300 ${view === 'friends' ? 'bg-[#facc15] text-amber-950 shadow-md' : 'text-slate-500 hover:text-white'}`}
        >
          <span>هەڤال</span>
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {!loading ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            {/* List Row System */}
            <div className="space-y-3 px-1 md:px-0">
               <LayoutGroup>
                 {leaders.map((player, index) => {
                   const rank = index + 1;
                   const isTop3 = rank <= 3;
                   
                   // OVERRIDE FOR CURRENT USER: Ensures parity with local state (prop-driven)
                   const isMe = userId && (player.id === userId);
                   const effectiveAvatar = isMe ? userAvatar : player.avatar_url;
                   const effectiveNickname = isMe ? userNickname : player.nickname;
                   const effectiveCity = isMe ? userCity : player.city;
                   const effectiveXP = isMe ? userXP : player.xp;
                   
                   const theme = getThemeCardStyles(player.equipped_theme, isTop3);
                   const level = Math.floor((effectiveXP || 0) / 500) + 1;
                   const trophy = getTopTrophy(player.shayi || 0);
                   
                   return (
                     <motion.div 
                       layout
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       whileHover={{ backgroundColor: '#1e293b' }}
                       whileTap={{ scale: 0.99 }}
                       transition={{ delay: index * 0.03 }}
                       key={player.id} 
                       onClick={() => { triggerHaptic(10); setSelectedPlayer({ ...player, avatar_url: effectiveAvatar, nickname: effectiveNickname, city: effectiveCity }); }}
                       className={`flex flex-row items-center gap-3 md:gap-4 px-4 ${isTop3 ? 'py-3.5 shadow-lg relative overflow-hidden' : 'py-2.5'} rounded-lg ${theme.bg} border ${isTop3 ? theme.border : 'border-slate-700/50'} transition-all cursor-pointer group`}
                     >
                       {/* Top 3 Side Accent */}
                       {isTop3 && (
                          <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${theme.accent}`} />
                       )}

                       {/* Rank Circle */}
                       <div className="flex flex-col items-center shrink-0">
                          {rank === 1 && (
                             <motion.span 
                                initial={{ y: 2 }}
                                animate={{ y: -2 }}
                                transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1 }}
                                className="text-[14px] leading-none mb-0.5"
                             >👑</motion.span>
                          )}
                          <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border-2 shadow-sm relative ${getMatteRankStyles(rank)}`}>
                             <span className="text-xl font-black font-rabar leading-none">
                                {toKuDigits(rank)}
                             </span>
                          </div>
                       </div>
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className={`w-14 h-14 rounded-full p-[2.5px] ${isTop3 ? 'bg-linear-to-tr from-[#facc15] via-[#fbbf24] to-[#facc15] shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'bg-slate-700'} flex items-center justify-center relative transition-transform group-hover:scale-110 shadow-xl overflow-hidden`}>
                            <Avatar 
                              src={effectiveAvatar} 
                              updatedAt={isMe ? lastProfileUpdate : player.updated_at} 
                              size="lg" 
                              border={false}
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 drop-shadow-lg scale-90 z-10">
                            <FlagBadge 
                              isInKurdistan={isMe ? isInKurdistan : player.is_kurdistan} 
                              countryCode={isMe ? countryCode : player.country_code} 
                              size="xs" 
                            />
                          </div>
                        </div>
                       
                       {/* Info Group */}
                       <div className="flex-1 flex flex-col items-start min-w-0 pr-1">
                          <div className="flex items-center gap-1.5">
                             <span className={`text-[17px] md:text-[20px] font-black font-rabar leading-tight truncate text-white`}>{effectiveNickname}</span>
                             {trophy && (
                                <span className={`material-symbols-outlined text-[16px] ${trophy.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                   {trophy.icon}
                                </span>
                             )}
                          </div>
                           <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-black font-rabar text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                 ئاستێ {toKuDigits(level)}
                              </span>
                           </div>
                       </div>
                       
                       {/* Points */}
                       <div className={`shrink-0 flex items-center gap-2 bg-black/30 px-3 py-2.5 rounded-[22px] border border-white/5 min-w-[85px] justify-center group-hover:border-white/10 transition-all shadow-inner`}>
                          <span className={`text-[16px] md:text-[18px] font-black font-rabar leading-none ${isTop3 ? 'text-white' : 'text-white/80'}`}>
                             {toKuDigits(isMe ? userFils : (player.shayi || player.fils || 0))}
                          </span>
                          <div className={`w-4 h-4 flex items-center justify-center shrink-0 ${isTop3 ? 'opacity-100' : 'opacity-40'}`}>
                             <FilsIcon className="text-[#facc15]" />
                          </div>
                       </div>
                     </motion.div>
                   );
                 })}
               </LayoutGroup>
            </div>

          </motion.div>
        ) : (
          /* Minimalist Flat Loading */
          <div className="flex flex-col items-center justify-center py-48 gap-8">
             <div className="w-16 h-16 border-4 border-slate-800 border-t-[#facc15] rounded-full animate-spin shadow-inner"></div>
             <span className="font-black font-rabar text-slate-600 tracking-[0.4em] uppercase text-[11px] animate-pulse">چاڤەڕێ بن...</span>
          </div>
        )}
      </AnimatePresence>

      <PublicProfileModal 
        profile={selectedPlayer} 
        currentUser={{ id: userId }}
        onClose={() => setSelectedPlayer(null)} 
        onMessage={onOpenChat}
      />

    </div>
  );
}
