import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from './Avatar';
import FlagBadge from './FlagBadge';
import { triggerHaptic } from '../utils/haptics';
import { supabase } from '../lib/supabase';
import { FilsIcon } from './CurrencyIcon';
import CoinAnimation from './CoinAnimation';
import { toKuDigits } from '../utils/formatters';
import { useGame } from '../context/GameContext';

const getRankInfo = (level) => {
  if (level >= 50) return { name: 'ئەفسانە', color: 'text-purple-400', border: 'border-purple-500' };
  if (level >= 30) return { name: 'پێشەنگ', color: 'text-amber-400', border: 'border-amber-400' };
  if (level >= 15) return { name: 'پایەبەرز', color: 'text-emerald-400', border: 'border-emerald-500' };
  if (level >= 5) return { name: 'شارەزا', color: 'text-blue-400', border: 'border-blue-500' };
  return { name: 'دەستپێکەر', color: 'text-slate-400', border: 'border-slate-500' };
};

export default function PublicProfileModal({ 
  profile, 
  currentUser,
  onClose, 
  onOpenChat,
  isFriend = false,
  isPending = false,
  isBlocked = false,
  onToggleBlock,
  onActionComplete
}) {
  const [fullData, setFullData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTop10, setIsTop10] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showUnfriendConfirm, setShowUnfriendConfirm] = useState(false);
  const [showCoinAnim, setShowCoinAnim] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [relStatus, setRelStatus] = useState(isFriend ? 'friend' : (isPending ? 'pending' : 'none')); // 'none', 'pending', 'friend'
  const [isMe, setIsMe] = useState(false);
  const [internalBlocked, setInternalBlocked] = useState(false);
  const { getLevelData } = useGame();

  useEffect(() => {
    if (!profile?.id) return;
    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.id)
        .single();
      
      if (data) setFullData(data);

      // Check Top 10 Globally
      const { data: topPlayers } = await supabase
        .from('profiles')
        .select('id')
        .order('xp', { ascending: false })
        .limit(10);
      
      if (topPlayers) {
        setIsTop10(topPlayers.some(p => p.id === profile.id));
      }

      // 3. Check Relationship if not same user
      const currentUserId = currentUser?.id;
      if (currentUserId === profile.id) {
        setIsMe(true);
      } else if (currentUserId) {
        // More robust friendship check
        const { data: friendship } = await supabase
          .from('friendships')
          .select('status, user_id, friend_id')
          .or(`and(user_id.eq.${currentUserId},friend_id.eq.${profile.id}),and(user_id.eq.${profile.id},friend_id.eq.${currentUserId})`)
          .maybeSingle();

        if (friendship) {
          if (friendship.status === 'accepted') {
            setRelStatus('friend');
          } else {
            // Check direction for pending status
            setRelStatus(friendship.user_id === currentUserId ? 'pending_sent' : 'pending_received');
          }
        } else {
          setRelStatus('none');
        }

        // 4. Check Block Status - Hardened against 403 errors
        try {
          const { data: block, error: blockError } = await supabase
            .from('blocks')
            .select('id')
            .eq('blocker_id', currentUserId)
            .eq('blocked_id', profile.id)
            .maybeSingle();
          
          if (blockError) {
            console.warn("Block table access restricted (RLS):", blockError.message);
            setInternalBlocked(false);
          } else {
            setInternalBlocked(!!block);
          }
        } catch (e) {
          console.warn("Social permissions check failed:", e);
          setInternalBlocked(false);
        }
      }

      setLoading(false);
    };
    loadProfile();
  }, [profile?.id, currentUser?.id]);

  if (!profile) return null;

  const displayData = fullData || profile;
  
  // Exponential Progress Logic (Standardized)
  const levelData = getLevelData(displayData.xp || 0);
  const safeLevel = levelData.level;
  const progressRatio = levelData.progressPercent;
  const nextLevelXP = Math.round(levelData.nextLevelBase);

  // Online Status Logic: Consider online if active in the last 3 minutes
  const isOnline = isMe || (displayData.updated_at && (new Date() - new Date(displayData.updated_at)) < 3 * 60 * 1000);

  // Mastery Logic
  const getMastery = (d) => {
    const modes = [
      { id: 'classic', count: d.mode_classic_played || 0, color: 'text-yellow-400', bg: 'bg-yellow-400/30', icon: 'sports_esports', name: 'پەیڤچنا کلاسیك', shadow: 'shadow-[0_0_15px_rgba(250,204,21,0.6)]' },
      { id: 'lightning', count: d.mode_lightning_played || 0, color: 'text-purple-400', bg: 'bg-purple-400/30', icon: 'bolt', name: 'تایا پەیڤان', shadow: 'shadow-[0_0_15px_rgba(192,132,252,0.6)]' },
      { id: 'hard', count: d.mode_hard_played || 0, color: 'text-orange-500', bg: 'bg-orange-500/30', icon: 'military_tech', name: 'پەیڤێن دژوار', shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.6)]' },
      { id: 'mystery', count: d.mode_mystery_played || 0, color: 'text-sky-500', bg: 'bg-sky-500/30', icon: 'search', name: 'پەیڤا نەھێنی', shadow: 'shadow-[0_0_15px_rgba(14,165,233,0.6)]' }
    ];

    const dominant = modes.reduce((prev, current) => (prev.count > current.count) ? prev : current);
    
    // Only show if played at least once
    if (dominant.count === 0) return null;

    let tierLevel = 1; // Bronze
    let tierBorder = 'border-amber-700';
    let tierGlow = '';
    
    if (dominant.count >= 200) {
      tierLevel = 3; // Gold
      tierBorder = 'border-yellow-400';
      tierGlow = dominant.shadow;
    } else if (dominant.count >= 50) {
      tierLevel = 2; // Silver
      tierBorder = 'border-slate-300';
    }

    return { ...dominant, tierLevel, tierBorder, tierGlow };
  };

  const handleClaimMastery = async () => {
    if (!mastery || claiming) return;
    const isMe = currentUser?.id === displayData.id;
    if (!isMe) return;

    const claimedTier = displayData.mastery_claims?.[mastery.id] || 0;
    if (mastery.tierLevel <= claimedTier) return;

    setClaiming(true);
    triggerHaptic(50); // Strong haptic for big claim

    const rewards = { 1: 500, 2: 2500, 3: 10000 };
    const amount = rewards[mastery.tierLevel];
    
    setRewardAmount(amount);

    // Update DB
    const newClaims = { 
      ...(displayData.mastery_claims || {}), 
      [mastery.id]: mastery.tierLevel 
    };

    const { error } = await supabase
      .from('profiles')
      .update({ 
        shayi: (displayData.shayi || 0) + amount,
        mastery_claims: newClaims
      })
      .eq('id', currentUser?.id);

    if (!error) {
      setFullData({ ...displayData, shayi: (displayData.shayi || 0) + amount, mastery_claims: newClaims });
      setShowCoinAnim(true);
      setTimeout(() => setShowCoinAnim(false), 3500);
    }
    setClaiming(false);
  };

  const handleSendFriendRequest = async () => {
    if (!currentUser || relStatus !== 'none') return;
    triggerHaptic(15);
    setRelStatus('pending_sent'); // Optimistic UI
    
    const { error } = await supabase
      .from('friendships')
      .insert([{ user_id: currentUser?.id, friend_id: profile.id, status: 'pending' }]);
    
    if (error) {
      if (error.code === '23505') {
        // Already sent, keep the optimistic status
        if (onActionComplete) onActionComplete();
        return;
      }
      setRelStatus('none');
      console.error("Friend request error:", error);
    } else {
      if (onActionComplete) onActionComplete();
    }
  };

  const handleAcceptFriendRequest = async () => {
    if (!currentUser || relStatus !== 'pending_received') return;
    triggerHaptic(20);
    setRelStatus('friend'); // Optimistic
    
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .or(`and(user_id.eq.${currentUser?.id},friend_id.eq.${profile.id}),and(user_id.eq.${profile.id},friend_id.eq.${currentUser?.id})`);

    if (error) {
      setRelStatus('pending_received');
      console.error("Accept error:", error);
    } else {
      if (onActionComplete) onActionComplete();
    }
  };

  const handleDeclineFriendRequest = async () => {
    if (!currentUser) return;
    triggerHaptic(10);
    setRelStatus('none'); // Optimistic
    
    const { error } = await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id.eq.${currentUser?.id},friend_id.eq.${profile.id}),and(user_id.eq.${profile.id},friend_id.eq.${currentUser?.id})`);

    if (error) {
      console.error("Decline error:", error);
    } else {
      if (onActionComplete) onActionComplete();
    }
  };

  const handleUnfriend = async () => {
    if (!currentUser || relStatus !== 'friend') return;
    
    const { error } = await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id.eq.${currentUser?.id},friend_id.eq.${profile.id}),and(user_id.eq.${profile.id},friend_id.eq.${currentUser?.id})`);

    if (!error) {
      setRelStatus('none');
      setShowUnfriendConfirm(false);
      triggerHaptic(30);
      if (onActionComplete) onActionComplete();
    } else {
      console.error("Unfriend error:", error);
    }
  };

  const mastery = getMastery(displayData);

  // Medals Configuration
  const medals = [
    { id: 'nobera', name: 'نۆبەرە', condition: (d) => (d.level || 1) >= 1, color: 'text-amber-500', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]', icon: 'military_tech', tooltip: 'ئاستێ ١ ب دەستڤە بینە' },
    { id: 'palawan', name: 'پاڵەوان', condition: (d) => (d.games_won || 0) >= 50, color: 'text-red-500', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]', icon: 'sports_mma', tooltip: '٥٠ یارییان ببە دا ببیە پاڵەوان!' },
    { id: 'mamosta', name: 'مامۆستا', condition: (d) => (d.level || 1) >= 20, color: 'text-yellow-400', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.5)]', icon: 'school', tooltip: 'ئاستێ ٢٠ ب دەستڤە بینە' },
    { id: 'shanazi_kurdistan', name: 'شانازیا کوردستانێ', condition: (d) => (d.kurdish_words_completed || 0) >= 100, color: 'text-emerald-500', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]', icon: 'beenhere', tooltip: '١٠٠ پەیڤێن کوردی تەواو بکە' },
    { id: 'shanazi_jihani', name: 'شانازیا جیھانی', condition: (d) => isTop10 && (d.xp || 0) >= 1000, color: 'text-purple-400', glow: 'shadow-[0_0_15px_rgba(192,132,252,0.5)]', icon: 'public', tooltip: 'د ناڤ ١٠ باشترینێن جیھانێ دا بە' },
  ];

  const effectiveIsBlocked = internalBlocked || isBlocked;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-hidden pointer-events-auto">
      {/* Heavy Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col items-center p-6 text-center max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        {/* Deep Golden Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-[80px] -z-10 pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all z-10"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Level Badge - Top Right */}
        <div className="absolute top-4 right-4 z-10">
           <div className="relative w-11 h-12 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full drop-shadow-2xl" viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M50 0L95 20V55C95 80 50 115 50 115C50 115 5 80 5 55V20L50 0Z" fill="url(#medalGradientPublic)" stroke="white" strokeWidth="4" strokeOpacity="0.2" />
                 <defs>
                    <linearGradient id="medalGradientPublic" x1="50" y1="0" x2="50" y2="115" gradientUnits="userSpaceOnUse">
                       <stop stopColor={safeLevel >= 10 ? "#FFD700" : "#94a3b8"} />
                       <stop offset="1" stopColor={safeLevel >= 10 ? "#B8860B" : "#475569"} />
                    </linearGradient>
                 </defs>
              </svg>
              <div className="relative z-10 flex flex-col items-center justify-center -mt-1.5">
                 <span className="text-[7.5px] font-black text-slate-950/40 uppercase leading-none mb-0.5">ئاستێ</span>
                 <span className="text-xl font-black text-slate-950 leading-none drop-shadow-sm">{toKuDigits(safeLevel)}</span>
              </div>
           </div>
        </div>

        {/* Avatar Section */}
        <div className="relative mb-3 mt-2">
          <div className={`w-28 h-28 rounded-full p-1.5 flex items-center justify-center shadow-xl relative ${safeLevel >= 10 ? 'bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600' : 'bg-slate-700'}`}>
             <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-5xl border-[3px] border-slate-900 overflow-hidden relative shadow-inner">
                <Avatar 
                   src={displayData.avatar_url} 
                   updatedAt={displayData.updated_at} 
                   size="2xl" 
                   border={false}
                />
             </div>
          </div>
          {isOnline && (
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-slate-900 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
          )}
        </div>

        {/* Identity Section */}
        <div className="space-y-1 mb-5 flex flex-col items-center">
           <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl font-black text-white font-rabar">{displayData.nickname}</h2>
              <FlagBadge countryCode={displayData.country_code} isInKurdistan={displayData.is_kurdistan} size="sm" />
           </div>

           {mastery && (
             <div className="relative mt-2 pt-1 flex items-center justify-center gap-2 group">
                <div 
                  className="relative flex items-center justify-center cursor-pointer"
                  onClick={() => triggerHaptic(10)}
                >
                   <motion.div 
                     className={`absolute inset-0 rounded-full ${mastery.bg} ${mastery.tierGlow} blur-sm`}
                     animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.8, 0.4] }}
                     transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                   />
                   <div className={`relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border-2 ${mastery.tierBorder} transition-colors`}>
                      <span className={`material-symbols-outlined text-[15px] ${mastery.color}`}>{mastery.icon}</span>
                      <span className={`text-[9px] uppercase tracking-widest font-black font-rabar ${mastery.color}`}>{mastery.name}</span>
                   </div>
                </div>

                {isMe && mastery.tierLevel > (displayData.mastery_claims?.[mastery.id] || 0) && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClaimMastery}
                    disabled={claiming}
                    className="relative z-20 flex items-center gap-1 bg-emerald-500 text-slate-950 font-black text-[10px] py-1 px-3 rounded-full shadow-lg border border-emerald-400/50 transition-all hover:bg-emerald-400"
                  >
                    {claiming ? '...' : 'وەرگرتن'}
                    <FilsIcon className="w-3.5 h-3.5" />
                  </motion.button>
                )}
             </div>
           )}
        </div>

        {/* Stats Grid */}
        {!loading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mb-5 pt-4 border-t border-white/5 space-y-4"
          >
             <div className="w-full relative overflow-hidden px-2">
                <div className="flex justify-between items-end mb-1.5 relative z-10">
                   <div className="text-right">
                     <span className="text-[8px] font-black font-ui uppercase tracking-widest text-white/40 block">ئەزموون (XP)</span>
                     <span className="text-base font-black text-white font-ui">{displayData.xp || 0}</span>
                   </div>
                   <span className="text-[9px] font-black text-white/20">/ {nextLevelXP}</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden shadow-inner relative z-10">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${progressRatio}%` }}
                     transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                     className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                   />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                   <span className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1 font-ui">باڵانس</span>
                   <div className="flex items-center gap-1.5">
                      <div className="flex flex-col items-end leading-none translate-y-0.5">
                         <span className="text-xl font-black text-white font-ui">{toKuDigits(displayData.shayi || 0)}</span>
                         <span className="text-[8px] font-black uppercase tracking-widest opacity-60 text-white/40">فلس</span>
                      </div>
                      <FilsIcon className="w-4 h-4" />
                   </div>
                </div>
                <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                   <span className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1 font-ui">ستریك</span>
                   <div className="flex items-center gap-1.5">
                      <span className="text-xl font-black text-white font-ui">{toKuDigits(displayData.daily_streak || 0)}</span>
                      <span className="text-lg">🔥</span>
                   </div>
                </div>
             </div>

             <div className="pt-2 border-t border-white/5">
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block text-center mb-3">دەستکەڤت و مەدالیا</span>
                <div className="flex justify-center gap-2 flex-wrap relative">
                   {medals.map((m, idx) => {
                     const isUnlocked = m.condition(displayData);
                     return (
                       <div key={m.id} className="relative">
                         <button 
                           onClick={() => {
                             triggerHaptic(10);
                             setActiveTooltip(activeTooltip === m.id ? null : m.id);
                             if(activeTooltip !== m.id) setTimeout(() => setActiveTooltip(null), 3000);
                           }}
                           className={`w-11 h-11 rounded-full border-[1.5px] flex flex-col items-center justify-center transition-all duration-500 overflow-hidden relative
                             ${isUnlocked ? `bg-white/10 border-white/20 ${m.glow}` : 'bg-white/5 border-white/5 grayscale opacity-20 hover:opacity-40'}`}
                         >
                            <span className={`material-symbols-outlined text-[18px] ${isUnlocked ? m.color : 'text-slate-500'}`}>{m.icon}</span>
                         </button>
                         <AnimatePresence>
                           {activeTooltip === m.id && (
                             <motion.div
                               initial={{ opacity: 0, y: 10, scale: 0.9 }}
                               animate={{ opacity: 1, y: 0, scale: 1 }}
                               exit={{ opacity: 0, y: 5, scale: 0.9 }}
                               className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-2 bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-20 pointer-events-none text-center"
                             >
                                <p className="text-[10px] font-bold text-white font-rabar leading-tight">
                                  <span className={`block uppercase mb-1 ${m.color}`}>{m.name}</span>
                                  {m.tooltip}
                                </p>
                             </motion.div>
                           )}
                         </AnimatePresence>
                       </div>
                     );
                   })}
                </div>
             </div>
          </motion.div>
        )}

        <div className="w-full space-y-3 mt-auto flex flex-col pt-4">
           {isMe ? (
              <div className="w-full py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm text-center">ئەڤە پڕۆفایلا تەیا تایبەتە</div>
            ) : effectiveIsBlocked ? (
              <div className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-sm text-center flex items-center justify-center gap-2">
                 <span className="material-symbols-outlined text-lg">block</span>
                 ئەڤ یاریزانە ھاتیە بلۆککرن
              </div>
            ) : relStatus === 'friend' ? (
              <div className="w-full flex flex-col gap-3">
                <button 
                  onClick={() => { triggerHaptic(20); onOpenChat(displayData || profile); }}
                  className="w-full py-3.5 rounded-full bg-slate-100 text-slate-950 font-black text-base shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 font-rabar border border-white/20"
                >
                   <span>نامەیێ بھنێرە</span>
                   <span className="material-symbols-outlined text-xl">chat</span>
                </button>

                <AnimatePresence mode="wait">
                  {showUnfriendConfirm ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center justify-center gap-3 bg-red-500/10 border border-red-500/20 py-2.5 px-4 rounded-xl"
                    >
                      <span className="text-xs font-bold text-red-200">تو پشتڕاستی؟</span>
                      <button onClick={handleUnfriend} className="text-white bg-red-600 hover:bg-red-500 px-4 py-1.5 rounded-lg text-xs font-black transition-colors shadow-lg">بەڵێ</button>
                      <button onClick={() => { triggerHaptic(10); setShowUnfriendConfirm(false); }} className="text-slate-300 bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors">نەخێر</button>
                    </motion.div>
                  ) : (
                    <button 
                      onClick={() => { triggerHaptic(10); setShowUnfriendConfirm(true); }}
                      className="text-xs font-black text-red-500/40 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">person_remove</span>
                      لابرنا ھەڤالینیێ
                    </button>
                  )}
                </AnimatePresence>
              </div>
            ) : relStatus === 'pending_sent' ? (
              <div className="w-full flex flex-col gap-2">
                <div className="w-full py-3.5 rounded-xl bg-slate-800/50 border border-white/5 text-slate-400 font-bold text-xs text-center flex items-center justify-center gap-2 opacity-50">
                  <span className="material-symbols-outlined text-lg animate-pulse">hourglass_top</span>
                  چاڤەڕێبە
                </div>
                <button onClick={handleDeclineFriendRequest} className="text-[10px] font-black text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest">پەشێمان بوون</button>
              </div>
            ) : relStatus === 'pending_received' ? (
              <div className="flex gap-2 w-full">
                <button onClick={handleAcceptFriendRequest} className="flex-[2] py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm shadow-lg hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-2 font-rabar">
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  وەربگرە
                </button>
                <button onClick={handleDeclineFriendRequest} className="flex-1 py-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 font-black text-sm hover:bg-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={handleSendFriendRequest} 
                className="w-full py-3.5 rounded-full bg-slate-100 text-slate-950 font-black text-base shadow-lg hover:bg-white active:scale-95 transition-all flex items-center justify-center gap-2 font-rabar font-bold border border-white/20"
              >
                 <span>ببە ھەڤاڵ</span>
                 <span className="material-symbols-outlined text-xl">add</span>
              </button>
            )}

           {onToggleBlock && (
             <AnimatePresence mode="wait">
               {showBlockConfirm ? (
                 <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex items-center justify-center gap-3 mt-2 bg-red-500/10 border border-red-500/20 py-2 px-3 rounded-xl">
                   <span className="text-xs font-bold text-red-200">دڵنیایی؟</span>
                   <button onClick={() => { triggerHaptic(10); onToggleBlock(effectiveIsBlocked); setShowBlockConfirm(false); }} className="text-white bg-red-600 hover:bg-red-500 px-3 py-1 rounded-lg text-xs font-black shadow-lg">بەڵێ، بلۆک</button>
                   <button onClick={() => { triggerHaptic(10); setShowBlockConfirm(false); }} className="text-slate-300 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg text-xs font-bold">نەخێر</button>
                 </motion.div>
               ) : (
                 <button onClick={() => { triggerHaptic(10); setShowBlockConfirm(true); }} className={`text-sm font-bold mt-2 hover:opacity-100 transition-opacity flex items-center gap-1 justify-center ${effectiveIsBlocked ? 'text-slate-400 opacity-60' : 'text-red-400/50 opacity-100 hover:text-red-400'}`}>
                   <span className="material-symbols-outlined text-[16px]">{effectiveIsBlocked ? 'undo' : 'person_off'}</span>
                   {effectiveIsBlocked ? 'لابرنا بلۆکی' : 'بلۆککرن'}
                 </button>
               )}
             </AnimatePresence>
           )}
        </div>
      </motion.div>
      <CoinAnimation trigger={showCoinAnim} amount={rewardAmount} />
    </div>
  );
}
