import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/AuthContext';
import useMultiplayer from '../hooks/useMultiplayer';
import { supabase } from '../lib/supabase';
import { triggerHaptic } from '../utils/haptics';
import { useAudio } from '../context/AudioContext';

const GlobalInviteToast = () => {
  const { user } = useUser();
  const { joinPrivateMatch } = useMultiplayer();
  const { playNotifSound } = useAudio();
  
  const [invite, setInvite] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;

    console.log(`[GlobalInviteToast] Listening for invites on channel: user_invites_${user.id}...`);
    
    const channel = supabase.channel(`user_invites_${user.id}`);
    channel.on('broadcast', { event: 'match_invite' }, (payload) => {
      console.log('[GlobalInviteToast] Invite Received!', payload);
      const inviteData = payload.payload;
      setInvite(inviteData);
      
      // Play notification sound & haptic
      if (playNotifSound) playNotifSound();
      triggerHaptic(15);

      // Auto dismiss after 10 seconds
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setInvite(null);
      }, 10000);
    }).subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user?.id, playNotifSound]);

  const handleAccept = () => {
    triggerHaptic(15);
    if (invite?.roomId) {
      joinPrivateMatch(invite.roomId);
    }
    setInvite(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleDecline = () => {
    triggerHaptic(10);
    setInvite(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  return (
    <AnimatePresence>
      {invite && (
        <Motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 20, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed top-0 left-0 right-0 z-9999 flex justify-center px-4 pointer-events-none"
        >
          <div className="bg-mono-100 dark:bg-mono-900 rounded-2xl p-4 shadow-2xl border border-mono-200 dark:border-mono-800 pointer-events-auto max-w-sm w-full flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-blue-500">swords</span>
              </div>
              <p className="text-sm font-bold text-mono-900 dark:text-white leading-tight">
                <span className="text-blue-600 dark:text-blue-400 font-black">{invite.hostName}</span> داخوازا یارییەکا هەڤڕکی ژ تە دکەت! ⚔️
              </p>
            </div>
            
            <div className="flex gap-2 mt-1">
              <button 
                onClick={handleDecline}
                className="flex-1 py-2.5 rounded-xl bg-mono-200 dark:bg-mono-800 text-mono-600 dark:text-mono-400 font-bold text-xs hover:bg-mono-300 dark:hover:bg-mono-700 transition-colors"
              >
                رەتکرن
              </button>
              <button 
                onClick={handleAccept}
                className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-xs shadow-md shadow-green-500/20 transition-colors"
              >
                قەبوولکرن
              </button>
            </div>
            
            {/* Countdown bar indicator */}
            <Motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 8, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1 bg-blue-500 opacity-80"
            />
          </div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalInviteToast;
