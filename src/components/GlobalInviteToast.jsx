import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/AuthContext';
import useMultiplayer from '../hooks/useMultiplayer';
import { supabase } from '../lib/supabase';
import { triggerHaptic } from '../utils/haptics';
import { useAudio } from '../context/AudioContext';
import Avatar from './Avatar';

const GlobalInviteToast = ({ setGameMode, currentView }) => {
  const { user } = useUser();
  const { playNotifSound } = useAudio();
  const { joinPrivateMatch, multiplayerState } = useMultiplayer();
  
  const currentViewRef = useRef(currentView);
  const multiplayerStateRef = useRef(multiplayerState);

  useEffect(() => {
    currentViewRef.current = currentView;
    multiplayerStateRef.current = multiplayerState;
  }, [currentView, multiplayerState]);

  const broadcastReply = async (hostId, event, payload) => {
    const topic = `host_replies_${hostId}`;
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
      (payload) => {
        console.log('Received Invite Payload:', payload);
        const inviteData = payload.payload;

        const isBusy = currentViewRef.current === 'game' || (multiplayerStateRef.current && multiplayerStateRef.current !== 'idle');
        
        if (isBusy) {
           console.log('User is busy, auto-rejecting invite.');
           broadcastReply(inviteData.hostId, 'match_invite_busy', { roomId: inviteData.roomId, joinerId: user.id });
           return;
        }

        setInvite({
          hostId: inviteData.hostId,
          hostName: inviteData.hostName,
          hostAvatar: inviteData.hostAvatar,
          roomId: inviteData.roomId,
          timestamp: Date.now()
        });
        
        playNotifSound();
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
  }, [user?.id, playNotifSound]);

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
    if (setGameMode) setGameMode('multiplayer');
    
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
            animate={{ opacity: 1, y: 20, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed top-0 left-0 right-0 z-9999 flex justify-center px-4 pointer-events-none"
          >
            <div className="bg-mono-100 dark:bg-mono-900 rounded p-4 shadow-2xl border border-mono-200 dark:border-mono-800 pointer-events-auto max-w-sm w-full flex flex-col gap-3 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/20 relative overflow-hidden">
                  {invite.hostAvatar ? (
                    <Avatar src={invite.hostAvatar} size="full" border={false} />
                  ) : (
                    <span className="material-symbols-outlined text-blue-500">swords</span>
                  )}
                </div>
                <p className="text-sm font-bold text-mono-900 dark:text-white leading-tight">
                  <span className="text-blue-600 dark:text-blue-400 font-black">{invite.hostName}</span> داخوازا یارییەکا هەڤڕکی ژ تە دکەت! ⚔️
                </p>
              </div>
              
              <div className="flex gap-2 mt-1">
                <button 
                  onClick={handleDecline}
                  className="flex-1 py-2.5 rounded bg-mono-200 dark:bg-mono-800 text-mono-600 dark:text-mono-400 font-bold text-xs hover:bg-mono-300 dark:hover:bg-mono-700 transition-colors"
                >
                  رەتکرن
                </button>
                <button 
                  onClick={handleAccept}
                  className="flex-1 py-2.5 rounded bg-green-500 hover:bg-green-600 text-white font-bold text-xs shadow-md shadow-green-500/20 transition-colors"
                >
                  قەبوولکرن
                </button>
              </div>
              
              {/* Countdown bar indicator */}
              <Motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 15, ease: "linear" }}
                className="absolute bottom-0 left-0 h-1 bg-blue-500 opacity-80"
              />
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
              className="bg-mono-100 dark:bg-mono-900 rounded-md p-5 shadow-2xl border border-mono-200 dark:border-mono-800 max-w-[260px] w-full flex flex-col items-center gap-3 text-center"
              dir="rtl"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-red-500 text-2xl">error</span>
              </div>
              <p className="text-sm font-bold text-mono-900 dark:text-white leading-relaxed">
                داخوازنامە ژ لایێ <span className="text-blue-600 dark:text-blue-400 mx-1">{cancelAlert}</span> ڤە هاتە هەلوەشاندن
              </p>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalInviteToast;
