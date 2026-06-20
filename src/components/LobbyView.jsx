import React, { useRef, useState, useEffect, memo } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { DerhemIcon } from './CurrencyIcon';
import { triggerHaptic } from '../utils/haptics';
import { useAudio } from '../context/AudioContext';
import { useUser } from '../context/AuthContext';
import Avatar from './Avatar';
import ClashingSwords from './ClashingSwords';
import ClassicIcon from './ClassicIcon';
import MamakIcon from './MamakIcon';
import CubeIcon from './CubeIcon';
import TimerIcon from './TimerIcon';
import { getLevelFromXP } from '../utils/progression';
import useMultiplayer from '../hooks/useMultiplayer';

const LobbyView = memo(({
  onStartClassic,
  onStartMamak,
  onStartHardWords,
  onStartWordFever,
  onStartMultiplayer,
  _onDailyRewardClick,
  _dailyStreak,
  _notificationCount = 0,
  onOpenHowToPlay
}) => {
  const bgRef = useRef(null);
  const [showMultiplayerModal, setShowMultiplayerModal] = useState(false);
  const [inviteStep, setInviteStep] = useState('select'); 
  const [onlineProfiles, setOnlineProfiles] = useState([]);
  const [loadingOnline, setLoadingOnline] = useState(false);
  const [sentInvites, setSentInvites] = useState(new Set());
  
  const { playSettingsOpenSound } = useAudio();
  const { user, userNickname, onlineUsers } = useUser();
  const { createPrivateMatch, multiplayerState, activeMatch, cancelMatch } = useMultiplayer();

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
            const { data, error } = await supabase
              .from('profiles')
              .select('id, nickname, avatar_url, xp')
              .in('id', onlineIds)
              .limit(50);
              
            if (!error && data) {
              setOnlineProfiles(data);
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
      const { supabase } = await import('../lib/supabase');
      const newRoomId = await createPrivateMatch(targetUserId);
      if (!newRoomId) {
        alert('کێشەیەک دروست بوو د چێکرنا ژوورێ دا.');
        setSentInvites(prev => {
          const next = new Set(prev);
          next.delete(targetUserId);
          return next;
        });
        return;
      }

      console.log(`[LobbyView] Invite sent via DB match creation for user ${targetUserId}`);
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

  return (
    <Motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      onClick={handleBackgroundClick}
      className="flex-1 w-full max-w-full px-4 pt-4 pb-4 overflow-x-hidden bg-mono-white dark:bg-black relative h-full bg-trigger-zone transition-colors duration-500"
    >
      <div className="relative z-10">
        <div className="flex flex-col mb-4 px-1 gap-2 mt-0 relative z-10 w-full justify-start">
          <div className="flex items-center justify-start w-full">
            <div className="flex items-center gap-2">
              <Motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { triggerHaptic(10); playSettingsOpenSound(); onOpenHowToPlay?.(); }}
                className="h-8 px-3 bg-[#8b5cf6] shadow-[0_3px_0_#6d28d9] hover:brightness-110 rounded-[5px] flex items-center justify-center gap-1.5 group transition-all border-none mb-1"
              >
                <span className="material-symbols-outlined text-white text-[16px] group-hover:scale-110 transition-transform">
                  help
                </span>
                <span className="text-[11px] font-black font-rabar text-white uppercase mt-0.5">فێرکاری</span>
              </Motion.button>
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
              className="w-full relative h-28 rounded-[6px] overflow-hidden bg-linear-to-r from-[#ff6b00] to-[#e65c00] shadow-[0_5px_0_#cc5200] border-none mb-1"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
              <div className="relative z-10 flex items-center justify-between px-8 h-full">
                <div className="flex flex-col items-start text-right">
                  <h3 className="text-2xl font-black font-heading text-white">ھەڤڕکی</h3>
                  <span className="text-[11px] font-black font-noto-sans-arabic text-orange-100/80 leading-none">سەرهێڵ</span>
                </div>
                <div className="flex items-center justify-center relative">
                  <div className="transition-all duration-300 ease-out">
                    <ClashingSwords className="w-14 h-14 drop-shadow-md text-white/90 group-hover:text-white group-hover:scale-110 group-hover:-rotate-3" />
                  </div>
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
              className="w-full max-w-sm bg-mono-100 dark:bg-mono-900 rounded-2xl p-6 shadow-2xl border border-mono-200 dark:border-mono-800 flex flex-col max-h-[80vh]"
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
                      className="w-full py-4 rounded-xl bg-linear-to-r from-[#ff6b00] to-[#e65c00] hover:brightness-110 text-white font-black text-sm shadow-md flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">public</span>
                      لێگەڕیانا گشتی
                    </button>
                    <button 
                      onClick={() => {
                        triggerHaptic(10);
                        setInviteStep('invite');
                      }}
                      className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">person_add</span>
                      داخوازکرنا تایبەت
                    </button>
                    <button 
                      onClick={() => setShowMultiplayerModal(false)}
                      className="w-full py-3 rounded-xl bg-mono-200 dark:bg-mono-800 text-mono-600 dark:text-mono-400 font-bold text-sm mt-2"
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
                    <h3 className="text-lg font-black text-center text-mono-900 dark:text-white flex-1 mr-4">یاریزانێن ئۆنلاین</h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto min-h-[150px] pr-2 custom-scrollbar space-y-2 mb-4">
                    {loadingOnline ? (
                      <div className="flex flex-col items-center justify-center py-8 opacity-50">
                        <span className="material-symbols-outlined animate-spin text-2xl text-blue-500 mb-2">sync</span>
                        <p className="text-sm font-medium text-mono-600 dark:text-mono-400">لێگەڕیان ل یاریزانان...</p>
                      </div>
                    ) : onlineProfiles.length > 0 ? (
                      onlineProfiles.map(profile => {
                        const isSent = sentInvites.has(profile.id);
                        return (
                          <div key={profile.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-mono-800/50 border border-mono-200 dark:border-mono-700 shadow-sm transition-all hover:border-blue-500/50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-mono-200 dark:bg-mono-700 border-2 border-green-500 relative shrink-0">
                                <Avatar src={profile.avatar_url} size="full" border={false} />
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-mono-800 rounded-full"></div>
                              </div>
                              <div className="flex flex-col items-start">
                                <span className="text-sm font-bold text-mono-900 dark:text-white leading-tight">
                                  {profile.nickname || 'یاریزان'}
                                </span>
                                {profile.xp !== undefined && (
                                  <span className="text-[10px] font-medium text-mono-500 dark:text-mono-400">
                                    ئاستێ {getLevelFromXP(profile.xp)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleSendInviteToUser(profile.id)}
                              disabled={isSent}
                              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                                isSent 
                                  ? 'bg-green-500/10 text-green-600 dark:text-green-400 cursor-default' 
                                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                              }`}
                            >
                              {isSent ? (
                                <>
                                  <span className="material-symbols-outlined text-[14px]">check</span>
                                  هنارت
                                </>
                              ) : (
                                'داخوازی'
                              )}
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                        <div className="w-12 h-12 rounded-full bg-mono-200 dark:bg-mono-800 flex items-center justify-center mb-3 text-mono-400">
                          <span className="material-symbols-outlined text-2xl">person_off</span>
                        </div>
                        <p className="text-sm font-medium text-mono-600 dark:text-mono-400">چ یاریزانێن دی نۆکە ئۆنلاین نینە.</p>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 mt-auto pt-2 border-t border-mono-200 dark:border-mono-800">
                    <button 
                      onClick={() => setShowMultiplayerModal(false)}
                      className="w-full py-3 rounded-xl bg-mono-200 dark:bg-mono-800 text-mono-600 dark:text-mono-400 font-bold text-sm"
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
        {multiplayerState === 'private_lobby' && activeMatch && (
          <Motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <Motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm bg-mono-100 dark:bg-mono-900 rounded-2xl p-6 shadow-2xl border border-mono-200 dark:border-mono-800 relative overflow-hidden"
            >
              <div className="absolute -inset-20 bg-linear-to-tr from-primary/20 via-transparent to-blue-500/20 animate-spin-slow opacity-50" />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl text-primary animate-pulse">hourglass_empty</span>
                </div>
                
                <h3 className="text-xl font-black text-center text-mono-900 dark:text-white mb-2">ژوورا تایبەت</h3>
                <p className="text-sm text-center text-mono-500 mb-8 font-medium">ل چاوەڕێیا هەڤالی...</p>
                
                <button 
                  onClick={() => { triggerHaptic(10); cancelMatch(); }}
                  className="w-full py-3.5 rounded-xl bg-mono-200 dark:bg-mono-800 text-mono-600 dark:text-mono-400 hover:text-red-500 hover:bg-red-500/10 font-bold text-sm transition-colors"
                >
                  ڤەگەڕیان و داخستنا ژوورێ
                </button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.div>
  );
});

export default LobbyView;
