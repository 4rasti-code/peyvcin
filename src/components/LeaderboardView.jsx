import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { AVATARS, DEFAULT_AVATAR } from '../data/avatars';
import Avatar from './Avatar';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import PublicProfileModal from './PublicProfileModal';
import { FilsIcon } from './CurrencyIcon';
import { triggerHaptic } from '../utils/haptics';
import { toKuDigits } from '../utils/formatters';
import { useUser } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { useAudio } from '../context/AudioContext';
import { getLevelFromXP } from '../utils/progression';
import FloatingLetterBackground from './FloatingLetterBackground';

export default function LeaderboardView({ onOpenChat }) {
  const { 
    user, 
    userNickname, 
    userAvatar, 
    countryCode, 
    isInKurdistan, 
    lastProfileUpdate,
    handleToggleBlock: toggleBlockInContext, 
    loadingAuth 
  } = useUser();
  
  const {
    currentXP: userXP,
    level: userLevel,
    fils: userFils,
    useGameLoading
  } = useGame();

  const userId = user?.id;
  const { playTabSound } = useAudio();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRank, setUserRank] = useState('--');
  const [view, setView] = useState('global');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const bgRef = useRef(null);

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

  const fetchData = async () => {
    // 1. HARDENED GUARD: Reject invalid, undefined, or loading states
    if (loadingAuth || !userId || userId === 'undefined' || userId.length < 5) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    
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
          .order('xp', { ascending: false });
          
        if (pError) throw pError;
        leaderData = data || [];
      } else {
        // GLOBAL VIEW - Order strictly by XP (Ground Truth)
        const { data, error: leaderError } = await supabase
          .from('profiles')
          .select('*')
          .order('xp', { ascending: false })
          .limit(20);
          
        if (leaderError) throw leaderError;
        leaderData = data || [];
      }
      
      setLeaders(leaderData);

      // Rank calculation: Count users with more XP
      if (typeof userXP === 'number' && !isNaN(userXP)) {
        const { count, error: rankError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gt('xp', userXP);

        if (!rankError) setUserRank(count + 1);
      }
    } catch (err) {
      console.warn("Leaderboard fetch error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleFocus = () => fetchData();
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [view, userId]);


  return (
    <div 
      onClick={handleBackgroundClick}
      className="w-full max-w-full px-4 md:px-6 pb-56 h-full relative animate-in fade-in duration-700 bg-[#020617] overflow-x-hidden pt-[calc(env(safe-area-inset-top,24px)+32px)] md:pt-20 text-right bg-trigger-zone"
    >
      <FloatingLetterBackground ref={bgRef} />

      <div className="relative z-10">
        <div className="flex flex-col items-center mb-10 max-w-md mx-auto text-center">
          <span className="material-symbols-outlined text-4xl text-primary mb-2.5 drop-shadow-lg">leaderboard</span>
          <h2 className="text-5xl font-black font-rabar tracking-normal italic uppercase" style={{ color: 'rgb(203, 213, 225)' }}>رێزبەندی</h2>
        </div>

        {/* Top Tab Swapper - Synced Card Style */}
        <div className="flex p-1 rounded-md border mb-10 w-full max-w-xs mx-auto relative z-30 shadow-sm transition-all overflow-hidden"
             style={{ backgroundColor: 'rgb(203, 213, 225)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
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
                className={`flex-1 py-2.5 px-4 rounded-md font-black text-sm transition-all duration-300 relative z-10 ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-slate-800 rounded-md shadow-sm"
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

        <AnimatePresence mode="wait">
          {!loading ? (
            <motion.div 
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
                const rank = index + 1;
                const isTop3 = rank <= 3;
                const isMe = userId && (player.id === userId);
                const effectiveAvatar = isMe ? userAvatar : (player.avatar_url || 'default');
                const effectiveNickname = isMe ? userNickname : player.nickname;
                const effectiveXP = isMe ? userXP : player.xp;

                return (
                  <motion.div
                    key={player.id}
                    variants={{
                      hidden: { opacity: 0, y: 15, scale: 0.98 },
                      visible: { opacity: 1, y: 0, scale: 1 },
                      exit: { opacity: 0, scale: 0.98 }
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => { triggerHaptic(10); setSelectedPlayer({ ...player, avatar_url: effectiveAvatar, nickname: effectiveNickname, xp: effectiveXP }); }}
                    className={`flex flex-row items-center justify-between p-2.5 px-5 rounded-md border relative transition-all cursor-pointer shadow-sm`}
                    style={{ 
                      backgroundColor: 'rgb(203, 213, 225)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      boxShadow: 'rgba(148, 163, 184, 0.4) 0px 10px 20px -5px',
                      zIndex: isTop3 ? 50 : 1 // Ensure top 3 cards have higher z-index for floating crowns
                    }}
                  >
                      {/* Left Side Accent Bar (Primary Yellow - Sharp) */}
                      <div className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-[2px] bg-primary" />

                      {/* Sleek Metallic Rank Number (MINIMALIST) */}
                      <div className="flex items-center justify-center w-10 shrink-0 z-10 relative">
                         {rank <= 3 && (
                             <motion.div 
                               initial={{ y: 0, rotate: rank === 1 ? -5 : rank === 2 ? 5 : 0 }}
                               animate={{ 
                                 y: [-2, 2, -2],
                                 rotate: rank === 1 ? [-5, 5, -5] : rank === 2 ? [5, -5, 5] : [-3, 3, -3]
                               }}
                               transition={{ repeat: Infinity, duration: rank === 1 ? 4 : rank === 2 ? 4.5 : 5, ease: "easeInOut" }}
                               className={`absolute -top-10 left-1/2 -translate-x-1/2 z-30 pointer-events-none`}
                             >
                                <div className="relative w-12 h-12 flex items-center justify-center scale-110">
                                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]">
                                    <defs>
                                      <linearGradient id={`goldReflect-${player.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#FFF9C4" />
                                        <stop offset="40%" stopColor="#FBC02D" />
                                        <stop offset="60%" stopColor="#F9A825" />
                                        <stop offset="100%" stopColor="#EF6C00" />
                                      </linearGradient>
                                      <linearGradient id={`silverReflect-${player.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#F8FAFC" />
                                        <stop offset="40%" stopColor="#94A3B8" />
                                        <stop offset="60%" stopColor="#64748B" />
                                        <stop offset="100%" stopColor="#334155" />
                                      </linearGradient>
                                      <linearGradient id={`bronzeReflect-${player.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#FFEDD5" />
                                        <stop offset="40%" stopColor="#B45309" />
                                        <stop offset="60%" stopColor="#92400E" />
                                        <stop offset="100%" stopColor="#78350F" />
                                      </linearGradient>
                                    </defs>
                                    
                                    {/* Imperial Base */}
                                    <path 
                                      d="M20 75 Q50 82 80 75 L82 68 Q50 75 18 68 Z" 
                                      fill={rank === 1 ? `url(#goldReflect-${player.id})` : rank === 2 ? `url(#silverReflect-${player.id})` : `url(#bronzeReflect-${player.id})`}
                                    />
                                    
                                    {/* Arches for 3D effect */}
                                    <path 
                                      d="M20 68 Q20 30 50 25 Q80 30 80 68" 
                                      stroke={rank === 1 ? "#FBC02D" : rank === 2 ? "#94A3B8" : "#B45309"} 
                                      strokeWidth="4" 
                                      fill="none" 
                                      opacity="0.3" 
                                    />
                                    
                                    {/* Main Pillars */}
                                    <path 
                                      d="M20 68 Q10 40 30 35 Q40 50 50 68 Q60 50 70 35 Q90 40 80 68" 
                                      fill={rank === 1 ? `url(#goldReflect-${player.id})` : rank === 2 ? `url(#silverReflect-${player.id})` : `url(#bronzeReflect-${player.id})`}
                                      stroke={rank === 1 ? "#B45309" : rank === 2 ? "#334155" : "#431407"}
                                      strokeWidth="0.5"
                                    />
                                    
                                    {/* Imperial Top Detail */}
                                    <circle cx="50" cy="22" r="6" fill={rank === 1 ? "#FDE68A" : rank === 2 ? "#CBD5E1" : "#FDBA74"} />
                                    <circle cx="50" cy="22" r="3" fill={rank === 1 ? "#EF4444" : rank === 2 ? "#3B82F6" : "#10B981"} />
                                    
                                    <circle cx="30" cy="35" r="4" fill={rank === 1 ? "#FDE68A" : rank === 2 ? "#CBD5E1" : "#FDBA74"} />
                                    <circle cx="70" cy="35" r="4" fill={rank === 1 ? "#FDE68A" : rank === 2 ? "#CBD5E1" : "#FDBA74"} />
                                    
                                    {/* Pearls along the base */}
                                    {[25, 37.5, 50, 62.5, 75].map((x, i) => (
                                      <circle key={i} cx={x} cy="71" r="2" fill="white" />
                                    ))}
                                  </svg>
                                </div>
                             </motion.div>
                         )}
                         <span className={`text-2xl font-black italic tracking-normal relative z-10 ${
                             rank === 1 ? 'text-[#92400e]' :
                             rank === 2 ? 'text-[#334155]' :
                             rank === 3 ? 'text-[#7c2d12]' :
                             'text-[#0f172a]'
                         }`}>
                            {toKuDigits(rank)}
                         </span>
                      </div>

                      {/* Avatar Section */}
                      <div className="flex items-center gap-3 z-10 px-1">
                         <div className="relative">
                            {/* Clean Avatar (No Borders) */}
                            <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm bg-slate-100 shrink-0 relative z-10">
                              <Avatar
                                src={effectiveAvatar}
                                updatedAt={isMe ? lastProfileUpdate : player.updated_at}
                                size="full"
                                className="rounded-full object-cover w-full h-full"
                                border={false}
                              />
                            </div>
                         </div>
                      </div>

                      {/* Info and Name (CENTERED) */}
                      <div className="flex-1 flex justify-center items-center gap-2 min-w-0 mx-2">
                         <span className="font-black text-slate-800 text-sm tracking-normal uppercase truncate leading-none">{effectiveNickname}</span>
                         <span className="text-orange-500 text-base shrink-0">🔥</span>
                      </div>

                      {/* Shield (RIGHT SIDE) */}
                      <div className="flex items-center shrink-0 pr-1">
                         <div className="relative w-10 h-12 flex items-center justify-center shrink-0">
                            <svg className="absolute inset-0 w-full h-full drop-shadow-md" viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg">
                               <path d="M50 0L95 20V55C95 80 50 115 50 115C50 115 5 80 5 55V20L50 0Z" fill={`url(#medalGradient-${player.id})`} stroke="white" strokeWidth="4" strokeOpacity="0.2" />
                               <defs>
                                  <linearGradient id={`medalGradient-${player.id}`} x1="50" y1="0" x2="50" y2="115" gradientUnits="userSpaceOnUse">
                                     <stop stopColor="#FFD700" />
                                     <stop offset="1" stopColor="#B8860B" />
                                  </linearGradient>
                               </defs>
                            </svg>
                             <div className="relative z-10 flex flex-col items-center justify-center -mt-1 w-full scale-[0.85]">
                                <span className="text-[7px] font-black text-slate-950/40 uppercase leading-none mb-0.5">ئاست</span>
                                <span className="text-xl font-black text-slate-950 leading-none drop-shadow-sm">{toKuDigits(getLevelFromXP(effectiveXP))}</span>
                             </div>
                         </div>
                      </div>
                    </motion.div>
                  );
                })}
            </motion.div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-48 gap-4">
              <span className="material-symbols-outlined text-4xl text-red-500/50">cloud_off</span>
              <span className="font-black text-slate-400 font-rabar">کێشەیەک د پەیوەندیێ دا هەیە</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-48 gap-4">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="font-black text-slate-700 uppercase text-[10px] tracking-widest">LOADING...</span>
            </div>
          )}
        </AnimatePresence>
      </div>

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
