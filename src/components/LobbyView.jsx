import React, { useRef, useState, useEffect, memo, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { AlarmClock } from 'lucide-react';
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
import ReportIcon from './ReportIcon';
import DownloadIcon from './DownloadIcon';
import TutorialIcon from './TutorialIcon';
import { getLevelFromXP } from '../utils/progression';
import useMultiplayer from '../hooks/useMultiplayer';
import PublicProfileModal from './PublicProfileModal';
import ReportModal from './ReportModal';
import InstallGuideModal from './InstallGuideModal';
import OnboardingOverlay from './OnboardingOverlay';
import AdBanner from './AdBanner';
import { supabase } from '../lib/supabase';
import { toKuDigits } from '../utils/formatters';
import { NAME_FONTS } from '../constants/nameFonts';
import { NAME_STYLES } from '../constants/nameStyles';
import { BUNDLES } from '../constants/bundles';

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
      setTimeLeft(h === '00' ? `${m}:${s}` : `${h}:${m}:${s}`);
    };
    
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate, isMidnightReset]);

  if (!timeLeft) return null;
  return (
    <div className="bg-mono-900 dark:bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-white/20 dark:border-white/10 flex items-center justify-center shadow-sm mx-auto w-max">
      <span className="text-[7.5px] md:text-[9px] leading-none font-black text-amber-400 tabular-nums tracking-widest drop-shadow-md pt-[1.5px]" dir="ltr">
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
  onOpenHowToPlay,
  onOpenChat
}) => {
  const bgRef = useRef(null);
  const [showMultiplayerModal, setShowMultiplayerModal] = useState(false);
  const [showLuckyWheel, setShowLuckyWheel] = useState(false);
  const [showMysteryBox, setShowMysteryBox] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [inviteStep, setInviteStep] = useState('select'); 
  const [onlineProfiles, setOnlineProfiles] = useState([]);
  const [loadingOnline, setLoadingOnline] = useState(false);
  const [sentInvites, setSentInvites] = useState(new Set());
  const [invitedUserProfile, setInvitedUserProfile] = useState(null);
  const [inviteTimeLeft, setInviteTimeLeft] = useState(15);
  const [inviteAlert, setInviteAlert] = useState(null);
  const [inviteCooldowns, setInviteCooldowns] = useState({});
  const [inviteStrikes, setInviteStrikes] = useState({});
  const inviteTimerRef = useRef(null);

  const { playDailyOpenSfx } = useAudio();
  const { user, userNickname, userAvatar, onlineUsers, onlineCount, profileData, equippedFont, equippedNameStyle, equippedBundle } = useUser();
  const { lastRewardClaimedAt, spinTicketCount } = useGame();
  const { createPrivateMatch, multiplayerState, activeMatch, cancelMatch, hostAcceptJoiner, opponent } = useMultiplayer();
  
  // Clear sent invites when returning to idle state (e.g. after a match finishes or is cancelled)
  useEffect(() => {
    if (multiplayerState === 'idle') {
      setSentInvites(new Set());
    }
  }, [multiplayerState]);
  
  const recordInviteStrike = useCallback(async (targetId) => {
    if (!user?.id || !targetId) return;
    try {
      const { data } = await supabase
        .from('invite_tracking')
        .select('*')
        .eq('sender_id', user.id)
        .eq('receiver_id', targetId)
        .maybeSingle();
      
      let newStrikes = (data?.strike_count || 0) + 1;
      let blockedUntil = null;
      
      if (newStrikes >= 3) {
        blockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min block
        newStrikes = 0; // Reset for next time after block expires
        setInviteCooldowns(prev => ({ ...prev, [targetId]: blockedUntil }));
      }
      setInviteStrikes(prev => ({ ...prev, [targetId]: newStrikes }));
      
      if (data) {
        await supabase.from('invite_tracking')
          .update({ strike_count: newStrikes, blocked_until: blockedUntil, updated_at: new Date().toISOString() })
          .eq('id', data.id);
      } else {
        await supabase.from('invite_tracking')
          .insert({ sender_id: user.id, receiver_id: targetId, strike_count: newStrikes, blocked_until: blockedUntil });
      }
    } catch (err) {
      console.error("Error recording strike:", err);
    }
  }, [user?.id]);
  
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
        if (invitedUserProfile) recordInviteStrike(invitedUserProfile.id);
        setInvitedUserProfile(null);
        if (inviteTimerRef.current) clearInterval(inviteTimerRef.current);
      }
    })
    .on('broadcast', { event: 'match_invite_busy' }, (payload) => {
      if (payload.payload.roomId === activeMatch?.id) {
        cancelMatch();
        const busyMode = payload.payload?.busyMode;
        let modeText = "یاریێ";
        if (busyMode === 'classic') modeText = "پەیڤۆک کلاسیك";
        else if (busyMode === 'hard_words') modeText = "پەیڤێن دژوار";
        else if (busyMode === 'word_fever') modeText = "تایا پەیڤان";
        else if (busyMode === 'mamak') modeText = "مامک";
        else if (busyMode === 'multiplayer') modeText = "هەڤڕکی";

        setInviteAlert(`یاریزان یێ د ناڤ یارییا ${modeText} دا`);
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
  }, [user?.id, multiplayerState, activeMatch?.id, cancelMatch, hostAcceptJoiner, invitedUserProfile, recordInviteStrike]);

  useEffect(() => {
    if (multiplayerState === 'private_lobby' && inviteTimeLeft === 0 && invitedUserProfile) {
      cancelMatch();
      setInviteAlert("بەرسڤا داخوازنامەیێ نەهاتە دان");
      broadcastInviteEvent(invitedUserProfile.id, 'invite_cancelled', { roomId: activeMatch?.id });
      recordInviteStrike(invitedUserProfile.id);
      setInvitedUserProfile(null);
      if (inviteTimerRef.current) clearInterval(inviteTimerRef.current);
    }
  }, [inviteTimeLeft, multiplayerState, invitedUserProfile, activeMatch, cancelMatch, recordInviteStrike]);

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
          const BOT_ID = '9a813c24-b662-477d-a74a-6f822d17bbf1';
          const onlineIds = Array.from(onlineUsers || new Set()).filter(id => id !== user?.id && id !== BOT_ID);
          
          if (onlineIds.length > 0) {
            const [profilesRes, friendsRes, trackRes] = await Promise.all([
              supabase
                .from('profiles')
                .select('id, nickname, avatar_url, xp, equipped_font, equipped_name_style, equipped_bundle')
                .in('id', onlineIds)
                .neq('nickname', 'Admin_4rasti')
                .neq('nickname', 'ADMIN_PEYVOK')
                .neq('nickname', 'پەیڤۆک')
                .neq('id', '9a813c24-b662-477d-a74a-6f822d17bbf1')
                .neq('id', '66bbf4d5-333a-4748-8529-ecd5bae9f3a4')
                .limit(50),
              supabase
                .from('friendships')
                .select('user_id, friend_id')
                .eq('status', 'accepted')
                .or(`user_id.eq.${user?.id},friend_id.eq.${user?.id}`),
              supabase
                .from('invite_tracking')
                .select('receiver_id, blocked_until, strike_count')
                .eq('sender_id', user?.id)
            ]);
              
            if (!profilesRes.error && profilesRes.data) {
              const friendIds = new Set();
              if (friendsRes.data) {
                friendsRes.data.forEach(f => {
                  friendIds.add(f.user_id === user?.id ? f.friend_id : f.user_id);
                });
              }
              
              if (trackRes && trackRes.data) {
                const cooldowns = {};
                const strikes = {};
                const now = new Date();
                trackRes.data.forEach(row => {
                  if (row.blocked_until && new Date(row.blocked_until) > now) {
                    cooldowns[row.receiver_id] = row.blocked_until;
                  }
                  strikes[row.receiver_id] = row.strike_count || 0;
                });
                setInviteCooldowns(cooldowns);
                setInviteStrikes(strikes);
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

  const CooldownTimer = ({ blockedUntil }) => {
    const [timeLeft, setTimeLeft] = useState('');
    useEffect(() => {
      const update = () => {
        const ms = new Date(blockedUntil) - new Date();
        if (ms <= 0) { setTimeLeft(''); return; }
        const mins = Math.ceil(ms / 60000);
        setTimeLeft(`${toKuDigits(mins)} خولەک`);
      };
      update();
      const int = setInterval(update, 60000);
      return () => clearInterval(int);
    }, [blockedUntil]);
  
    if (!timeLeft) return null;
    return <span className="text-[11px] whitespace-nowrap">{timeLeft}</span>;
  };

  const renderProfileRow = (profile, index) => {
    const isSent = sentInvites.has(profile.id);
    const blockedUntil = inviteCooldowns[profile.id];
    const isBlocked = blockedUntil && new Date(blockedUntil) > new Date();
    
    return (
      <div key={`${profile.id}-${index}`} className={`flex items-center justify-between p-3 rounded-md bg-white dark:bg-mono-800/50 border shadow-sm transition-all ${isBlocked ? 'border-red-200 dark:border-red-900/30' : 'border-mono-200 dark:border-mono-700 hover:border-blue-500/50'}`}>
        <div 
          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 mr-2"
          onClick={() => {
            triggerHaptic(10);
            setSelectedProfile(profile);
          }}
        >
          <div className="w-8 h-8 rounded-full bg-mono-200 dark:bg-mono-700 border-2 border-green-500 relative shrink-0">
            <Avatar src={profile.avatar_url} size="full" border={false} level={profile.xp !== undefined ? getLevelFromXP(profile.xp) : null} />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-mono-800 rounded-full"></div>
          </div>
          <div 
            className="flex flex-col items-start flex-1 min-w-0 pr-1"
            style={{ containerType: 'inline-size' }}
          >
            {(() => {
              const fontObj = NAME_FONTS[profile.equipped_font] || NAME_FONTS['default-ku'];
              const styleObj = NAME_STYLES[profile.equipped_name_style] || {};
              const bundleObj = BUNDLES[profile.equipped_bundle] || BUNDLES['default'];
              
              const name = profile.nickname || 'یاریکەر';
              const nameLen = Math.max(name.length, 1);
              const wideFonts = ['press-start-2p', 'bangers', 'blunt-wide', 'digiface', 'digital', 'lcd', 'runiga', 'god-of-war', 'fungky-brow', 'ncl-halloween-danger', 'awesome-christmas'];
              const actualFontClass = bundleObj.id !== 'default' ? bundleObj.fontKurdish : profile.equipped_font;
              const isWideFont = wideFonts.some(wf => actualFontClass?.includes(wf));
              
              const baseSize = fontObj.style?.fontSize ? parseFloat(fontObj.style.fontSize) : 1.05;
              const charWidthRatio = isWideFont ? 1.3 : 0.85; 
              const maxCqw = 100 / (nameLen * charWidthRatio);
              const dynamicFontSize = `min(${baseSize}em, ${maxCqw}cqw)`;

              return (
                <span 
                  className={`text-sm font-bold leading-tight whitespace-nowrap overflow-visible ${bundleObj.id !== 'default' ? (bundleObj.fontKurdish + ' ' + bundleObj.textStyle) : (styleObj.class || 'text-mono-900 dark:text-white')}`}
                  style={{
                    ...(bundleObj.id !== 'default' ? {} : fontObj.style),
                    fontSize: dynamicFontSize
                  }}
                >
                  {name}
                </span>
              );
            })()}
          </div>
        </div>
        <button
          onClick={() => {
            if (isSent) return;
            if (isBlocked) {
              triggerHaptic(10);
              setInviteAlert("د نۆکە دا تو نەشێی یاریێ ل گەل ئەڤی یاریزانی بکەی!");
            } else {
              handleSendInviteToUser(profile.id);
            }
          }}
          className={`px-4 py-2 rounded-md font-bold text-xs transition-all flex items-center justify-center gap-1.5 min-w-22.5 ${
            isSent 
              ? 'bg-green-500/10 text-green-600 dark:text-green-400 cursor-default'
              : isBlocked
                ? 'bg-mono-100 dark:bg-mono-800 text-red-500 dark:text-red-400 cursor-pointer border border-red-100 dark:border-red-900/30'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer'
          }`}
        >
          {isSent ? (
            <>
              <span className="material-symbols-outlined text-[15px]">check</span>
              چوو
            </>
          ) : isBlocked ? (
            <>
              <span className="material-symbols-outlined text-[16px]">lock_clock</span>
              <CooldownTimer blockedUntil={blockedUntil} />
            </>
          ) : (
            `داخوازی (${(3 - (inviteStrikes[profile.id] || 0)).toLocaleString('ar-EG')})`
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
      className="flex-1 w-full max-w-full px-4 pt-4 pb-4 overflow-x-hidden bg-transparent relative h-full bg-trigger-zone transition-colors duration-500"
    >


        {/* Fixed Docks Wrapper (Does not scroll with cards) */}
        <div className="fixed inset-y-0 w-full max-w-screen-sm md:max-w-240 left-1/2 -translate-x-1/2 pointer-events-none z-50">
          {/* Left Column (Icons) - Fixed to Edge */}
          <div className="absolute left-2 md:left-6 top-32 sm:top-40 md:top-52 flex flex-col pointer-events-auto items-center gap-4 z-40 bg-transparent py-4 pr-1 pl-0.5">
            
            {/* Mystery Box */}
            <Motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(15);
                playDailyOpenSfx();
                setShowMysteryBox(true);
              }}
              className="flex flex-col items-center gap-1 cursor-pointer relative"
            >
              <div className="relative flex items-center justify-center w-8 h-8 md:w-16 md:h-16">
                <MysteryBoxIcon isIdleAnimated={isMysteryBoxAvailable} className={`w-8 h-8 md:w-16 md:h-16 ${!isMysteryBoxAvailable ? 'grayscale opacity-80' : 'relative z-10 drop-shadow-md'}`} />
              </div>
              {isMysteryBoxAvailable ? (
                <span className="text-[8px] md:text-[12px] font-black font-heading text-mono-900 dark:text-white drop-shadow-sm dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] tracking-wide">سندۆق</span>
              ) : (
                <CooldownTimerOverlay targetDate={profileData?.last_mystery_box_date} />
              )}
            </Motion.button>

            {/* Lucky Wheel */}
            <Motion.button
              id="nav-lucky-wheel"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                playDailyOpenSfx();
                setShowLuckyWheel(true);
              }}
              className="flex flex-col items-center gap-1 cursor-pointer relative"
            >
              <div className="relative flex items-center justify-center w-8 h-8 md:w-16 md:h-16">
                <LuckyWheelIcon isIdleAnimated={isLuckyWheelAvailable} className={`w-7 h-7 md:w-14 md:h-14 ${!isLuckyWheelAvailable ? 'grayscale opacity-80' : 'drop-shadow-md'}`} />
              </div>
              {isLuckyWheelAvailable ? (
                <span className="text-[8px] md:text-[12px] font-black font-heading text-mono-900 dark:text-white drop-shadow-sm dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] tracking-wide">چەرخ</span>
              ) : (
                <CooldownTimerOverlay targetDate={profileData?.last_spin_date} />
              )}
            </Motion.button>

            {/* Daily Tasks */}
            <Motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(15);
                onDailyRewardClick?.();
              }}
              className="flex flex-col items-center gap-1 cursor-pointer relative"
            >
              <div className="relative flex items-center justify-center w-8 h-8 md:w-16 md:h-16">
                <ClipboardIcon className={`w-8 h-8 md:w-16 md:h-16 ${!isDailyAvailable ? 'grayscale opacity-80' : 'drop-shadow-md'}`} />
              </div>
              {isDailyAvailable ? (
                <span className="text-[8px] md:text-[12px] font-black font-heading text-mono-900 dark:text-white drop-shadow-sm dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] tracking-wide">خەڵات</span>
              ) : (
                <CooldownTimerOverlay targetDate={lastRewardClaimedAt} isMidnightReset={true} />
              )}
            </Motion.button>

          </div>

          {/* Right Column (Icons) - Fixed to Edge */}
          <div className="absolute right-2 md:right-6 top-32 sm:top-40 md:top-52 flex flex-col pointer-events-auto items-center gap-4 z-40 bg-transparent py-4 pl-1 pr-0.5">
            
            {/* Report */}
            <Motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { triggerHaptic(10); setIsReportModalOpen(true); }}
              className="flex flex-col items-center gap-1 cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-8 h-8 md:w-16 md:h-16">
                <ReportIcon className="w-8 h-8 md:w-16 md:h-16 drop-shadow-md" />
              </div>
              <span className="text-[8px] md:text-[12px] font-black font-heading text-mono-900 dark:text-white drop-shadow-sm dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] tracking-wide">پێشنیار</span>
            </Motion.button>

            {/* Download */}
            <Motion.button
              id="btn-download-game"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { triggerHaptic(10); setIsInstallModalOpen(true); }}
              className="flex flex-col items-center gap-1 cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-8 h-8 md:w-16 md:h-16">
                <DownloadIcon className="w-8 h-8 md:w-16 md:h-16 drop-shadow-md" />
              </div>
              <span className="text-[8px] md:text-[12px] font-black font-heading text-mono-900 dark:text-white drop-shadow-sm dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] tracking-wide">داگرتن</span>
            </Motion.button>

            {/* Tutorial */}
            <Motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { triggerHaptic(10); if(onOpenHowToPlay) onOpenHowToPlay(); }}
              className="flex flex-col items-center gap-1 cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-8 h-8 md:w-16 md:h-16">
                <TutorialIcon className="w-8 h-8 md:w-16 md:h-16 drop-shadow-md" />
              </div>
              <span className="text-[8px] md:text-[12px] font-black font-heading text-mono-900 dark:text-white drop-shadow-sm dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] tracking-wide">فێرکاری</span>
            </Motion.button>

          </div>

        </div>
        <div className="relative z-10 w-full mt-6 sm:mt-10 md:mt-16 mb-12">
          
          {/* Middle Column (Cards) - Optimized for both Mobile and Desktop */}
          <div className="w-full max-w-2xl mx-auto px-10 sm:px-12 md:px-20 relative z-10">
              <div className="flex flex-col gap-4">
