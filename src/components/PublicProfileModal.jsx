import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import Avatar from './Avatar';
import FlagBadge from './FlagBadge';
import { triggerHaptic } from '../utils/haptics';
import { supabase } from '../lib/supabase';
import { FilsIcon, Level10Icon, KawaHammerIcon, GraduationCapIcon, KurdishShieldIcon, GlobeIcon, ExpertDiamondIcon } from './CurrencyIcon';
import CoinAnimation from './CoinAnimation';
import { toKuDigits } from '../utils/formatters';
import { useGame } from '../context/GameContext';
import { getLevelTier } from '../utils/progression';
import { useAudio } from '../context/AudioContext';
import { useUser } from '../context/AuthContext';
import StatsView from './StatsView';

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
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullStats, setShowFullStats] = useState(false);
  const [isMedalsExpanded] = useState(true);


  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const [showReportSuccess, setShowReportSuccess] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [showUnfriendConfirm, setShowUnfriendConfirm] = useState(false);
  const [showCoinAnim, setShowCoinAnim] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const { onlineUsers } = useUser();
  const [relStatus, setRelStatus] = useState(isFriend ? 'friend' : (isPending ? 'pending' : 'none')); // 'none', 'pending', 'friend'
  const [isMe, setIsMe] = useState(false);
  const [internalBlocked, setInternalBlocked] = useState(false);
  const { getLevelData } = useGame();
  const { playBubblePopSound } = useAudio();

  useEffect(() => {
    if (!profile?.id || profile.id === 'undefined' || typeof profile.id !== 'string') return;
    const loadProfile = async () => {
      setLoading(true);
      setInternalBlocked(false);
      setShowBlockConfirm(false);
      const currentUserId = currentUser?.id;
      const isActuallyMe = currentUserId === profile.id;
      setIsMe(isActuallyMe);

      const queries = [
        supabase.from('profiles').select('*').eq('id', profile.id).single(),
        supabase.from('player_stats').select('guess_distribution').eq('user_id', profile.id).maybeSingle()
      ];

      if (currentUserId && !isActuallyMe) {
        queries.push(
          supabase.from('friendships').select('status, user_id, friend_id').or(`and(user_id.eq.${currentUserId},friend_id.eq.${profile.id}),and(user_id.eq.${profile.id},friend_id.eq.${currentUserId})`).maybeSingle(),
          supabase.from('blocks').select('id').eq('blocker_id', currentUserId).eq('blocked_id', profile.id).maybeSingle()
        );
      }

      const results = await Promise.all(queries);

      const { data } = results[0];
      if (data) setFullData(data);

      const { data: statsData } = results[1];
      if (statsData) setPlayerStats(statsData.guess_distribution);

      // 3. Check Relationship if not same user
      if (currentUserId && !isActuallyMe) {
        const { data: friendship } = results[2];
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

        // 4. Check Block Status
        const blockResult = results[3];
        if (blockResult.error) {
          console.warn("Block table access restricted (RLS):", blockResult.error.message);
          setInternalBlocked(false);
        } else {
          setInternalBlocked(!!blockResult.data);
        }
      }

      setLoading(false);
    };
    loadProfile();
  }, [profile?.id, currentUser?.id]);

  if (!profile) return null;

  const baseData = fullData || profile;
  const isBot = baseData?.id === '9a813c24-b662-477d-a74a-6f822d17bbf1';
  
  // Exponential Progress Logic (Standardized)
  const levelData = isBot ? { level: 99, progressPercent: 100, nextLevelBase: 999999 } : getLevelData(baseData.xp || 0);
  const displayData = isBot ? { 
    ...baseData, 
    level: 99, 
    xp: 999999, 
    nickname: 'پەیڤۆک', 
    is_kurdistan: true, 
    country_code: 'IQ',
    games_won: 9999,
    daily_streak: 999,
    kurdish_words_completed: 9999,
    words_without_hints: 9999,
    mode_classic_played: 9999
  } : { ...baseData, level: levelData.level };
  const safeLevel = levelData.level;
  const progressRatio = levelData.progressPercent;
  const nextLevelXP = Math.round(levelData.nextLevelBase);

  // Online Status Logic: Consider online if active in the last 3 minutes
  const isOnline = isBot || isMe || onlineUsers?.has(displayData.id) || (displayData.updated_at && (new Date() - new Date(displayData.updated_at)) < 3 * 60 * 1000);

  // Mastery Logic
  const getMastery = (d) => {
    const modes = [
      { id: 'classic', count: d.mode_classic_played || 0, color: 'text-yellow-400', bg: 'bg-yellow-400/30', icon: 'sports_esports', name: 'پەیڤۆکا کلاسیك' },
      { id: 'lightning', count: d.mode_lightning_played || 0, color: 'text-purple-400', bg: 'bg-purple-400/30', icon: 'bolt', name: 'تایا پەیڤان' },
      { id: 'hard', count: d.mode_hard_played || 0, color: 'text-orange-500', bg: 'bg-orange-500/30', icon: 'military_tech', name: 'پەیڤێن دژوار' },
      { id: 'mystery', count: d.mode_mystery_played || 0, color: 'text-sky-500', bg: 'bg-sky-500/30', icon: 'search', name: 'پەیڤا نەھێنی' }
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
      tierGlow = '';
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
        fils: (displayData.fils || 0) + amount,
        mastery_claims: newClaims
      })
      .eq('id', currentUser?.id);

    if (!error) {
      setFullData({ ...displayData, fils: (displayData.fils || 0) + amount, mastery_claims: newClaims });
      setShowCoinAnim(true);
      setTimeout(() => setShowCoinAnim(false), 3500);
    }
    setClaiming(false);
  };

  const handleReport = async (reasonText) => {
    if (!currentUser || reporting) return;
    setReporting(true);
    triggerHaptic(20);

    const { error } = await supabase
      .from('reports')
      .insert([{ reporter_id: currentUser.id, reported_id: profile.id, reason: reasonText }]);

    setReporting(false);
    setShowReportConfirm(false);

    if (error) {
      console.error("Report Error:", error);
      alert("شاشیەک ڕوویدا: " + error.message);
    } else {
      setShowReportSuccess(true);
      setTimeout(() => {
        setShowReportSuccess(false);
      }, 4000);
    }
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
    { id: 'nobera', name: 'سەرەتایی', condition: (d) => (d.level || 1) >= 10, color: 'text-amber-500', glow: '', IconComponent: Level10Icon, tooltip: 'ئاستێ ١٠ ب دەستڤە بینە' },
    { id: 'palawan', name: 'پەهلەوان', condition: (d) => (d.games_won || 0) >= 100, color: 'text-red-500', glow: '', IconComponent: KawaHammerIcon, tooltip: '١٠٠ یارییان ببە دا ببیە پەهلەوان!' },
    { id: 'expert', name: 'شارەزا', condition: (d) => (d.level || 1) >= 50, color: 'text-cyan-400', glow: '', IconComponent: ExpertDiamondIcon, tooltip: 'ئاستێ ٥٠ ب دەستڤە بینە' },
    { id: 'mamosta', name: 'مامۆستا', condition: (d) => (d.daily_streak || 0) >= 200, color: 'text-yellow-400', glow: '', IconComponent: GraduationCapIcon, tooltip: 'زنجیرەیا نۆکە بگەهینە ٢٠٠ زنجیرەیان' },
    { id: 'shanazi_kurdistan', name: 'شانازیا کوردستانێ', condition: (d) => (d.kurdish_words_completed || 0) >= 1000, color: 'text-emerald-500', glow: '', IconComponent: KurdishShieldIcon, tooltip: '١٠٠٠ پەیڤێن دیتین' },
    { id: 'shanazi_jihani', name: 'شانازیا جیھانی', condition: (d) => (d.words_without_hints || 0) >= 1000, color: 'text-purple-400', glow: '', IconComponent: GlobeIcon, tooltip: '١٠٠٠ پەیڤێن بێهاریکاری ببینە' },
  ];

  const bestMedal = [...medals].reverse().find(m => m.condition(displayData)) || medals[0];
  const isBestUnlocked = bestMedal.condition(displayData);

  const effectiveIsBlocked = internalBlocked || isBlocked;

  if (showFullStats) {
    return (
      <div className="fixed inset-0 z-100 bg-mono-white dark:bg-black overflow-y-auto">
        <StatsView
          profileData={displayData}
          playerStats={playerStats}
          onViewChange={() => setShowFullStats(false)}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 sm:p-12 overflow- pointer-events-auto">
      {/* Heavy Backdrop */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => { playBubblePopSound(); onClose(); }}
        className="absolute inset-0 bg-mono-white/90 dark:bg-black/95 backdrop-blur-sm"
      />

      <Motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        className="relative w-full max-w-sm bg-mono-white/95 dark:bg-black/95 backdrop-blur-md border border-mono-200 dark:border-white/10 rounded-md overflow-hidden flex-col items-center p-4 sm:p-5 text-center max-h-[90vh] overflow-y-auto transition-colors duration-500 shadow-2xl"
        dir="rtl"
      >
        {/* Close Button */}
        <button
          onClick={() => { playBubblePopSound(); onClose(); }}
          className="absolute top-4 left-4 w-8 h-8 rounded-md bg-mono-100 dark:bg-white/5 border border-mono-200 dark:border-white/10 flex items-center justify-center text-mono-400 dark:hover:text-white transition-all z-10"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Level Badge - Reverted to Top Right Corner of Modal */}
        {!isBot && (() => {
          const tier = getLevelTier(safeLevel);
          return (
            <div className="absolute top-4 right-5 z-10 scale-125 origin-top-right">
              <div className="relative w-11 h-12 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 0L95 20V55C95 80 50 115 50 115C50 115 5 80 5 55V20L50 0Z" fill={`url(#medalGradientPublic-${profile.id})`} stroke="white" strokeWidth="4" strokeOpacity="0.2" />
                  <defs>
                    <linearGradient id={`medalGradientPublic-${profile.id}`} x1="50" y1="0" x2="50" y2="115" gradientUnits="userSpaceOnUse">
                      <stop stopColor={tier.stop1} />
                      <stop offset="1" stopColor={tier.stop2} />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="relative z-10 flex flex-col items-center justify-center -mt-1.5">
                  <span className="text-[7.5px] font-black text-slate-950/40 uppercase leading-none mb-0.5">ئاستێ</span>
                  <span className="text-xl font-black text-slate-950 leading-none">{toKuDigits(safeLevel)}</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Avatar Section (Centered) */}
        {(() => {
          const tier = getLevelTier(safeLevel);
          return (
            <div className="relative mb-3 mt-2 flex flex-col items-center">
              <div className="w-28 h-28 rounded-full flex items-center justify-center relative">
                {/* XP Progress Ring */}
                <div className="absolute inset-[-6px] z-0">
                  <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="none" className="stroke-mono-200/20 dark:stroke-white/5" strokeWidth="4" />
                    <Motion.circle
                      cx="50"
                      cy="50"
                      r="44"
                      fill="none"
                      stroke={tier.stop1}
                      strokeWidth="6"
                      strokeLinecap="butt"
                      strokeDasharray="276.46"
                      initial={{ strokeDashoffset: 276.46 }}
                      animate={{
                        strokeDashoffset: 276.46 - (276.46 * (progressRatio / 100)),
                        filter: tier.isLegendary ? `drop-shadow(0 0 8px ${tier.stop1})` : "none"
                      }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                    />
                  </svg>
                </div>

                <div className="w-full h-full rounded-full bg-mono-white dark:bg-slate-900 flex items-center justify-center border-4 border-mono-white dark:border-slate-900 relative z-10 overflow-hidden">
                  {isBot ? (
                    <div className="w-full h-full flex items-center justify-center bg-white dark:bg-[#141414]">
                      <img src="/Peyvok-logo-01.png" alt="Bot Avatar" className="w-[70%] h-[70%] object-contain block dark:hidden" />
                      <img src="/Peyvok-logo-02.png" alt="Bot Avatar" className="w-[70%] h-[70%] object-contain hidden dark:block" />
                    </div>
                  ) : (
                    <Avatar
                      src={displayData.avatar_url}
                      updatedAt={displayData.updated_at}
                      size="2xl"
                      border={false}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Highest Medal Badge - On Avatar Circle */}
                {!isBot && (
                  <div 
                    className="absolute -top-1 -left-1 w-10 h-10 flex items-center justify-center z-50 transition-transform hover:scale-110"
                  >
                    <bestMedal.IconComponent className={`w-9 h-9 drop-shadow-[0_3px_5px_rgba(0,0,0,0.6)] ${!isBestUnlocked ? 'brightness-90 contrast-125' : ''}`} disabled={!isBestUnlocked} />
                  </div>
                )}

                {/* Online Indicator on Avatar Edge */}
                {isOnline && (
                  <div className="absolute bottom-2 right-2 w-7 h-7 bg-emerald-500 border-4 border-mono-white dark:border-black rounded-full z-20" />
                )}
              </div>
            </div>
          );
        })()}

        {/* Identity Section */}
        <div className="space-y-1 mb-3 flex flex-col items-center">
          <div className="flex items-center justify-center gap-2">
            <h2
              className={`text-2xl font-black font-rabar transition-colors duration-500 ${isBot ? 'text-primary' : ''}`}
              style={isBot ? {} : { color: getLevelTier(safeLevel).stop1 }}
            >
              {displayData.nickname}
            </h2>
            <FlagBadge countryCode={displayData.country_code} isInKurdistan={displayData.is_kurdistan} size="sm" />
          </div>

          {mastery && !isBot && (
            <div className="relative mt-2 pt-1 flex items-center justify-center gap-2 group">
              <div
                className="relative flex items-center justify-center cursor-pointer"
                onClick={() => triggerHaptic(10)}
              >
                <Motion.div
                  className={`absolute inset-0 rounded-md ${mastery.bg} opacity-20`}
                />
                <div className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-mono-100 dark:bg-slate-900 border border-mono-200 dark:border-white/10 transition-colors`}>
                  <span className={`material-symbols-outlined text-[15px] ${mastery.color}`}>{mastery.icon}</span>
                  <span className={`text-[9px] uppercase font-black font-rabar ${mastery.color}`}>{mastery.name}</span>
                </div>
              </div>

              {isMe && mastery.tierLevel > (displayData.mastery_claims?.[mastery.id] || 0) && (
                <Motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClaimMastery}
                  disabled={claiming}
                  className="relative z-20 flex items-center gap-1 bg-emerald-500 text-slate-950 font-black text-[10px] py-1.5 px-3 rounded-md border border-emerald-400/50 transition-all hover:bg-emerald-400 shadow-sm"
                >
                  {claiming ? '...' : 'وەرگرتن'}
                  <FilsIcon className="w-3.5 h-3.5" />
                </Motion.button>
              )}
            </div>
          )}

          {/* Social Action Icons Row */}
          {!isMe && !isBot && (
            <div className="flex items-center justify-center gap-3 mt-4 pt-1">
              {/* Friend Action */}
              {relStatus === 'friend' && !effectiveIsBlocked && (
                <button onClick={() => { triggerHaptic(10); setShowUnfriendConfirm(true); }} className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all shadow-sm" title="لابرنا ھەڤالینیێ">
                  <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                </button>
              )}
              {relStatus === 'none' && !effectiveIsBlocked && (
                <button onClick={handleSendFriendRequest} className="w-10 h-10 rounded-full bg-mono-900 dark:bg-slate-100 text-mono-50 dark:text-slate-950 flex items-center justify-center hover:opacity-90 transition-all shadow-md" title="ببە ھەڤاڵ">
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                </button>
              )}
              {relStatus === 'pending_sent' && !effectiveIsBlocked && (
                <button onClick={handleDeclineFriendRequest} className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all shadow-sm" title="پەشێمان بوون">
                  <span className="material-symbols-outlined text-[20px]">hourglass_top</span>
                </button>
              )}

              {/* Report Action */}
              <button onClick={() => { triggerHaptic(10); setShowReportConfirm(true); }} className="w-10 h-10 rounded-full bg-mono-100 dark:bg-white/5 border border-mono-200 dark:border-white/10 flex items-center justify-center text-mono-500 dark:text-white/40 hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/20 transition-all shadow-sm" title="ڕیپۆرتکرن / سکاڵا">
                <span className="material-symbols-outlined text-[20px]">flag</span>
              </button>

              {/* Block Action */}
              {onToggleBlock && (
                <button onClick={() => { triggerHaptic(10); setShowBlockConfirm(true); }} className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-sm ${effectiveIsBlocked ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-mono-100 dark:bg-white/5 border-mono-200 dark:border-white/10 text-mono-500 dark:text-white/40 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20'}`} title={effectiveIsBlocked ? 'لابرنا بلۆکی' : 'بلۆککرن'}>
                  <span className="material-symbols-outlined text-[20px]">{effectiveIsBlocked ? 'block' : 'person_off'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        {!loading && !isBot && (() => {
          const tier = getLevelTier(safeLevel);
          return (
            <Motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full mb-3 pt-3 border-t border-mono-200 dark:border-white/5 space-y-2"
            >
              <div className="w-full relative overflow-hidden px-2">
                <div className="flex justify-between items-end mb-1.5 relative z-10">
                  <div className="text-right">
                    <span className="text-[8px] font-black  uppercase  text-mono-400 dark:text-white/40 block">ئەزموون (XP)</span>
                    <span className="text-base font-black text-mono-900 dark:text-white ">{displayData.xp || 0}</span>
                  </div>
                  <span className="text-[9px] font-black text-mono-300 dark:text-white/20">/ {nextLevelXP}</span>
                </div>
                <div className="w-full h-2 bg-mono-100 dark:bg-slate-950 rounded-md overflow-hidden relative z-10 shadow-inner border border-mono-200 dark:border-white/5">
                  <Motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressRatio}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    className="h-full rounded-md transition-all duration-500"
                    style={{ background: `linear-gradient(to right, ${tier.stop1}, ${tier.stop2})` }}
                  />
                </div>
              </div>

              <div className="px-2 pb-2">
                <button
                  onClick={() => { triggerHaptic(10); setShowFullStats(true); }}
                  className="w-full py-2.5 mt-2 rounded-md bg-mono-100 dark:bg-white/5 border border-mono-200 dark:border-white/10 text-mono-900 dark:text-white font-black text-sm hover:bg-mono-200 dark:hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2 font-rabar shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">query_stats</span>
                  <span>ئامار و دەستکەفت</span>
                </button>
              </div>

              {!effectiveIsBlocked && (
                <div className="w-full mt-2 pt-2 border-t border-mono-200 dark:border-white/5">
                  <AnimatePresence>
                    {isMedalsExpanded && (
                      <Motion.div 
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="bg-mono-50 dark:bg-mono-900/50 p-4 rounded-md border border-mono-200 dark:border-mono-800 flex flex-col items-center noise-grain relative overflow-hidden mb-2"
                      >
                        <div 
                          className="w-full flex items-center justify-center mb-4"
                        >
                          <span className="text-sm font-black text-mono-400 dark:text-mono-500 uppercase text-center whitespace-nowrap">دەستکەڤتێن {displayData.nickname || 'یاریزان'}</span>
                        </div>

                        <div className="flex flex-wrap justify-center gap-x-2 gap-y-3 px-0 w-full">
                          {medals.map((m) => {
                            const isUnlocked = m.condition(displayData);
                            return (
                              <div
                                key={m.id}
                                className={`flex flex-col items-center justify-start py-3 transition-all duration-300 w-[30%] min-w-[90px] ${!isUnlocked ? 'opacity-50 grayscale' : ''}`}
                              >
                                <div className="h-10 mb-2 flex items-center justify-center relative">
                                  <m.IconComponent className={`w-9 h-9 transition-all hover:scale-110 ${isUnlocked ? '' : 'text-slate-500'}`} disabled={!isUnlocked} />
                                </div>
                                <span className={`text-[11px] font-black font-rabar mb-0.5 text-center drop-shadow-sm ${isUnlocked ? m.color : 'text-mono-500 dark:text-mono-400'}`}>
                                  {m.name}
                                </span>
                                <span className="text-[8px] font-bold text-mono-400 dark:text-mono-500 text-center leading-tight">
                                  {m.tooltip}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </Motion.div>
          );
        })()}

        {/* Bottom Section (Conditional) */}
        {(() => {
          const hasConfirm = showUnfriendConfirm || showBlockConfirm || showReportSuccess;
          const showBottom = isBot || isMe || effectiveIsBlocked || relStatus === 'friend' || relStatus === 'pending_received' || hasConfirm;
          
          if (!showBottom) return null;

          return (
            <div className="w-full space-y-2 mt-auto flex flex-col pt-3 border-t border-mono-200 dark:border-white/5">
              {isMe ? (
                <div className="w-full py-3 rounded-md bg-primary/10 border border-primary/20 text-primary font-bold text-sm text-center shadow-sm">ئەڤە پڕۆفایلا تەیا تایبەتە</div>
              ) : showReportSuccess ? (
                <Motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full py-3 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-500 font-bold text-sm text-center flex items-center justify-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  سکاڵا بە سەرکەوتوویی نێردرا، سوپاس
                </Motion.div>
              ) : showBlockConfirm ? (
                <Motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center gap-3 bg-red-500/10 border border-red-500/20 py-3 px-4 rounded-md">
                  <span className="text-xs font-bold text-red-600 dark:text-red-200">دڵنیایی ژ بلۆککرنا ڤی کەسی؟</span>
                  <div className="flex gap-2 w-full">
                    <button onClick={() => { triggerHaptic(10); onToggleBlock(effectiveIsBlocked); setShowBlockConfirm(false); }} className="flex-1 text-white bg-red-600 hover:bg-red-500 py-2 rounded-md text-xs font-black">بەڵێ، بلۆک</button>
                    <button onClick={() => { triggerHaptic(10); setShowBlockConfirm(false); }} className="flex-1 text-mono-600 dark:text-slate-300 bg-mono-100 dark:bg-white/10 hover:bg-mono-200 dark:hover:bg-white/20 py-2 rounded-md text-xs font-bold">نەخێر</button>
                  </div>
                </Motion.div>
              ) : showUnfriendConfirm ? (
                <Motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center gap-3 bg-red-500/10 border border-red-500/20 py-3 px-4 rounded-md">
                  <span className="text-xs font-bold text-red-600 dark:text-red-200">دڵنیایی ژ لابرنا ڤی ھەڤاڵی؟</span>
                  <div className="flex gap-2 w-full">
                    <button onClick={() => { handleUnfriend(); setShowUnfriendConfirm(false); }} className="flex-1 text-white bg-red-600 hover:bg-red-500 py-2 rounded-md text-xs font-black transition-colors">بەڵێ</button>
                    <button onClick={() => { triggerHaptic(10); setShowUnfriendConfirm(false); }} className="flex-1 text-mono-600 dark:text-slate-300 bg-mono-100 dark:bg-white/10 hover:bg-mono-200 dark:hover:bg-white/20 py-2 rounded-md text-xs font-bold transition-colors">نەخێر</button>
                  </div>
                </Motion.div>
              ) : effectiveIsBlocked ? (
                <div className="w-full py-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-sm text-center flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">block</span>
                  ئەڤ یاریزانە ھاتیە بلۆککرن
                </div>
              ) : relStatus === 'pending_received' ? (
                <div className="flex gap-2 w-full">
                  <button onClick={handleAcceptFriendRequest} className="flex-2 py-2.5 rounded-md bg-emerald-500 text-slate-950 font-black text-sm hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-2 font-rabar shadow-sm w-full">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    وەربگرە
                  </button>
                  <button onClick={handleDeclineFriendRequest} className="flex-1 py-2.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-500 font-black text-sm hover:bg-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 w-1/3">
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              ) : relStatus === 'friend' || isBot ? (
                <button
                  onClick={() => { triggerHaptic(20); onOpenChat(displayData || profile); }}
                  className="w-full py-2.5 rounded-md bg-primary text-slate-950 font-black text-sm hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-2 font-rabar shadow-sm"
                >
                  <span>نامەیێ بھنێرە</span>
                  <span className="material-symbols-outlined text-lg">chat</span>
                </button>
              ) : null}
            </div>
          );
        })()}
      </Motion.div>

      {/* Report Modal Overlay */}
      <AnimatePresence>
        {showReportConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setShowReportConfirm(false)}
            />
            <Motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-[300px] bg-[#1a0f0a] border border-orange-500/30 rounded-xl p-5 flex flex-col items-center shadow-2xl overflow-hidden"
              dir="rtl"
            >
              <h3 className="text-sm font-bold font-rabar text-orange-200 mb-5 drop-shadow-sm">ئەگەرێ سکاڵایێ چیە؟</h3>
              <div className="grid grid-cols-2 gap-2.5 w-full mb-3">
                <button onClick={() => handleReport('ئاخفتنێن نەجوان')} disabled={reporting} className="text-white bg-[#ff5a00] hover:bg-[#ff7a2e] py-3 rounded-md text-[12px] font-black disabled:opacity-50 transition-all active:scale-95 shadow-sm">ئاخفتنێن نەجوان</button>
                <button onClick={() => handleReport('ناڤێ نەجوان')} disabled={reporting} className="text-white bg-[#ff5a00] hover:bg-[#ff7a2e] py-3 rounded-md text-[12px] font-black disabled:opacity-50 transition-all active:scale-95 shadow-sm">ناڤێ نەجوان</button>
                <button onClick={() => handleReport('فێلکرن')} disabled={reporting} className="text-white bg-[#ff5a00] hover:bg-[#ff7a2e] py-3 rounded-md text-[12px] font-black disabled:opacity-50 transition-all active:scale-95 shadow-sm">فێلکرن</button>
                <button onClick={() => handleReport('بێزارکرن')} disabled={reporting} className="text-white bg-[#ff5a00] hover:bg-[#ff7a2e] py-3 rounded-md text-[12px] font-black disabled:opacity-50 transition-all active:scale-95 shadow-sm">بێزارکرن</button>
              </div>
              <button onClick={() => { triggerHaptic(10); setShowReportConfirm(false); }} className="w-full mt-1 text-orange-100/70 bg-[#2d1b11] hover:bg-[#3d2517] py-2.5 rounded-md text-[13px] font-bold transition-colors">پەشێمان بوون</button>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>

      <CoinAnimation trigger={showCoinAnim} amount={rewardAmount} />
    </div>
  );
}

