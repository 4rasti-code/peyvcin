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
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed top-[calc(env(safe-area-inset-top,0px)+16px)] left-0 right-0 z-[9999] flex justify-center px-4 pointer-events-none"
          >
            <div className="bg-mono-100 dark:bg-mono-900 rounded-md p-4 shadow-xl border border-mono-200 dark:border-mono-800 max-w-[320px] w-full pointer-events-auto flex flex-col gap-4 relative overflow-hidden" dir="rtl">
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-mono-200 dark:border-mono-800 bg-mono-200 dark:bg-mono-800 flex items-center justify-center">
                  {invite.hostAvatar ? (
                    <Avatar src={invite.hostAvatar} size="full" border={false} />
                  ) : (
                    <span className="material-symbols-outlined text-mono-500 text-xl">swords</span>
                  )}
                </div>
                
                <div className="flex flex-col">
                  <span className="text-blue-500 font-bold text-xs mb-0.5">داخوازیا هەڤڕکیێ</span>
                  <p className="text-sm font-bold text-mono-900 dark:text-white leading-tight">
                    <span className="text-blue-600 dark:text-blue-400">{invite.hostName}</span> داخوازا یاریێ ژ تە دکەت!
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleDecline}
                  className="flex-1 py-2 rounded-md bg-mono-200 hover:bg-mono-300 dark:bg-mono-800 dark:hover:bg-mono-700 text-mono-700 dark:text-mono-300 transition-colors font-bold text-[13px] flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                  ڕەتکرن
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors font-bold text-[13px] flex items-center justify-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">swords</span>
                  قەبوولکرن
                </button>
              </div>
              
              {/* Simple Countdown Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-mono-200 dark:bg-mono-800">
                <Motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 15, ease: "linear" }}
                  className="h-full bg-blue-500"
                />
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
                <span className="material-symbols-outlined text-red-500 text-3xl">cancel</span>
              </div>
              <p className="text-mono-800 dark:text-white font-black text-sm">
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