<div className="relative group w-full">
            <Motion.button
              variants={itemVariants}
              onClick={() => { 
                triggerHaptic(15); 
                setShowMultiplayerModal(true); 
                setInviteStep('select');
              }}
              {...bentoMotionProps}
              className="w-full block relative h-20 md:h-27.5 rounded-md border-none group bg-transparent"
            >
              {/* 3D Split Shadow Layer */}
              <div 
                className="absolute inset-0 rounded-md translate-y-1.25"
                style={{ background: 'linear-gradient(90deg, #1d4ed8 50%, #b91c1c 50%)' }}
              />
              
              {/* Main Button Content Layer */}
              <div className="absolute inset-0 rounded-md overflow-hidden">
                <div 
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(90deg, #2563eb 50%, #dc2626 50%)' }} 
                />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
                <div className="relative z-10 grid grid-cols-2 h-full">
                  <div className="flex items-center justify-center">
                    <div className="flex flex-col items-center text-center">
                      <h3 className="text-2xl md:text-[34px] font-black font-heading text-white drop-shadow-md">ھەڤڕکی</h3>
                    </div>
                  </div>
                  <div className="flex items-center justify-center relative">
                    <div className="transition-all duration-300 ease-out">
                      <ClashingSwords className="w-14 h-14 md:w-20 md:h-20 drop-shadow-md text-white/90 group-hover:text-white group-hover:scale-110 group-hover:-rotate-3" />
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-1.5 left-2.5 z-20 flex items-center gap-1.5 bg-black/20 hover:bg-black/40 transition-colors backdrop-blur-md px-2 py-0.5 rounded-sm border border-white/10 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80] animate-pulse"></span>
                  <span className="text-[10px] font-bold text-white/95 mt-0.5" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {toKuDigits(onlineCount || 1)}
                  </span>
                </div>
              </div>
            </Motion.button>
          </div>

          <div className="relative group w-full">
            <Motion.button
              variants={itemVariants}
              onClick={() => { triggerHaptic(10); onStartClassic(); }}
              {...bentoMotionProps}
              className="w-full block relative h-20 md:h-27.5 rounded-md overflow-hidden bg-[#ffcc00] shadow-[0_5px_0_#cc9900] border-none"
            >
              <div className="relative z-10 flex items-center justify-between px-8 h-full">
                <div className="flex flex-col items-start text-right">
                  <h3 className="text-2xl md:text-[34px] font-black font-heading text-amber-950 drop-shadow-md">پەیڤۆک</h3>
                </div>
                <div className="flex items-center justify-center relative">
                  <div className="transition-all duration-300 ease-out">
                    <ClassicIcon className="w-32 h-10 md:w-45 md:h-14" />
                  </div>
                </div>
              </div>
            </Motion.button>
          </div>

          <div className="relative group w-full">
            <Motion.button
              variants={itemVariants}
              onClick={() => { triggerHaptic(10); onStartMamak(); }}
              {...bentoMotionProps}
              className="w-full block relative h-20 md:h-27.5 rounded-md overflow-hidden bg-[#22c55e] shadow-[0_5px_0_#16a34a] border-none"
            >
              <div className="relative z-10 flex items-center justify-between px-8 h-full">
                <div className="flex flex-col items-start text-right">
                  <h3 className="text-2xl md:text-[34px] font-black font-heading text-white drop-shadow-md">مامک</h3>
                </div>
                <div className="flex items-center justify-center relative">
                  <div className="transition-all duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-1">
                    <MamakIcon className="w-16 h-16 md:w-21 md:h-21" />
                  </div>
                </div>
              </div>
            </Motion.button>
          </div>

          <div className="relative group w-full">
            <Motion.button
              variants={itemVariants}
              onClick={() => { triggerHaptic(10); onStartHardWords(); }}
              {...bentoMotionProps}
              className="w-full block relative h-20 md:h-27.5 rounded-md overflow-hidden bg-[#ef4444] shadow-[0_5px_0_#dc2626] border-none"
            >
              <div className="relative z-10 flex items-center justify-between px-8 h-full">
                <div className="flex flex-col items-start text-right">
                  <h3 className="text-2xl md:text-[34px] font-black font-heading text-white drop-shadow-md">پەیڤێن دژوار</h3>
                </div>
                <div className="flex items-center justify-center relative">
                  <div className="transition-all duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-1">
                    <CubeIcon className="w-16 h-16 md:w-21 md:h-21" />
                  </div>
                </div>
              </div>
            </Motion.button>
          </div>

          <div className="relative group w-full">
            <Motion.button
              variants={itemVariants}
              onClick={() => { triggerHaptic(10); onStartWordFever(); }}
              {...bentoMotionProps}
              className="w-full block relative h-20 md:h-27.5 rounded-md overflow-hidden bg-[#0ea5e9] shadow-[0_5px_0_#0284c7] border-none"
            >
              <div className="relative z-10 flex items-center justify-between px-8 h-full">
                <div className="flex flex-col items-start text-right">
                  <h3 className="text-2xl md:text-[34px] font-black font-heading text-white drop-shadow-md">تایا پەیڤان</h3>
                </div>
                <div className="flex items-center justify-center relative">
                  <div className="transition-all duration-300 ease-out group-hover:scale-110 group-hover:-rotate-12">
                    <TimerIcon className="w-13 h-13" />
                  </div>
                </div>
              </div>
            </Motion.button>
          </div>

          {/* Dynamic Ad Banner Space */}
          <AdBanner />
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
                  
                  <div className={`overflow-y-auto h-62.5 pr-2 custom-scrollbar space-y-2 mb-4 transition-opacity duration-300 ${loadingOnline ? 'opacity-50' : 'opacity-100'}`}>
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
                className="absolute top-6 right-6 z-50 w-8 h-8 rounded-full bg-white dark:bg-mono-800 text-mono-400 hover:text-mono-900 dark:hover:text-white flex items-center justify-center transition-colors shadow-lg border border-mono-200 dark:border-transparent"
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
              {(() => {
                const targetObj = invitedUserProfile || opponent || {};
                const oppFont = NAME_FONTS[targetObj.equipped_font] || NAME_FONTS['default-ku'];
                const oppStyle = NAME_STYLES[targetObj.equipped_name_style] || {};
                const oppBundle = BUNDLES[targetObj.equipped_bundle] || BUNDLES['default'];
                
                const name = targetObj.nickname || 'یاریزان';
                const nameLen = Math.max(name.length, 1);
                const wideFonts = ['press-start-2p', 'bangers', 'blunt-wide', 'digiface', 'digital', 'lcd', 'runiga', 'god-of-war', 'fungky-brow', 'ncl-halloween-danger', 'awesome-christmas'];
                const isWideFont = wideFonts.includes(targetObj.equipped_font);
                
                const baselineLen = isWideFont ? 3 : 6;
                const scaleFactor = Math.min(1.15, Math.max(0.25, baselineLen / nameLen));
                const baseSize = oppFont.style?.fontSize ? parseFloat(oppFont.style.fontSize) : 1.4;
                const dynamicFontSize = `${baseSize * scaleFactor}em`;

                return (
                  <span 
                    dir="auto"
                    className={`font-black text-lg sm:text-xl tracking-normal drop-shadow-sm dark:drop-shadow-md whitespace-nowrap block max-w-62.5 overflow-visible py-2 px-3 text-center mx-auto ${oppBundle.id !== 'default' ? (oppBundle.fontKurdish + ' ' + oppBundle.textStyle) : (oppStyle.class || 'text-mono-900 dark:text-white')}`}
                    style={{
                      ...(oppBundle.id !== 'default' ? {} : oppFont.style),
                      fontSize: dynamicFontSize
                    }}
                  >
                    {name}
                  </span>
                );
              })()}
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
              {(() => {
                const myFont = NAME_FONTS[equippedFont] || NAME_FONTS['default-ku'];
                const myStyle = NAME_STYLES[equippedNameStyle] || {};
                const myBundle = BUNDLES[equippedBundle] || BUNDLES['default'];
                
                const name = userNickname || 'یاریزان';
                const nameLen = Math.max(name.length, 1);
                const wideFonts = ['press-start-2p', 'bangers', 'blunt-wide', 'digiface', 'digital', 'lcd', 'runiga', 'god-of-war', 'fungky-brow', 'ncl-halloween-danger', 'awesome-christmas'];
                const isWideFont = wideFonts.includes(equippedFont);
                
                const baselineLen = isWideFont ? 3 : 6;
                const scaleFactor = Math.min(1.15, Math.max(0.25, baselineLen / nameLen));
                const baseSize = myFont.style?.fontSize ? parseFloat(myFont.style.fontSize) : 1.4;
                const dynamicFontSize = `${baseSize * scaleFactor}em`;

                return (
                  <span 
                    dir="auto"
                    className={`font-black text-lg sm:text-xl tracking-normal drop-shadow-sm dark:drop-shadow-md whitespace-nowrap block max-w-62.5 overflow-visible py-2 px-3 text-center mx-auto ${myBundle.id !== 'default' ? (myBundle.fontKurdish + ' ' + myBundle.textStyle) : (myStyle.class || 'text-mono-900 dark:text-white')}`}
                    style={{
                      ...(myBundle.id !== 'default' ? {} : myFont.style),
                      fontSize: dynamicFontSize
                    }}
                  >
                    {name}
                  </span>
                );
              })()}
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
            key="report-modal"
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            user={user}
          />
        )}
        <InstallGuideModal
          key="install-modal"
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
        />
      </AnimatePresence>

      {/* Onboarding Tour */}
      {profileData && profileData.has_completed_install_guide === false && !tourCompleted && (
        <OnboardingOverlay
          steps={[
            {
              targetId: 'btn-download-game',
              title: 'یاریێ دابگرە',
              text: 'ژ بۆ ئەزموونەکا باشتر و بێ ئاریشە، پێدڤییە یاریێ ب شێوەیەکێ سەرەکی دابگریە سەر شاشەیا خوە. کلیکێ ل ڤێ دوگمەیێ بکە دا کو فێرکاریێ ببینی.',
              position: 'bottom'
            }
          ]}
          onComplete={() => {
            setTourCompleted(true);
            setIsInstallModalOpen(true);
          }}
        />
      )}
    </Motion.div>
  );
});

export default LobbyView;
