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

    // Optimization #2: Keyed Presence
    const presenceChannel = supabase.channel('global:app_presence', {
      config: {
        presence: {
          key: user.id
        }
      }
    });
    presenceChannelRef.current = presenceChannel;

    // Optimization #3: Efficient state management with keyed payloads
    presenceChannel.on('presence', { event: 'sync' }, () => {
      if (!isMounted) return;
      const state = presenceChannel.presenceState();
      
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

    presenceChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED' && isMounted) {
        if (!isAdmin) {
          await presenceChannel.track({ busy_mode: currentBusyModeRef.current, online_at: new Date().toISOString() });
        }
      }
    });

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        if (presenceChannelRef.current && (presenceChannelRef.current.state === 'joined' || presenceChannelRef.current.state === 'SUBSCRIBED') && !isAdmin) {
          try {
            await presenceChannelRef.current.track({ busy_mode: currentBusyModeRef.current, online_at: new Date().toISOString() });
          } catch (e) {
            console.error("Presence re-track failed on visibility change:", e);
          }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(presenceChannel);
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
