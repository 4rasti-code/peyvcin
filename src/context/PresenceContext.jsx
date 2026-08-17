/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from './AuthContext';

const PresenceContext = createContext({});

export const usePresence = () => {
  return useContext(PresenceContext);
};

export const PresenceProvider = ({ children }) => {
  const { user } = useUser();
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [onlineUserStatuses, setOnlineUserStatuses] = useState({});
  const [onlineCount, setOnlineCount] = useState(0);

  const presenceChannelRef = useRef(null);
  const currentBusyModeRef = useRef('idle');
  const trackTimeoutRef = useRef(null);

  // Expose the update status function
  const updatePresenceStatus = useCallback((busyMode) => {
    currentBusyModeRef.current = busyMode;
    if (trackTimeoutRef.current) clearTimeout(trackTimeoutRef.current);
    
    const sendTrackRequest = async () => {
      try {
        if (presenceChannelRef.current && user?.id && (presenceChannelRef.current.state === 'joined' || presenceChannelRef.current.state === 'SUBSCRIBED')) {
          const isAdmin = user?.email === '4rasti@gmail.com';
          if (!isAdmin) {
            await presenceChannelRef.current.track({ busy_mode: currentBusyModeRef.current, online_at: new Date().toISOString() });
          }
        }
      } catch (e) {
        console.error("Presence track error:", e);
      }
    };

    if (busyMode === 'idle') {
      sendTrackRequest();
    } else {
      trackTimeoutRef.current = setTimeout(sendTrackRequest, 1000);
    }
  }, [user]);

  const forceRefreshPresence = useCallback(() => {
    if (presenceChannelRef.current && presenceChannelRef.current.state === 'joined') {
      if (user && user.email !== '4rasti@gmail.com') {
        presenceChannelRef.current.track({ busy_mode: currentBusyModeRef.current, online_at: new Date().toISOString() }).catch(() => {});
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    const isAdmin = user?.email === '4rasti@gmail.com';
    let isMounted = true;

    const initializeChannel = () => {
      // Clean up old channel if it exists
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }

      // Optimization #2: Keyed Presence
      const channel = supabase.channel('global:app_presence', {
        config: {
          presence: {
            key: user.id
          }
        }
      });
      presenceChannelRef.current = channel;

      // Optimization #3: Efficient state management with keyed payloads
      channel.on('presence', { event: 'sync' }, () => {
        if (!isMounted) return;
        const state = channel.presenceState();
        
        const newOnlineUsers = new Set();
        const newStatuses = {};

        Object.keys(state).forEach(presenceKey => {
          let latestPresence = state[presenceKey][0];
          for (let i = 1; i < state[presenceKey].length; i++) {
             if (new Date(state[presenceKey][i].online_at) > new Date(latestPresence.online_at)) {
                 latestPresence = state[presenceKey][i];
             }
          }

          const realId = latestPresence.user_id || presenceKey;

          if (realId !== '9a813c24-b662-477d-a74a-6f822d17bbf1' && realId !== '66bbf4d5-333a-4748-8529-ecd5bae9f3a4' && realId !== user.id) {
            newOnlineUsers.add(realId);

            if (latestPresence?.busy_mode && latestPresence.busy_mode !== 'idle') {
              newStatuses[realId] = latestPresence.busy_mode;
            }
          }
        });

        setOnlineUsers(newOnlineUsers);
        setOnlineUserStatuses(newStatuses);
        setOnlineCount(newOnlineUsers.size);
      });

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && isMounted) {
          if (!isAdmin) {
            await channel.track({ busy_mode: currentBusyModeRef.current, online_at: new Date().toISOString() });
          }
        }
      });
    };

    // Initial setup
    initializeChannel();

    const handleVisibilityChange = async () => {
      if (!presenceChannelRef.current) return;
      
      if (document.visibilityState === 'visible') {
        const state = presenceChannelRef.current.state;
        
        // 1. If connected normally, just update our presence timestamp to show we are back active
        if (state === 'joined' || state === 'SUBSCRIBED') {
          if (!isAdmin) {
            try {
              await presenceChannelRef.current.track({ busy_mode: currentBusyModeRef.current, online_at: new Date().toISOString() });
            } catch (e) {
              console.error("Presence re-track failed:", e);
            }
          }
        } 
        // 2. If the OS killed the connection while sleeping, rebuild the entire channel!
        else if (state === 'closed' || state === 'errored' || state === 'CHANNEL_ERROR') {
          console.warn("[Presence] Channel dead on wake. Rebuilding...");
          initializeChannel();
        }
      } else {
        // Optimization: When the user minimizes the app, instantly show them as offline to others
        // This prevents them from receiving invites while they aren't looking at the screen.
        if (!isAdmin && presenceChannelRef.current.state === 'joined') {
          presenceChannelRef.current.untrack().catch(() => {});
        }
      }
    };
    
    // Optimization: Instant disconnect on tab close
    const handleBeforeUnload = () => {
      if (presenceChannelRef.current) {
        // Run untrack and remove synchronously
        presenceChannelRef.current.untrack();
        supabase.removeChannel(presenceChannelRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (presenceChannelRef.current) {
        presenceChannelRef.current.untrack();
        supabase.removeChannel(presenceChannelRef.current);
      }
      presenceChannelRef.current = null;
    };
  }, [user]);

  return (
    <PresenceContext.Provider value={{
      onlineUsers,
      onlineUserStatuses,
      onlineCount,
      updatePresenceStatus,
      forceRefreshPresence
    }}>
      {children}
    </PresenceContext.Provider>
  );
};
