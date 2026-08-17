import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/AuthContext';
import useMultiplayer from '../hooks/useMultiplayer';
import { supabase } from '../lib/supabase';
import { triggerHaptic } from '../utils/haptics';
import { useAudio } from '../context/AudioContext';
import Avatar from './Avatar';

const GlobalInviteToast = ({ setGameMode, currentView, setCurrentView, gameMode }) => {
  const { user } = useUser();
  const { playInviteSound } = useAudio();
  const { joinPrivateMatch, multiplayerState } = useMultiplayer();

  const currentViewRef = useRef(currentView);
  const multiplayerStateRef = useRef(multiplayerState);
  const gameModeRef = useRef(gameMode);

  useEffect(() => {
    currentViewRef.current = currentView;
    multiplayerStateRef.current = multiplayerState;
    gameModeRef.current = gameMode;
  }, [currentView, multiplayerState, gameMode]);

  const broadcastReply = async (hostId, event, payload) => {
    const topic = `host_replies_${hostId}`;
    let channel = supabase.getChannels().find(c => c.topic === `realtime:${topic}`);
    
    if (channel && channel.state === 'joined') {
      await channel.send({ type: 'broadcast', event, payload });
      return;
    }

    if (channel) {
      supabase.removeChannel(channel);
    }

    const newChannel = supabase.channel(topic, { config: { broadcast: { ack: true } } });
    newChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        try {
          await newChannel.send({ type: 'broadcast', event, payload });
        } catch (e) {
          console.error("Broadcast reply failed", e);
        } finally {
          setTimeout(() => {
            supabase.removeChannel(newChannel);
          }, 1000);
        }
      }
    });
  };

  const [invite, setInvite] = useState(null);
  const [cancelAlert, setCancelAlert] = useState(null);
  const inviteRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    inviteRef.current = invite;
  }, [invite]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase.channel(`user_invites_${user.id}`);

    channel.on(
      'broadcast',
      { event: 'match_invite' },
      async (payload) => {
        console.log('Received Invite Payload:', payload);
        const inviteData = payload.payload;

        // VERIFY AGAINST GHOST INVITES: Check if room is actually still waiting
        const { data: roomCheck } = await supabase
          .from('online_matches')
          .select('status')
          .eq('id', inviteData.roomId)
          .single();

        if (!roomCheck || roomCheck.status !== 'private_waiting') {
          console.warn('[GlobalInviteToast] Ignored ghost invite (room deleted or started).', inviteData.roomId);
          return;
        }

        const isBusy = currentViewRef.current === 'game' || (multiplayerStateRef.current && multiplayerStateRef.current !== 'idle');

        if (isBusy) {
          console.log('User is busy, auto-rejecting invite.');
          broadcastReply(inviteData.hostId, 'match_invite_busy', { roomId: inviteData.roomId, joinerId: user.id, busyMode: gameModeRef.current });
          return;
        }

        setInvite({
          hostId: inviteData.hostId,
          hostName: inviteData.hostName,
          hostAvatar: inviteData.hostAvatar,
          roomId: inviteData.roomId,
          timestamp: Date.now()
        });

        playInviteSound();
        triggerHaptic(10);

        // Auto-dismiss after 14 seconds
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setInvite(null);
        }, 14000);
      }
    )
      .on('broadcast', { event: 'invite_cancelled' }, (payload) => {
        if (payload.payload.roomId === inviteRef.current?.roomId) {
          setInvite(null);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          triggerHaptic(50);
          const hostName = inviteRef.current?.hostName || 'یاریزان';
          setCancelAlert(hostName);
        }
      })
      .subscribe((status) => {
        console.log('B. Receiver channel status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user?.id, playInviteSound]);

  useEffect(() => {
    if (cancelAlert) {
      const timer = setTimeout(() => {
        setCancelAlert(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [cancelAlert]);


  const handleAccept = async () => {
    triggerHaptic(15);

    // 1. FORCE BLUR: Close OS keyboard and clear focus from chat inputs
    if (document.activeElement) {
      document.activeElement.blur();
    }

    // 2. DISPATCH EVENT: Tell SocialHub to clean up internal state
    window.dispatchEvent(new Event('forceCloseChat'));

    if (setGameMode) setGameMode('multiplayer');
    if (setCurrentView) setCurrentView('game'); // STRICTLY ROUTE TO GAME VIEW

    if (invite?.roomId && invite?.hostId) {
      joinPrivateMatch(invite.roomId);

      // Broadcast acceptance to host for INSTANT transition
      // Broadcast acceptance to host for INSTANT transition
      await broadcastReply(invite.hostId, 'match_invite_accepted', { roomId: invite.roomId, joinerId: user.id });
    } else if (invite?.roomId) {
      joinPrivateMatch(invite.roomId);
    }
    setInvite(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleDecline = async () => {
    triggerHaptic(10);

    if (invite?.hostId && invite?.roomId) {
      // Broadcast rejection to host
      // Broadcast rejection to host
      await broadcastReply(invite.hostId, 'match_invite_rejected', { roomId: invite.roomId });
    }

    setInvite(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  return (
    <>
      <AnimatePresence>
        {invite && (
          <Motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9, filter: 'blur(10px)' }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="fixed top-[calc(env(safe-area-inset-top,0px)+16px)] left-0 right-0 z-[9999] flex justify-center px-4 pointer-events-none"
          >
            <div className="relative rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.3)] pointer-events-auto max-w-[340px] w-full p-[2px] overflow-hidden group">
              {/* Spinning Glowing Border */}
              <div className="absolute -inset-[100%] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#3b82f6_25%,transparent_50%,#ef4444_75%,transparent_100%)] animate-[spin_4s_linear_infinite] opacity-100" />
              
              {/* Inner Glass Card */}
              <div className="relative bg-mono-900/95 backdrop-blur-2xl rounded-[14px] p-4 flex flex-col gap-4 border border-white/10 z-10 overflow-hidden shadow-inner">
                {/* Subtle top glare */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <div className="relative z-10 flex items-center gap-3">
                  {/* Avatar with pulsing neon ring */}
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30" />
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] relative z-10 bg-mono-800 flex items-center justify-center p-0.5">
                      <div className="w-full h-full rounded-full overflow-hidden bg-mono-900">
                        {invite.hostAvatar ? (
                          <Avatar src={invite.hostAvatar} size="full" border={false} />
                        ) : (
                          <span className="material-symbols-outlined text-white text-xl">swords</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Text Container */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-blue-400 text-[10px] font-bold tracking-wider drop-shadow-sm mb-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      داخوازیا هەڤڕکیێ
                    </span>
                    <p className="text-[13px] font-medium text-mono-200 leading-tight">
                      <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 drop-shadow-sm truncate block">{invite.hostName}</span> 
                      داخوازا یاریێ ژ تە دکەت!
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2.5 relative z-10 mt-1">
                  <button
                    onClick={handleDecline}
                    className="flex-1 py-2.5 rounded-xl bg-mono-800/80 hover:bg-red-500/10 text-mono-400 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all font-bold text-xs flex items-center justify-center gap-1.5 group/btn"
                  >
                    <span className="material-symbols-outlined text-[16px] group-hover/btn:scale-110 transition-transform">close</span>
                    ڕەتکرن
                  </button>
                  <button
                    onClick={handleAccept}
                    className="flex-[1.5] py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border border-blue-400/50 hover:border-white/50 transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] font-black text-xs flex items-center justify-center gap-1.5 group/btn"
                  >
                    <span className="material-symbols-outlined text-[16px] animate-pulse">swords</span>
                    قەبوولکرن
                  </button>
                </div>
                
                {/* Countdown Progress Bar (Integrated into bottom of card) */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-mono-900">
                  <Motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 15, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 opacity-90 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                  />
                </div>
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cancelAlert && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-auto"
          >
            <Motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-mono-100 dark:bg-mono-900 rounded-md p-5 shadow-2xl border border-mono-200 dark:border-mono-800 max-w-65 w-full flex flex-col items-center gap-3 text-center"
              dir="rtl"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-red-500 text-2xl">error</span>
              </div>
              <p className="text-sm font-bold text-mono-900 dark:text-white leading-relaxed">
                داخوازنامە ژ لایێ <span className="text-red-500 dark:text-red-400 mx-1">{cancelAlert}</span> ڤە هاتە هەلوەشاندن
              </p>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalInviteToast;
