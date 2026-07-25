import React, { useRef, useState, useEffect, memo } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { DerhemIcon } from './CurrencyIcon';
import { triggerHaptic } from '../utils/haptics';
import { useAudio } from '../context/AudioContext';
import { useUser } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import Avatar from './Avatar';
import ClashingSwords from './ClashingSwords';
import ClassicIcon from './ClassicIcon';
import MamakIcon from './MamakIcon';
import CubeIcon from './CubeIcon';
import TimerIcon from './TimerIcon';
import LuckyWheelModal from './LuckyWheelModal';
import MysteryBoxModal from './MysteryBoxModal';
import ClipboardIcon from './ClipboardIcon';
import LuckyWheelIcon from './LuckyWheelIcon';
import MysteryBoxIcon from './MysteryBoxIcon';
import { getLevelFromXP } from '../utils/progression';
import useMultiplayer from '../hooks/useMultiplayer';
import PublicProfileModal from './PublicProfileModal';
import ReportModal from './ReportModal';
import { supabase } from '../lib/supabase';
import { toKuDigits } from '../utils/formatters';

const CooldownTimerOverlay = ({ targetDate, isMidnightReset = false }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!targetDate) return;
    
    const update = () => {
      const now = new Date();
      let end;
      
      if (isMidnightReset) {
        // Calculate time until next midnight local time
        end = new Date(now);
        end.setHours(24, 0, 0, 0);
      } else {
        const target = new Date(targetDate);
        end = new Date(target.getTime() + 24 * 60 * 60 * 1000);
      }
      
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft('');
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
      setTimeLeft(`${h}:${m}:${s}`);
    };
    
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate, isMidnightReset]);

  if (!timeLeft) return null;
  return (
    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 z-20 pointer-events-none">
      <span className="text-[10px] font-black text-amber-400 tabular-nums tracking-widest drop-shadow-md" dir="ltr">
        {toKuDigits(timeLeft)}
      </span>
    </div>
  );
};
const LobbyView = memo(({
  onStartClassic,
  onStartMamak,
  onStartHardWords,
  onStartWordFever,
  onStartMultiplayer,
  onDailyRewardClick,
  _dailyStreak,
  _notificationCount = 0,
  _onOpenHowToPlay,
  onOpenChat
}) => {
  const bgRef = useRef(null);
  const [showMultiplayerModal, setShowMultiplayerModal] = useState(false);
  const [showLuckyWheel, setShowLuckyWheel] = useState(false);
  const [showMysteryBox, setShowMysteryBox] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [inviteStep, setInviteStep] = useState('select'); 
  const [onlineProfiles, setOnlineProfiles] = useState([]);
  const [loadingOnline, setLoadingOnline] = useState(false);
  const [sentInvites, setSentInvites] = useState(new Set());
  const [invitedUserProfile, setInvitedUserProfile] = useState(null);
  const [inviteTimeLeft, setInviteTimeLeft] = useState(15);
  const [inviteAlert, setInviteAlert] = useState(null);
  const inviteTimerRef = useRef(null);

  const { playDailyOpenSfx } = useAudio();
  const { user, userNickname, userAvatar, onlineUsers, onlineCount, profileData } = useUser();
  const { lastRewardClaimedAt, spinTicketCount } = useGame();
  const { createPrivateMatch, multiplayerState, activeMatch, cancelMatch, hostAcceptJoiner, opponent } = useMultiplayer();
  
  // Clear sent invites when returning to idle state (e.g. after a match finishes or is cancelled)
  useEffect(() => {
    if (multiplayerState === 'idle') {
      setSentInvites(new Set());
    }
  }, [multiplayerState]);
  
  const isDailyAvailable = (() => {
    if (!lastRewardClaimedAt) return true;
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Baghdad',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      const lastClaimStr = formatter.format(new Date(lastRewardClaimedAt));
      const todayStr = formatter.format(new Date());
      return lastClaimStr !== todayStr;
    } catch {
      return false;
    }
  })();

  useEffect(() => {
    if (!user?.id || multiplayerState !== 'private_lobby') return;
    const channel = supabase.channel(`host_replies_${user.id}`, { config: { broadcast: { ack: true } } });
    channel.on('broadcast', { event: 'match_invite_rejected' }, (payload) => {
      if (payload.payload.roomId === activeMatch?.id) {
        cancelMatch();
        setInviteAlert("وی کەسی داخوازنامە ڕەتکر");
        setInvitedUserProfile(null);
        if (inviteTimerRef.current) clearInterval(inviteTimerRef.current);
      }
    })
    .on('broadcast', { event: 'match_invite_busy' }, (payload) => {
      if (payload.payload.roomId === activeMatch?.id) {
        cancelMatch();
        setInviteAlert("یاریزان یێ د ناڤ یاریێ دا");
        setInvitedUserProfile(null);
        if (inviteTimerRef.current) clearInterval(inviteTimerRef.current);
      }
    })
    .on('broadcast', { event: 'match_invite_accepted' }, (payload) => {
      if (payload.payload.roomId === activeMatch?.id) {
        console.log('[LobbyView] Invite explicitly accepted! Transitioning host instantly...');
        if (inviteTimerRef.current) clearInterval(inviteTimerRef.current);
        setInvitedUserProfile(null);
        setInviteTimeLeft(15);
        if (hostAcceptJoiner) hostAcceptJoiner(payload.payload.joinerId);
      }
    })
    .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, multiplayerState, activeMatch?.id, cancelMatch, hostAcceptJoiner]);

  useEffect(() => {
    if (multiplayerState === 'private_lobby' && inviteTimeLeft === 0 && invitedUserProfile) {
      cancelMatch();
      setInviteAlert("بەرسڤا داخوازنامەیێ نەهاتە دان");
      broadcastInviteEvent(invitedUserProfile.id, 'invite_cancelled', { roomId: activeMatch?.id });
      setInvitedUserProfile(null);
      if (inviteTimerRef.current) clearInterval(inviteTimerRef.current);
    }
  }, [inviteTimeLeft, multiplayerState, invitedUserProfile, activeMatch, cancelMatch]);

  const broadcastInviteEvent = async (targetUserId, event, payload) => {
    const topic = `user_invites_${targetUserId}`;
    let channel = supabase.getChannels().find(c => c.topic === `realtime:${topic}`);
    if (channel && channel.state === 'joined') {
      await channel.send({ type: 'broadcast', event, payload });
    } else {
      if (!channel) channel = supabase.channel(topic, { config: { broadcast: { ack: true } } });
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.send({ type: 'broadcast', event, payload });
        }
      });
    }
  };

  const handleHostCancelInvite = async () => {
    triggerHaptic(10);
    cancelMatch();
    
    if (invitedUserProfile && activeMatch) {
      await broadcastInviteEvent(invitedUserProfile.id, 'invite_cancelled', { roomId: activeMatch.id });
    }

    // Clean up local state
    setInvitedUserProfile(null);
    if (inviteTimerRef.current) clearInterval(inviteTimerRef.current);
  };

  const freeSpins = (() => {
    if (!profileData?.last_spin_date) return 1;
    const lastSpin = new Date(profileData.last_spin_date);
    const now = new Date();
    return (now - lastSpin) >= (24 * 60 * 60 * 1000) ? 1 : 0;
  })();
  const totalSpinsAvailable = spinTicketCount + freeSpins;
  const isLuckyWheelAvailable = totalSpinsAvailable > 0;

  const freeBoxes = (() => {
    if (!profileData?.last_mystery_box_date) return 1;
    const lastOpen = new Date(profileData.last_mystery_box_date);
    const now = new Date();
    return (now - lastOpen) >= (24 * 60 * 60 * 1000) ? 1 : 0;
  })();
  const totalBoxesAvailable = (profileData?.mystery_boxes_count || 0) + freeBoxes;
  const isMysteryBoxAvailable = totalBoxesAvailable > 0;

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget || e.target.classList.contains('bg-trigger-zone')) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      bgRef.current?.pulse(x, y);
    }
  };

  useEffect(() => {
    if (showMultiplayerModal && inviteStep === 'invite') {
      const fetchOnlineProfiles = async () => {
        setLoadingOnline(true);
        try {
          const { supabase } = await import('../lib/supabase');
          const onlineIds = Array.from(onlineUsers || new Set()).filter(id => id !== user?.id);
          
          if (onlineIds.length > 0) {
            const [profilesRes, friendsRes] = await Promise.all([
              supabase
                .from('profiles')
                .select('id, nickname, avatar_url, xp')
                .in('id', onlineIds)
                .neq('nickname', 'Admin_4rasti')
                .limit(50),
              supabase
                .from('friendships')
                .select('user_id, friend_id')
                .eq('status', 'accepted')
                .or(`user_id.eq.${user?.id},friend_id.eq.${user?.id}`)
            ]);
              
            if (!profilesRes.error && profilesRes.data) {
              const friendIds = new Set();
              if (friendsRes.data) {
                friendsRes.data.forEach(f => {
                  friendIds.add(f.user_id === user?.id ? f.friend_id : f.user_id);
                });
              }
              
              const profilesWithFriendStatus = profilesRes.data.map(p => ({
                ...p,
                isFriend: friendIds.has(p.id)
              }));
              
              setOnlineProfiles(profilesWithFriendStatus);
            }
          } else {
            setOnlineProfiles([]);
          }
        } catch (err) {
          console.error("Error fetching online profiles", err);
        } finally {
          setLoadingOnline(false);
        }
      };
      
      fetchOnlineProfiles();
    }
  }, [showMultiplayerModal, inviteStep, onlineUsers, user?.id]);

  const handleSendInviteToUser = async (targetUserId) => {
    triggerHaptic(10);
    setSentInvites(prev => new Set(prev).add(targetUserId));
    
    try {
      const newRoomId = await createPrivateMatch();
      if (!newRoomId) {
        setInviteAlert('کێشەیەک دروست بوو د چێکرنا ژوورێ دا.');
        setSentInvites(prev => {
          const next = new Set(prev);
          next.delete(targetUserId);
          return next;
        });
        return;
      }

      const targetProfile = onlineProfiles.find(p => p.id === targetUserId);
      setInvitedUserProfile(targetProfile);
      setInviteTimeLeft(15);
      if (inviteTimerRef.current) clearInterval(inviteTimerRef.current);
      inviteTimerRef.current = setInterval(() => {
        setInviteTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(inviteTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      console.log('1. Attempting to broadcast to user:', targetUserId);
      await broadcastInviteEvent(targetUserId, 'match_invite', { 
        roomId: newRoomId, 
        hostName: userNickname || 'هەڤالەکێ تە',
        hostAvatar: userAvatar || profileData?.avatar_url || user?.user_metadata?.avatar_url || 'default',
        hostId: user.id
      });
      console.log('2. Broadcast match_invite complete');
    } catch (err) {
      console.error("Invite error", err);
      setSentInvites(prev => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const bentoMotionProps = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  };

  const renderProfileRow = (profile, index) => {
    const isSent = sentInvites.has(profile.id);
    return (
      <div key={`${profile.id}-${index}`} className="flex items-center justify-between p-3 rounded-md bg-white dark:bg-mono-800/50 border border-mono-200 dark:border-mono-700 shadow-sm transition-all hover:border-blue-500/50">
        <div 
          className="flex items-center gap-3 cursor-pointer flex-1 mr-2"
          onClick={() => {
            triggerHaptic(10);
            setSelectedProfile(profile);
          }}
        >
          <div className="w-10 h-10 rounded-full bg-mono-200 dark:bg-mono-700 border-2 border-green-500 relative shrink-0">
            <Avatar src={profile.avatar_url} size="full" border={false} />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-mono-800 rounded-full"></div>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-bold text-mono-900 dark:text-white leading-tight">
              {profile.nickname || 'یاریکەر'}
            </span>
            {profile.xp !== undefined && (
              <span className="text-[10px] font-medium text-mono-500 dark:text-mono-400">
                ئاستی {getLevelFromXP(profile.xp)}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => handleSendInviteToUser(profile.id)}
          disabled={isSent}
          className={`px-4 py-2 rounded-md font-bold text-xs transition-all flex items-center gap-1 ${
            isSent 
              ? 'bg-green-500/10 text-green-600 dark:text-green-400 cursor-default' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
          }`}
        >
          {isSent ? (
            <>
              <span className="material-symbols-outlined text-[14px]">check</span>
              چوو
            </>
          ) : (
            'داخوازی'
          )}
        </button>
      </div>
    );
  };

  return (
    <Motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      onClick={handleBackgroundClick}
      className="flex-1 w-full max-w-full px-4 pt-4 pb-4 overflow-x-hidden bg-mono-white dark:bg-black relative h-full bg-trigger-zone transition-colors duration-500"
    >
      <div className="relative z-10">
        
        {/* Report / Feedback Wide Card */}
        <Motion.button
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           onClick={() => { triggerHaptic(10); setIsReportModalOpen(true); }}
           className="w-full relative h-12 rounded-[6px] bg-mono-200 dark:bg-[#1a1a1c] shadow-[0_4px_0_#e5e5e5] dark:shadow-[0_4px_0_#111113] border border-mono-300 dark:border-white/5 mb-4 flex items-center justify-between px-4 transition-transform active:translate-y-1 active:shadow-none"
        >
           <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-mono-700 dark:text-mono-400 text-[20px]">campaign</span>
              <span className="font-black font-rabar text-mono-900 dark:text-white text-[13px] mt-0.5">ئاریشە و پێشنیار</span>
           </div>
           <span className="material-symbols-outlined text-mono-400 dark:text-mono-600 text-lg">chevron_left</span>
        </Motion.button>

        <div className="flex flex-col mb-4 px-1 gap-2 mt-0 relative z-10 w-full justify-start">
          <div className="flex items-center justify-center w-full mt-2 mb-2">
            {/* Centered Daily Rewards Group */}
            <div className="flex flex-row items-center gap-3">
               <Motion.button
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{
                   opacity: 1,
                   scale: 1,
                   rotate: isDailyAvailable ? [-2, 2, -2, 2, 0] : 0,
                 }}
                 whileHover={{ scale: 1.1 }}
                 whileTap={{ scale: 0.9 }}
                 transition={{
                   rotate: isDailyAvailable ? { repeat: Infinity, duration: 2, ease: "easeInOut", repeatDelay: 3 } : { duration: 0.2 },
                   type: "spring", stiffness: 400, damping: 17
                 }}
                 onClick={(e) => { 
                    e.stopPropagation(); 
                    triggerHaptic(15); 
                    onDailyRewardClick?.(); 
                 }}
                 className={`relative flex items-center justify-center p-1 transition-all duration-300 group ${!isDailyAvailable ? 'grayscale opacity-80 cursor-pointer' : 'cursor-pointer'}`}
               >
                 <div className="relative flex items-center justify-center w-[58px] h-[58px]">
                   <ClipboardIcon className={`w-[54px] h-[54px] transition-transform duration-300 group-hover:scale-110 ${isDailyAvailable ? 'drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)] dark:drop-shadow-md' : ''}`} />
                   {!isDailyAvailable && <CooldownTimerOverlay targetDate={lastRewardClaimedAt} isMidnightReset={true} />}
                 </div>
               </Motion.button>

               <div className="w-px h-8 bg-mono-200 dark:bg-white/10 mx-1"></div>

               <button
                 id="nav-lucky-wheel"
                 onClick={(e) => { 
                    e.stopPropagation(); 
                    triggerHaptic(15); 
                    playDailyOpenSfx();
                    setShowLuckyWheel(true);
                 }}
                 className={`relative flex items-center justify-center p-1 ${!isLuckyWheelAvailable ? 'grayscale opacity-80 cursor-pointer' : 'cursor-pointer'}`}
               >
                 <div className="relative flex items-center justify-center w-[58px] h-[58px]">
                   <LuckyWheelIcon isIdleAnimated={isLuckyWheelAvailable} className={`w-[48px] h-[48px] transition-transform duration-300 hover:scale-110 ${isLuckyWheelAvailable ? 'drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)] dark:drop-shadow-md' : ''}`} />
                   {!isLuckyWheelAvailable && <CooldownTimerOverlay targetDate={profileData?.last_spin_date} />}
                 </div>
               </button>

               <div className="w-px h-8 bg-mono-200 dark:bg-white/10 mx-1"></div>

               <button
                 onClick={(e) => { 
                    e.stopPropagation(); 
                    triggerHaptic(15); 
                    playDailyOpenSfx();
                    setShowMysteryBox(true);
                 }}
                 className={`relative flex items-center justify-center p-1 ${!isMysteryBoxAvailable ? 'grayscale opacity-80 cursor-pointer' : 'cursor-pointer'}`}
               >
                 <div className="relative flex items-center justify-center w-[58px] h-[58px]">
                   <MysteryBoxIcon isIdleAnimated={isMysteryBoxAvailable} className={`w-[58px] h-[58px] transition-transform duration-300 hover:scale-[1.10] ${isMysteryBoxAvailable ? 'drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)] dark:drop-shadow-md' : ''}`} />
                   {!isMysteryBoxAvailable && <CooldownTimerOverlay targetDate={profileData?.last_mystery_box_date} />}
                 </div>
               </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2 md:col-span-4 relative group">
            <Motion.button
              variants={itemVariants}
              onClick={() => { 
                triggerHaptic(15); 
                setShowMultiplayerModal(true); 
                setInviteStep('select');
              }}
              {...bentoMotionProps}
              className="w-full relative h-28 rounded-[6px] border-none mb-1 group bg-transparent"
            >
              {/* 3D Split Shadow Layer */}
              <div 
                className="absolute inset-0 rounded-[6px] translate-y-[5px]"
                style={{ background: 'linear-gradient(90deg, #1d4ed8 50%, #b91c1c 50%)' }}
              />
              
              {/* Main Button Content Layer */}
              <div className="absolute inset-0 rounded-[6px] overflow-hidden">
                <div 
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(90deg, #2563eb 50%, #dc2626 50%)' }} 
                />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
                <div className="relative z-10 grid grid-cols-2 h-full">
                  <div className="flex items-center justify-center">
                    <div className="flex flex-col items-center text-center">
                      <h3 className="text-3xl font-black font-heading text-white drop-shadow-md">ھەڤڕکی</h3>
                    </div>
                  </div>
                  <div className="flex items-center justify-center relative">
                    <div className="transition-all duration-300 ease-out">
                      <ClashingSwords className="w-14 h-14 drop-shadow-md text-white/90 group-hover:text-white group-hover:scale-110 group-hover:-rotate-3" />
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-1.5 left-2.5 z-20 flex items-center gap-1.5 bg-black/20 hover:bg-black/40 transition-colors backdrop-blur-md px-2 py-0.5 rounded-[4px] border border-white/10 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80] animate-pulse"></span>
                  <span className="text-[10px] font-bold text-white/95 mt-0.5" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {toKuDigits(onlineCount || 1)} سەرهێل
                  </span>
                </div>
              </div>
            </Motion.button>
          </div>

          <div className="col-span-2 relative group">
            <Motion.button
              variants={itemVariants}
              onClick={() => { triggerHaptic(10); onStartClassic(); }}
              {...bentoMotionProps}
              className="w-full relative h-24 rounded-[6px] overflow-hidden bg-[#ffcc00] shadow-[0_5px_0_#cc9900] border-none mb-1"
            >
              <div className="relative z-10 flex items-center justify-between px-8 h-full">
                <div className="flex flex-col items-start text-right">
                  <h3 className="text-xl font-black font-heading text-amber-950">پەیڤۆک</h3>
                  <span className="text-[9px] font-medium font-rabar uppercase  text-amber-900/80 leading-none">کلاسیک</span>
                </div>
                <div className="flex items-center justify-center relative">
                  <div className="transition-all duration-300 ease-out">
                    <ClassicIcon className="w-32 h-10" />
                  </div>
                </div>
              </div>
            </Motion.button>
          </div>

          <div className="col-span-2 relative group">
            <Motion.button
              variants={itemVariants}
              onClick={() => { triggerHaptic(10); onStartMamak(); }}
              {...bentoMotionProps}
              className="w-full relative h-24 rounded-[6px] overflow-hidden bg-[#22c55e] shadow-[0_5px_0_#16a34a] border-none mb-1"
            >
              <div className="relative z-10 flex items-center justify-between px-8 h-full">
                <div className="flex flex-col items-start text-right">
                  <h3 className="text-xl font-black font-heading text-white">مامک</h3>
                  <span className="text-[9px] font-medium font-rabar uppercase  text-white/50 leading-none">پەیدا بکە</span>
                </div>
                <div className="flex items-center justify-center relative">
                  <div className="transition-all duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-1">
                    <MamakIcon className="w-16 h-16" />
                  </div>
                </div>
              </div>
            </Motion.button>
          </div>

          <div className="col-span-2 relative group">
            <Motion.button
              variants={itemVariants}
              onClick={() => { triggerHaptic(10); onStartHardWords(); }}
              {...bentoMotionProps}
              className="w-full relative h-24 rounded-[6px] overflow-hidden bg-[#ef4444] shadow-[0_5px_0_#dc2626] border-none mb-1"
            >
              <div className="relative z-10 flex items-center justify-between px-8 h-full">
                <div className="flex flex-col items-start text-right">
                  <h3 className="text-xl font-black font-heading text-white">پەیڤێن دژوار</h3>
                  <span className="text-[9px] font-medium font-rabar uppercase  text-white/50 leading-none">بۆ شارەزایان</span>
                </div>
                <div className="flex items-center justify-center relative">
                  <div className="transition-all duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-1">
                    <CubeIcon className="w-16 h-16" />
                  </div>
                </div>
              </div>
            </Motion.button>
          </div>

          <div className="col-span-2 relative group">
            <Motion.button
              variants={itemVariants}
              onClick={() => { triggerHaptic(10); onStartWordFever(); }}
              {...bentoMotionProps}
              className="w-full relative h-24 rounded-[6px] overflow-hidden bg-[#0ea5e9] shadow-[0_5px_0_#0284c7] border-none mb-1"
            >
              <div className="relative z-10 flex items-center justify-between px-8 h-full">
                <div className="flex flex-col items-start text-right">
                  <h3 className="text-xl font-black font-heading text-white">تایا پەیڤان</h3>
                  <span className="text-[9px] font-medium font-rabar uppercase  text-white/50 leading-none">بەرھەڤ بە</span>
                </div>
                <div className="flex items-center justify-center relative">
                  <div className="transition-all duration-300 ease-out group-hover:scale-110 group-hover:-rotate-12">
                    <TimerIcon className="w-[52px] h-[52px]" />
                  </div>
                </div>
              </div>
            </Motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showMultiplayerModal && (
          <Motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMultiplayerModal(false)}
          >
            <Motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-mono-100 dark:bg-mono-900 rounded-md p-6 shadow-2xl border border-mono-200 dark:border-mono-800 flex flex-col max-h-[80vh]"
            >
              {inviteStep === 'select' ? (
                <>
                  <h3 className="text-lg font-black text-center text-mono-900 dark:text-white mb-6">شێوەیێ یاریکرنێ هەلبژێرە</h3>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => {
                        triggerHaptic(10);
                        setShowMultiplayerModal(false);
                        onStartMultiplayer();
                      }}
                      className="w-full py-4 rounded-md bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-outlined">public</span>
                      لێگەڕیانا گشتی
                    </button>
                    <button 
                      onClick={() => {
                        triggerHaptic(10);
                        setInviteStep('invite');
                      }}
                      className="w-full py-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">person_add</span>
                      داخوازکرنا تایبەت
                    </button>
                    <button 
                      onClick={() => setShowMultiplayerModal(false)}
                      className="w-full py-3 rounded-md bg-mono-200 dark:bg-mono-800 text-mono-600 dark:text-mono-400 font-bold text-sm mt-2"
                    >
                      ڤەگەڕیان
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4 shrink-0">
                    <button onClick={() => setInviteStep('select')} className="text-mono-500 hover:text-mono-800 dark:hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </button>
                    <h3 className="text-lg font-black text-center text-mono-900 dark:text-white flex-1 flex items-center justify-center gap-2 mr-4">
                      یاریزانێن سەرهێل {onlineProfiles.length > 0 && <span className="text-sm text-mono-500 dark:text-mono-400">({onlineProfiles.length})</span>}
                      {loadingOnline && onlineProfiles.length > 0 && (
                        <span className="material-symbols-outlined animate-spin text-sm text-blue-500">sync</span>
                      )}
                    </h3>
                  </div>
                  
                  <div className={`overflow-y-auto h-[250px] pr-2 custom-scrollbar space-y-2 mb-4 transition-opacity duration-300 ${loadingOnline ? 'opacity-50' : 'opacity-100'}`}>
                    {loadingOnline && onlineProfiles.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full opacity-50">
                        <span className="material-symbols-outlined animate-spin text-2xl text-blue-500 mb-2">sync</span>
                        <p className="text-sm font-medium text-mono-600 dark:text-mono-400">لێگەڕیان ل یاریزانان...</p>
                      </div>
                    ) : onlineProfiles.length > 0 ? (
                      <>
                        {onlineProfiles.some(p => p.isFriend) && (
                          <>
                            <div className="text-xs font-bold text-mono-500 dark:text-mono-400 mt-2 mb-2 px-1 text-right w-full block">هەڤالێن تە</div>
                            {onlineProfiles.filter(p => p.isFriend).map(renderProfileRow)}
                          </>
                        )}
                        {onlineProfiles.some(p => !p.isFriend) && (
                          <>
                            <div className={`text-xs font-bold text-mono-500 dark:text-mono-400 mb-2 px-1 text-right w-full block ${onlineProfiles.some(p => p.isFriend) ? 'mt-4' : 'mt-2'}`}>یاریزانێن دی</div>
                            {onlineProfiles.filter(p => !p.isFriend).map(renderProfileRow)}
                          </>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <div className="w-12 h-12 rounded-full bg-mono-200 dark:bg-mono-800 flex items-center justify-center mb-3 text-mono-400">
                          <span className="material-symbols-outlined text-2xl">person_off</span>
                        </div>
                        <p className="text-sm font-medium text-mono-600 dark:text-mono-400">چ یاریزانێن دی نۆکە سەرهێل نینە.</p>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 mt-auto pt-2 border-t border-mono-200 dark:border-mono-800">
                    <button 
                      onClick={() => setShowMultiplayerModal(false)}
                      className="w-full py-3 rounded-md bg-mono-200 dark:bg-mono-800 text-mono-600 dark:text-mono-400 font-bold text-sm"
                    >
                      داخستن
                    </button>
                  </div>
                </>
              )}
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(multiplayerState === 'private_lobby' || multiplayerState === 'match_starting') && activeMatch && (
          <Motion.div 
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="fixed inset-0 z-999 flex flex-col items-center justify-between bg-mono-50/95 dark:bg-black/95 backdrop-blur-3xl pb-20 pt-12 px-4"
          >
            {/* Top Right Close Button (Hide during match_starting) */}
            {multiplayerState === 'private_lobby' && (
              <button 
                onClick={handleHostCancelInvite}
                className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-white dark:bg-mono-800 text-mono-400 hover:text-mono-900 dark:hover:text-white flex items-center justify-center transition-colors shadow-lg border border-mono-200 dark:border-transparent"
              >
                <span className="material-symbols-outlined font-black text-2xl">close</span>
              </button>
            )}

            {/* Top Center: Opponent */}
            <div className="flex flex-col items-center mt-12">
              <div className={`w-24 h-24 rounded-full bg-white dark:bg-mono-800 overflow-hidden border-2 mb-4 flex items-center justify-center relative ${
                (!activeMatch || activeMatch?.host_id === user?.id) 
                  ? 'shadow-[0_0_25px_rgba(239,68,68,0.6)] border-red-500' 
                  : 'shadow-[0_0_25px_rgba(59,130,246,0.6)] border-blue-500'
              }`}>
                {(invitedUserProfile?.avatar_url || opponent?.avatar_url) ? (
                  <Avatar src={invitedUserProfile?.avatar_url || opponent?.avatar_url} size="full" border={false} />
                ) : (
                  <span className={`material-symbols-outlined text-4xl ${
                    (!activeMatch || activeMatch?.host_id === user?.id) ? 'text-red-400' : 'text-blue-400'
                  }`}>person</span>
                )}
              </div>
              <p className="text-mono-900 dark:text-white font-black text-lg drop-shadow-sm dark:drop-shadow-md">
                {invitedUserProfile?.nickname || opponent?.nickname || 'یاریزان'}
              </p>
            </div>

            {/* Middle Center: Timer or Loading Spinner */}
            <div className="flex flex-col items-center justify-center flex-1">
              {multiplayerState === 'match_starting' ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[64px] text-primary dark:text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] mb-4">progress_activity</span>
                  <p className="text-mono-500 dark:text-mono-300 font-bold text-sm mt-2 animate-pulse">ئامادەکرنا تابلۆیا یاریێ...</p>
                </>
              ) : (
                <>
                  <div className="text-[64px] font-black text-mono-900 dark:text-white font-mono drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] tracking-wider">
                    00:{inviteTimeLeft.toString().padStart(2, '0')}
                  </div>
                  <p className="text-mono-500 dark:text-mono-300 font-bold text-sm mt-2 animate-pulse">چاڤەڕێی بەرسڤێیە...</p>
                </>
              )}
            </div>

            {/* Bottom Center: Current User */}
            <div className="flex flex-col items-center mb-8">
              <div className={`w-24 h-24 rounded-full bg-white dark:bg-mono-800 overflow-hidden border-2 mb-4 flex items-center justify-center relative ${
                (!activeMatch || activeMatch?.host_id === user?.id) 
                  ? 'shadow-[0_0_25px_rgba(59,130,246,0.6)] border-blue-500' 
                  : 'shadow-[0_0_25px_rgba(239,68,68,0.6)] border-red-500'
              }`}>
                {profileData?.avatar_url || user?.user_metadata?.avatar_url ? (
                  <Avatar src={profileData?.avatar_url || user?.user_metadata?.avatar_url} size="full" border={false} />
                ) : (
                  <span className={`material-symbols-outlined text-4xl ${
                    (!activeMatch || activeMatch?.host_id === user?.id) ? 'text-blue-400' : 'text-red-400'
                  }`}>person</span>
                )}
              </div>
              <p className="text-mono-900 dark:text-white font-black text-lg drop-shadow-sm dark:drop-shadow-md">{userNickname}</p>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Custom Alert Modal */}
      <AnimatePresence>
        {inviteAlert && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <Motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-mono-100 dark:bg-mono-900 rounded p-6 shadow-2xl border border-mono-200 dark:border-mono-800 max-w-xs w-full flex flex-col items-center gap-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-red-500 text-2xl">error</span>
              </div>
              <p className="text-sm font-bold text-mono-900 dark:text-white leading-relaxed">{inviteAlert}</p>
              <button
                onClick={() => setInviteAlert(null)}
                className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors mt-2"
              >
                باشە
              </button>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      <LuckyWheelModal isOpen={showLuckyWheel} onClose={() => setShowLuckyWheel(false)} />
      <MysteryBoxModal isOpen={showMysteryBox} onClose={() => setShowMysteryBox(false)} />
      
      <AnimatePresence>
        {selectedProfile && (
          <PublicProfileModal
            profile={selectedProfile}
            currentUser={user}
            onClose={() => setSelectedProfile(null)}
            onOpenChat={(player) => {
              setSelectedProfile(null);
              if (onOpenChat) onOpenChat(player);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isReportModalOpen && (
          <ReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            user={user}
          />
        )}
      </AnimatePresence>
    </Motion.div>
  );
});

export default LobbyView;
