import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { AVATARS, DEFAULT_AVATAR } from '../data/avatars';
import Avatar from './Avatar';
import FlagBadge from './FlagBadge';
import { motion as Motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import PublicProfileModal from './PublicProfileModal';
import { FilsIcon } from './CurrencyIcon';
import { triggerHaptic } from '../utils/haptics';
import { toKuDigits } from '../utils/formatters';
import { useUser } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { useAudio } from '../context/AudioContext';
import { getLevelFromXP, getLevelTier, getLevelData } from '../utils/progression';


export default function LeaderboardView({ onOpenChat }) {
  const {
    user,
    userNickname,
    userAvatar,
    countryCode,
    isInKurdistan,
    lastProfileUpdate,
    handleToggleBlock: toggleBlockInContext,
    loadingAuth,
    onlineCount
  } = useUser();

  const {
    currentXP: userXP,
    level: _userLevel,
    fils: _userFils,
    useGameLoading: _useGameLoading
  } = useGame();

  const userId = user?.id;
  const { playTabSound } = useAudio();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState('global');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Caching for instant load
  const cacheRef = useRef({ global: null, friends: null });

  // Pagination states
  const pageRef = useRef(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalPlayersCount, setTotalPlayersCount] = useState(0);
  const [trueRank, setTrueRank] = useState(null);
  const ITEMS_PER_PAGE = 20;

  const bgRef = useRef(null);
  const fetchTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    triggerHaptic(10);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackgroundClick = (e) => {
    // Only trigger if clicking the direct container to avoid item capture
    if (e.target === e.currentTarget || e.target.classList.contains('bg-trigger-zone')) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      bgRef.current?.pulse(x, y);
    }
  };

  const handleToggleBlock = async (currentStatus) => {
    if (!selectedPlayer || !userId || userId === 'undefined') return;
    const success = await toggleBlockInContext(selectedPlayer.id, currentStatus);
    if (success) {
      if (!currentStatus) alert("یاریزان ھاتە بلۆککرن!");
      else alert("بلۆک ھاتە لابرن!");
      setSelectedPlayer(null);
    }
  };

  const fetchData = useCallback(async (isLoadMore = false) => {
    // 1. HARDENED GUARD: Reject invalid, undefined, or loading states
    if (loadingAuth || !userId || userId === 'undefined' || userId.length < 5) {
      if (!isLoadMore) setLoading(false);
      return;
    }
    
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);

    return new Promise((resolve) => {
      fetchTimeoutRef.current = setTimeout(async () => {
        const currentPage = isLoadMore ? pageRef.current + 1 : 0;

        if (!isLoadMore) {
          if (!cacheRef.current[view]) {
            setLoading(true);
          } else {
            setLeaders(cacheRef.current[view]);
          }
          setError(null);
        } else {
          setLoadingMore(true);
        }

        try {
      let leaderData = [];

      if (view === 'friends') {
        // 1. Get all accepted friendships
        const { data: friendships, error: fError } = await supabase
          .from('friendships')
          .select('*')
          .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
          .eq('status', 'accepted');

        if (fError) throw fError;

        // 2. Map to a list of IDs including current user
        const friendIds = [userId];
        friendships.forEach(f => {
          friendIds.push(f.user_id);
          friendIds.push(f.friend_id);
        });
        const uniqueIds = [...new Set(friendIds)];

        // 3. Fetch profiles for those IDs
        const { data, error: pError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', uniqueIds)
          .order('xp', { ascending: false })
          .order('updated_at', { ascending: true });

        if (pError) throw pError;
        leaderData = data || [];
        // Apply local pagination for friends since we fetched them all
        const startIdx = currentPage * ITEMS_PER_PAGE;
        const paginatedFriends = leaderData.slice(startIdx, startIdx + ITEMS_PER_PAGE);
        leaderData = paginatedFriends;
      } else {
        // GLOBAL VIEW - Order strictly by XP (Ground Truth)
        const { data, error: leaderError } = await supabase
          .from('profiles')
          .select('*')
          .neq('nickname', 'Admin_4rasti')
          .neq('nickname', 'ADMIN_PEYVOK')
          .neq('nickname', 'پەیڤۆک')
          .neq('id', '9a813c24-b662-477d-a74a-6f822d17bbf1')
          .neq('id', '66bbf4d5-333a-4748-8529-ecd5bae9f3a4')
          .order('xp', { ascending: false })
          .order('updated_at', { ascending: true })
          .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1);

        if (leaderError) throw leaderError;
        leaderData = data || [];
      }

      if (isLoadMore) {
        setLeaders(prev => {
          // Prevent duplicates by checking IDs
          const existingIds = new Set(prev.map(p => p.id));
          const newItems = leaderData.filter(p => !existingIds.has(p.id));
          const next = [...prev, ...newItems];
          cacheRef.current[view] = next;
          return next;
        });
      } else {
        setLeaders(leaderData);
        cacheRef.current[view] = leaderData;
      }

      pageRef.current = currentPage;
      setHasMore(leaderData.length === ITEMS_PER_PAGE);

          // Rank is now calculated asynchronously by GameContext and exposed globally
        } catch (err) {
          console.warn("Leaderboard fetch error:", err);
          setError(true);
        } finally {
          if (!isLoadMore) setLoading(false);
          setLoadingMore(false);
          resolve();
        }
      }, 300);
    });
  }, [loadingAuth, userId, view]);

  useEffect(() => {
    // When view changes, reset to page 0
    fetchData(false);

    const handleFocus = () => fetchData(false);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [view, userId, fetchData]);

  // Real-time XP updates
  useEffect(() => {
    const profilesSub = supabase.channel('public:profiles:leaderboard')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
        const updatedProfile = payload.new;
        if (!updatedProfile || typeof updatedProfile.xp === 'undefined') return;
        
        setLeaders(prev => {
           const idx = prev.findIndex(p => p.id === updatedProfile.id);
           if (idx === -1) return prev; // Not currently loaded in the list
           
           let next = [...prev];
           // Only update if xp or other relevant stats changed
           if (next[idx].xp === updatedProfile.xp) return prev;
           
           next[idx] = { ...next[idx], ...updatedProfile };
           next.sort((a, b) => b.xp - a.xp); // Re-sort descending by XP
           
           cacheRef.current[view] = next; // Sync cache
           return next;
        });
      }).subscribe();
      
    return () => {
      supabase.removeChannel(profilesSub);
    };
  }, [view]);

  // Track Total Players
  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true })
        .neq('nickname', 'Admin_4rasti')
        .neq('nickname', 'ADMIN_PEYVOK')
        .neq('nickname', 'پەیڤۆک')
        .neq('id', '9a813c24-b662-477d-a74a-6f822d17bbf1')
        .neq('id', '66bbf4d5-333a-4748-8529-ecd5bae9f3a4');
      if (isMounted && count !== null) setTotalPlayersCount(count);
    };
    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute absolute true rank for sticky bar
  useEffect(() => {
    // 1. Try to find in current page first for instant update
    if (view === 'global') {
      const index = leaders.findIndex(l => l.id === userId);
      if (index !== -1) {
         setTrueRank(index + 1);
         return; // We found it locally, no need for DB
      }
    }
  }, [leaders, userId, view]);

  useEffect(() => {
    let isMounted = true;
    const fetchTrueRank = async () => {
      // If we already found them in the loaded global list, don't spam the DB
      const localIndex = cacheRef.current['global']?.findIndex(l => l.id === userId);
      if (localIndex !== undefined && localIndex !== -1) {
        if (isMounted) setTrueRank(localIndex + 1);
        return;
      }

      // 2. Fetch from DB as fallback
      if (userXP !== undefined && view === 'global') {
         try {
           // Query 1: strictly greater XP
           const { count: countGreater } = await supabase
             .from('profiles')
             .select('id', { count: 'exact', head: true })
             .gt('xp', userXP)
             .neq('nickname', 'Admin_4rasti')
             .neq('id', '9a813c24-b662-477d-a74a-6f822d17bbf1')
             .neq('id', '66bbf4d5-333a-4748-8529-ecd5bae9f3a4');
             
           // Query 2: same XP but older (better) updated_at
           let countSame = 0;
           if (lastProfileUpdate) {
             let formattedDate = lastProfileUpdate;
             try {
               formattedDate = new Date(lastProfileUpdate).toISOString();
             } catch(_e) {
               console.warn("Invalid date format", lastProfileUpdate);
             }
             const { count } = await supabase
               .from('profiles')
               .select('id', { count: 'exact', head: true })
               .eq('xp', userXP)
               .lt('updated_at', formattedDate)
               .neq('nickname', 'Admin_4rasti')
               .neq('id', '9a813c24-b662-477d-a74a-6f822d17bbf1')
               .neq('id', '66bbf4d5-333a-4748-8529-ecd5bae9f3a4');
             countSame = count || 0;
           }

           if (isMounted && countGreater !== null) {
             setTrueRank(countGreater + countSame + 1);
           }
         } catch (e) {
           console.warn("Error fetching true rank", e);
         }
      }
    };
    
    if (userId) fetchTrueRank();
    
    return () => { isMounted = false; };
  }, [userId, userXP, lastProfileUpdate, view]);


  return (
    <div
      onClick={handleBackgroundClick}
      className="w-full max-w-full px-4 md:px-6 pb-56 h-full relative animate-in fade-in duration-700 bg-mono-50 dark:bg-black overflow-x-hidden pt-[calc(env(safe-area-inset-top,24px)+32px)] md:pt-20 text-right bg-trigger-zone transition-colors"
    >


      <div className="relative z-10">
        <div className="flex flex-col items-center mb-8 max-w-md mx-auto text-center relative mt-2">
          <Motion.div 
            animate={{ y: [-2, 2, -2] }} 
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="z-30 relative -mb-3 drop-shadow-sm"
          >
             <svg viewBox="0 0 100 100" className="w-12 h-12">
               <defs>
                 <linearGradient id={`refGold-title`} x1="0%" y1="0%" x2="0%" y2="100%">
                   <stop offset="0%" stopColor="#FFD54F" />
                   <stop offset="50%" stopColor="#FFC107" />
                   <stop offset="100%" stopColor="#FFA000" />
                 </linearGradient>
               </defs>

               <path d="M15 85 Q50 90 85 85 L85 75 Q50 80 15 75 Z" fill="#FF8F00" stroke="#3E2723" strokeWidth="2" />
               <path d="M15 75 Q50 80 85 75 L85 68 Q50 73 15 68 Z" fill={`url(#refGold-title)`} stroke="#3E2723" strokeWidth="2" />
               <path d="M15 68 Q50 73 85 68 L95 40 L75 55 L50 20 L25 55 L5 40 Z" fill={`url(#refGold-title)`} stroke="#3E2723" strokeWidth="2" />

               <Motion.path d="M50 45 L58 55 L50 65 L42 55 Z" fill="#7E57C2" stroke="#3E2723" strokeWidth="1.5" />
               <Motion.path d="M50 48 L54 55 L50 62 L46 55 Z" fill="white" fillOpacity="0.4" />

               {[
                 { cx: 5, cy: 40, r: 5 }, { cx: 25, cy: 55, r: 4 }, { cx: 50, cy: 20, r: 6 }, { cx: 75, cy: 55, r: 4 }, { cx: 95, cy: 40, r: 5 }
               ].map((b, i) => (
                 <g key={i}>
                   <circle cx={b.cx || 0} cy={b.cy || 0} r={b.r || 0} fill="#4DD0E1" stroke="#3E2723" strokeWidth="1.5" />
                   <circle cx={(b.cx - b.r / 3) || 0} cy={(b.cy - b.r / 3) || 0} r={(b.r / 4) || 0} fill="white" fillOpacity="0.6" />
                 </g>
               ))}

               <circle cx="30" cy="62" r="2.5" fill="#4DD0E1" stroke="#3E2723" strokeWidth="1" />
               <circle cx="40" cy="64" r="2.5" fill="#4DD0E1" stroke="#3E2723" strokeWidth="1" />
               <circle cx="60" cy="64" r="2.5" fill="#4DD0E1" stroke="#3E2723" strokeWidth="1" />
               <circle cx="70" cy="62" r="2.5" fill="#4DD0E1" stroke="#3E2723" strokeWidth="1" />
               <path d="M50 25 L50 40" stroke="white" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" />
             </svg>
          </Motion.div>
          
          <div className="relative z-20 flex flex-col items-center">
             <h2 className="text-[24px] font-black font-rabar uppercase text-mono-900 dark:text-mono-50 drop-shadow-sm mb-6">رێزبەندی</h2>
          </div>
        </div>

        {/* Top Tab Swapper - Synced Card Style */}
        <div className="flex p-1 rounded-md border mb-3 w-full max-w-xs mx-auto relative z-30 shadow-sm transition-all overflow-hidden bg-mono-100 dark:bg-mono-900 border-mono-200 dark:border-mono-800 duration-300">
          {['global', 'friends'].map((tab) => {
            const isActive = view === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  triggerHaptic(10);
                  playTabSound();
                  setView(tab);
                }}
                className={`flex-1 py-2.5 px-4 rounded-md font-black text-sm transition-all duration-300 relative z-10 ${isActive
                  ? 'text-mono-50 dark:text-mono-50'
                  : 'text-mono-500 hover:text-mono-900 dark:text-mono-400 dark:hover:text-mono-100'
                  }`}
              >
                {isActive && (
                  <Motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-mono-900 dark:bg-mono-800 rounded-sm shadow-sm"
                    transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                  />
                )}
                <span className="relative z-20 uppercase tracking-normal font-rabar">
                  {tab === 'global' ? 'جیھانی' : 'ھەڤال'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Stats - Background-less */}
        <div className="flex items-center justify-center gap-4 px-4 pb-8 relative z-30 w-full max-w-xs mx-auto">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-[11.5px] font-bold text-mono-500 dark:text-mono-400 font-rabar pt-0.5">ئۆنڵاین:</span>
            <span className="text-[13px] font-black text-mono-900 dark:text-white tabular-nums drop-shadow-sm">{toKuDigits(onlineCount)}</span>
          </div>
          
          <div className="w-px h-3 bg-mono-300 dark:bg-mono-700"></div>
          
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-mono-400 dark:text-mono-500">group</span>
            <span className="text-[11.5px] font-bold text-mono-500 dark:text-mono-400 font-rabar pt-0.5">هەمی:</span>
            <span className="text-[13px] font-black text-mono-900 dark:text-white tabular-nums drop-shadow-sm">{totalPlayersCount > 0 ? toKuDigits(totalPlayersCount) : '-'}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-48 gap-4">
              <div className="w-10 h-10 border-2 border-mono-200 dark:border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="font-black text-mono-400 dark:text-mono-700 uppercase text-[10px] tracking-widest">LOADING...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-48 gap-4">
              <span className="material-symbols-outlined text-4xl text-red-500/50">cloud_off</span>
              <span className="font-black text-mono-400 font-rabar">کێشەیەک د پەیوەندیێ دا هەیە</span>
            </div>
          ) : (
            <Motion.div
              key={view}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05, delayChildren: 0.05 }
                },
                exit: { opacity: 0, transition: { duration: 0.2 } }
              }}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-3 px-1 md:px-0 max-w-2xl mx-auto pb-40"
            >
              {leaders.map((player, index) => {
                // Sequential Ranking based on the list index (matches exact spot)
                // Since pagination uses ITEMS_PER_PAGE, we calculate absolute rank
                let rank = (pageRef.current * ITEMS_PER_PAGE) + index + 1;
                // Note: The map renders all leaders concatenated, so `index` is already absolute!
                rank = index + 1;
                
                const isTop3 = rank <= 3;
                const isMe = userId && (player.id === userId);
                const effectiveAvatar = isMe ? userAvatar : (player.avatar_url || 'default');
                const effectiveNickname = isMe ? userNickname : player.nickname;
                const effectiveXP = isMe ? userXP : player.xp;
                const progressDecimal = getLevelData(effectiveXP).progressPercent / 100;
                const effectiveCountryCode = isMe ? countryCode : player.country_code;
                const effectiveIsInKurdistan = isMe ? isInKurdistan : player.is_kurdistan;

                return (
                  <Motion.div
                    layout
                    key={player.id}
                    variants={{
                      hidden: { opacity: 0, y: 15, scale: 0.98 },
                      visible: { opacity: 1, y: 0, scale: 1 },
                      exit: { opacity: 0, scale: 0.98 }
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    whileHover={
                      isTop3
                        ? { scale: 1.02 }
                        : { scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.05)' }
                    }
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { triggerHaptic(10); setSelectedPlayer({ ...player, avatar_url: effectiveAvatar, nickname: effectiveNickname, xp: effectiveXP }); }}
                    className={`flex flex-row items-center justify-between p-2.5 px-5 rounded-md border relative transition-all cursor-pointer duration-300 ${
                      rank === 1
                        ? 'bg-[#a855f7] border-transparent text-white shadow-sm'
                        : rank === 2
                        ? 'bg-[#ffcc00] border-transparent text-amber-950 shadow-sm'
                        : rank === 3
                        ? 'bg-[#0ea5e9] border-transparent text-white shadow-sm'
                        : isMe
                        ? 'bg-primary/10 dark:bg-primary/20 border-primary ring-1 ring-primary/50 shadow-[0_0_12px_rgba(var(--primary),0.4)] text-mono-900 dark:text-mono-50 z-20'
                        : 'bg-mono-white dark:bg-mono-800 border-mono-200 dark:border-mono-700 text-mono-900 dark:text-mono-50'
                    }`}
                    style={{
                      zIndex: isTop3 ? 50 : 1 // Ensure top 3 cards have higher z-index for floating crowns
                    }}
                  >

                    {/* Sleek Metallic Rank Number (MINIMALIST) */}
                    <div className="flex items-center justify-center w-10 shrink-0 z-10 relative">
                      {rank <= 3 && (
                        <Motion.div
                          initial={{ y: 0, rotate: rank === 1 ? -5 : rank === 2 ? 5 : 0 }}
                          animate={{
                            y: [-2, 2, -2],
                            rotate: rank === 1 ? [-5, 5, -5] : rank === 2 ? [5, -5, 5] : [-3, 3, -3]
                          }}
                          transition={{ repeat: Infinity, duration: rank === 1 ? 4 : rank === 2 ? 4.5 : 5, ease: "easeInOut" }}
                          className={`absolute -top-7 left-1/2 -translate-x-1/2 z-30 pointer-events-none`}
                        >
                          <div className="relative w-9 h-9 flex items-center justify-center">
                            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_3px_6px_rgba(0,0,0,0.3)]">
                              <defs>
                                <linearGradient id={`refGold-${player.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#FFD54F" />
                                  <stop offset="50%" stopColor="#FFC107" />
                                  <stop offset="100%" stopColor="#FFA000" />
                                </linearGradient>
                                <linearGradient id={`refSilver-${player.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#F8FAFC" />
                                  <stop offset="50%" stopColor="#CBD5E1" />
                                  <stop offset="100%" stopColor="#94A3B8" />
                                </linearGradient>
                                <linearGradient id={`refBronze-${player.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#FFCC80" />
                                  <stop offset="50%" stopColor="#FB8C00" />
                                  <stop offset="100%" stopColor="#E65100" />
                                </linearGradient>
                              </defs>

                              {/* Dual-Band Base */}
                              <path
                                d="M15 85 Q50 90 85 85 L85 75 Q50 80 15 75 Z"
                                fill={rank === 1 ? "#FF8F00" : rank === 2 ? "#475569" : "#BF360C"}
                                stroke="#3E2723" strokeWidth="2"
                              />
                              <path
                                d="M15 75 Q50 80 85 75 L85 68 Q50 73 15 68 Z"
                                fill={rank === 1 ? `url(#refGold-${player.id})` : rank === 2 ? `url(#refSilver-${player.id})` : `url(#refBronze-${player.id})`}
                                stroke="#3E2723" strokeWidth="2"
                              />

                              {/* 5-Point Crown Body (matching reference shape) */}
                              <path
                                d="M15 68 Q50 73 85 68 L95 40 L75 55 L50 20 L25 55 L5 40 Z"
                                fill={rank === 1 ? `url(#refGold-${player.id})` : rank === 2 ? `url(#refSilver-${player.id})` : `url(#refBronze-${player.id})`}
                                stroke="#3E2723" strokeWidth="2"
                              />

                              {/* Central Diamond Gem (Purple) with Shine Animation */}
                              <Motion.path
                                d="M50 45 L58 55 L50 65 L42 55 Z"
                                fill={rank === 1 ? "#7E57C2" : rank === 2 ? "#3B82F6" : "#EF4444"}
                                stroke="#3E2723" strokeWidth="1.5"
                                animate={{
                                  filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"],
                                }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                              />

                              {/* Glowing Highlight for Diamond */}
                              <Motion.path
                                d="M50 48 L54 55 L50 62 L46 55 Z"
                                fill="white" fillOpacity="0.4"
                                animate={{ opacity: [0.2, 0.6, 0.2] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                              />

                              {/* 5 Beads on Points (Teal) with Shine */}
                              {[
                                { cx: 5, cy: 40, r: 5 },
                                { cx: 25, cy: 55, r: 4 },
                                { cx: 50, cy: 20, r: 6 },
                                { cx: 75, cy: 55, r: 4 },
                                { cx: 95, cy: 40, r: 5 }
                              ].map((b, i) => (
                                <g key={i}>
                                  <Motion.circle
                                    cx={b.cx || 0} cy={b.cy || 0} r={b.r || 0}
                                    fill="#4DD0E1" stroke="#3E2723" strokeWidth="1.5"
                                    animate={{ filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"] }}
                                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
                                  />
                                  <Motion.circle
                                    cx={(b.cx - b.r / 3) || 0} cy={(b.cy - b.r / 3) || 0} r={(b.r / 4) || 0}
                                    fill="white" fillOpacity="0.6"
                                    animate={{ opacity: [0.4, 0.9, 0.4] }}
                                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
                                  />
                                </g>
                              ))}

                              {/* Small Decorative Beads on Body */}
                              <circle cx="30" cy="62" r="2.5" fill="#4DD0E1" stroke="#3E2723" strokeWidth="1" />
                              <circle cx="40" cy="64" r="2.5" fill="#4DD0E1" stroke="#3E2723" strokeWidth="1" />
                              <circle cx="60" cy="64" r="2.5" fill="#4DD0E1" stroke="#3E2723" strokeWidth="1" />
                              <circle cx="70" cy="62" r="2.5" fill="#4DD0E1" stroke="#3E2723" strokeWidth="1" />

                              {/* Highlight Reflections */}
                              <path d="M50 25 L50 40" stroke="white" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" />
                            </svg>
                          </div>
                        </Motion.div>
                      )}
                      <span className={`text-2xl font-black italic tracking-normal relative z-10 ${
                        rank === 1
                          ? 'text-white'
                          : rank === 2
                          ? 'text-amber-950'
                          : rank === 3
                          ? 'text-white'
                          : 'text-mono-900 dark:text-mono-50'
                      }`}>
                        {toKuDigits(rank)}
                      </span>
                    </div>

                    {/* Avatar Section */}
                    <div className="flex items-center gap-3 z-10 px-1">
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        {/* XP Progress Ring */}
                        <div className="absolute inset-[-4px] z-0">
                          <svg className={`w-full h-full -rotate-90 overflow-visible ${
                            isTop3 ? 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]' : ''
                          }`} viewBox="0 0 100 100">
                             <circle
                               cx="50"
                               cy="50"
                               r="44"
                               fill="none"
                               className={
                                 rank === 1
                                   ? 'stroke-white/25'
                                   : rank === 2
                                   ? 'stroke-amber-950/20'
                                   : rank === 3
                                   ? 'stroke-white/25'
                                   : 'stroke-mono-200/20 dark:stroke-white/5'
                               }
                               strokeWidth={isTop3 ? "6" : "4"}
                             />
                             <Motion.circle
                                cx="50"
                                cy="50"
                                r="44"
                                fill="none"
                                stroke={getLevelTier(getLevelFromXP(effectiveXP)).stop1}
                                strokeWidth={isTop3 ? "10" : "8"}
                                strokeLinecap="butt"
                                strokeDasharray="276.46"
                                initial={{ strokeDashoffset: 276.46 }}
                                animate={{ 
                                   strokeDashoffset: 276.46 - (276.46 * progressDecimal),
                                   filter: getLevelTier(getLevelFromXP(effectiveXP)).isLegendary ? `drop-shadow(0 0 5px ${getLevelTier(getLevelFromXP(effectiveXP)).stop1})` : "none"
                                }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                             />
                          </svg>
                        </div>

                        {/* Clean Avatar */}
                        <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm bg-mono-100 dark:bg-white/5 shrink-0 relative z-10 border border-mono-200 dark:border-white/10">
                          <Avatar
                            src={effectiveAvatar}
                            updatedAt={isMe ? lastProfileUpdate : player.updated_at}
                            size="full"
                            className="rounded-full object-cover w-full h-full"
                            border={false}
                          />
                        </div>

                        {/* Minimal Overlapping Flag Badge */}
                        {(effectiveCountryCode || effectiveIsInKurdistan) && (
                          <div className={`absolute -bottom-1.5 -right-1.5 z-20 w-[18px] h-[18px] rounded-full overflow-hidden border-[1.5px] shadow-sm bg-white dark:bg-mono-900 flex items-center justify-center scale-90 ${
                            rank === 1
                              ? 'border-[#a855f7]'
                              : rank === 2
                              ? 'border-[#ffcc00]'
                              : rank === 3
                              ? 'border-[#0ea5e9]'
                              : 'border-white dark:border-mono-800'
                          }`}>
                            <FlagBadge countryCode={effectiveCountryCode} isInKurdistan={effectiveIsInKurdistan} size="full" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Info and Name (CENTERED) */}
                    <div className="flex-1 flex justify-center items-center gap-2 min-w-0 mx-2 pt-1">
                      <span className={`font-black text-sm tracking-normal uppercase truncate leading-normal ${
                        rank === 1
                          ? 'text-white'
                          : rank === 2
                          ? 'text-amber-950'
                          : rank === 3
                          ? 'text-white'
                          : 'text-mono-900 dark:text-mono-50'
                      }`}>{effectiveNickname}</span>
                    </div>

                    {/* Shield (RIGHT SIDE) */}
                    <div className="flex items-center shrink-0 pr-1">
                      <div className="relative w-10 h-12 flex items-center justify-center shrink-0">
                        <svg className="absolute inset-0 w-full h-full drop-shadow-[0_2.5px_6px_rgba(0,0,0,0.3)]" viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M50 0L95 20V55C95 80 50 115 50 115C50 115 5 80 5 55V20L50 0Z" fill={`url(#medalGradient-${player.id})`} stroke="white" strokeWidth="5" strokeOpacity={isTop3 ? 0.75 : 0.35} />
                          <defs>
                              <linearGradient id={`medalGradient-${player.id}`} x1="50" y1="0" x2="50" y2="115" gradientUnits="userSpaceOnUse">
                                <stop stopColor={getLevelTier(getLevelFromXP(effectiveXP)).stop1} />
                                <stop offset="1" stopColor={getLevelTier(getLevelFromXP(effectiveXP)).stop2} />
                              </linearGradient>
                          </defs>
                        </svg>
                        <div className="relative z-10 flex flex-col items-center justify-center -mt-1 w-full scale-[0.85]">
                          <span className="text-[7.5px] font-black text-amber-950/60 uppercase leading-none mb-0.5">ئاست</span>
                          <span className="text-xl font-black text-amber-950 leading-none drop-shadow-sm">{toKuDigits(getLevelFromXP(effectiveXP))}</span>
                        </div>
                      </div>
                    </div>
                  </Motion.div>
                );
              })}
              
              {/* Load More Button */}
              {hasMore && leaders.length > 0 && (
                <div className="pt-4 pb-8 flex justify-center">
                  <button
                    onClick={() => { triggerHaptic(10); fetchData(true); }}
                    disabled={loadingMore}
                    className="flex items-center gap-2 bg-mono-100 dark:bg-mono-800 hover:bg-mono-200 dark:hover:bg-mono-700 text-mono-600 dark:text-mono-300 px-6 py-2.5 rounded-full font-black text-sm transition-all active:scale-95 border border-mono-200 dark:border-mono-700 shadow-sm disabled:opacity-50 disabled:active:scale-100"
                  >
                    {loadingMore ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span>دئینیت...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">expand_more</span>
                        <span>زێدەتر نیشان بدە</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </Motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Bottom "Me" Bar */}
      {userId && trueRank && !loading && !error && view === 'global' && (
        <div className="fixed bottom-[calc(88px+env(safe-area-inset-bottom))] left-0 right-0 z-40 px-4 md:px-6 pointer-events-none drop-shadow-xl" dir="rtl">
          <Motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.3 }}
            className="max-w-md mx-auto w-full pointer-events-auto"
          >
            <div 
              className="rounded-md p-2 px-4 flex items-center justify-between shadow-[0_4px_10px_rgba(0,0,0,0.15)] relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] transition-transform border-b-4 border-black/15"
              style={{
                 background: `linear-gradient(135deg, ${getLevelTier(getLevelFromXP(userXP)).stop1}, ${getLevelTier(getLevelFromXP(userXP)).stop2})`
              }}
            >
               {/* Shine effect */}
               <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
               
               <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-full overflow-hidden bg-white/20 border border-white/40 shadow-sm shrink-0 flex items-center justify-center">
                    <Avatar src={userAvatar} size="full" border={false} className="object-cover w-full h-full" />
                 </div>
                 <div className="flex flex-col items-start leading-none justify-center">
                    <span className="font-black text-white text-[14px] drop-shadow-sm">ئاستێ {toKuDigits(getLevelFromXP(userXP))}</span>
                 </div>
               </div>
               
               <div className="flex items-center gap-2">
                 <span className="text-[26px] font-black text-white italic tabular-nums leading-none drop-shadow-sm">#{toKuDigits(trueRank)}</span>
               </div>
            </div>
          </Motion.div>
        </div>
      )}

      {/* Scroll To Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <Motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-[calc(148px+env(safe-area-inset-bottom))] left-4 md:left-8 z-50 w-12 h-12 bg-mono-900 dark:bg-white text-white dark:text-mono-900 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.3)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all border border-white/10 dark:border-black/10"
            title="بۆ سەرەوە"
          >
            <span className="material-symbols-outlined text-[24px]">keyboard_arrow_up</span>
          </Motion.button>
        )}
      </AnimatePresence>

      <PublicProfileModal
        profile={selectedPlayer}
        currentUser={{ id: userId }}
        onClose={() => setSelectedPlayer(null)}
        onToggleBlock={handleToggleBlock}
        onOpenChat={onOpenChat}
      />
    </div>
  );
}


