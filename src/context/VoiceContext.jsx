import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { supabase } from '../lib/supabase';

const VoiceContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};

export const VoiceProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [isInChannel, setIsInChannel] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [isDeafened, setIsDeafened] = useState(false);
  const isDeafenedRef = useRef(false);
  const [appId, setAppId] = useState(null);
  
  const clientRef = useRef(null);

  // Fetch Agora App ID from Supabase on mount
  useEffect(() => {
    const fetchAppId = async () => {
      try {
        // We assume the App ID is stored in 'app_settings' table
        const { data, error } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'agora_app_id')
          .single();
          
        if (error) {
          console.error("Failed to fetch Agora App ID from Supabase:", error);
          return;
        }
        
        if (data && data.value) {
          setAppId(data.value);
        }
      } catch (err) {
        console.error("Error fetching Agora App ID:", err);
      }
    };
    
    fetchAppId();
  }, []);

  // Initialize client and setup event listeners
  useEffect(() => {
    if (!appId) return;

    // Disable log upload to prevent adblocker ERR_BLOCKED_BY_CLIENT spam
    AgoraRTC.disableLogUpload();
    
    const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    
    // Defer the state update to avoid synchronous setState inside an effect
    Promise.resolve().then(() => {
      setClient(agoraClient);
    });
    
    clientRef.current = agoraClient;

    const handleUserPublished = async (user, mediaType) => {
      await agoraClient.subscribe(user, mediaType);
      if (mediaType === 'audio') {
        user.audioTrack?.play();
        setRemoteUsers(prev => {
          // If we are currently deafened, mute this new user immediately
          if (isDeafenedRef.current && user.audioTrack) {
            user.audioTrack.setVolume(0);
          }
          return { ...prev, [user.uid]: user };
        });
      }
    };

    const handleUserUnpublished = (user, mediaType) => {
      if (mediaType === 'audio') {
        user.audioTrack?.stop();
        setRemoteUsers(prev => {
          const newUsers = { ...prev };
          delete newUsers[user.uid];
          return newUsers;
        });
      }
    };

    const handleUserLeft = (user) => {
      setRemoteUsers(prev => {
        const newUsers = { ...prev };
        delete newUsers[user.uid];
        return newUsers;
      });
    };

    agoraClient.on('user-published', handleUserPublished);
    agoraClient.on('user-unpublished', handleUserUnpublished);
    agoraClient.on('user-left', handleUserLeft);

    return () => {
      agoraClient.off('user-published', handleUserPublished);
      agoraClient.off('user-unpublished', handleUserUnpublished);
      agoraClient.off('user-left', handleUserLeft);
    };
  }, [appId]);

  const joinVoiceChannel = useCallback(async (channelName, uid = null) => {
    if (!clientRef.current || !appId) {
      console.warn("Agora client or App ID not ready");
      return;
    }
    
    try {
      // Use a token if available, otherwise pass null for testing if tokens are disabled on Agora dashboard
      await clientRef.current.join(appId, channelName, null, uid);
      
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      setLocalAudioTrack(audioTrack);
      
      await clientRef.current.publish([audioTrack]);
      setIsInChannel(true);
      setIsMuted(false);
      
    } catch (error) {
      console.error("Error joining voice channel:", error);
      throw error;
    }
  }, [appId]);

  const leaveVoiceChannel = useCallback(async () => {
    try {
      if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
        setLocalAudioTrack(null);
      }
      
      if (clientRef.current) {
        await clientRef.current.unpublish();
        await clientRef.current.leave();
      }
      
      setIsInChannel(false);
      setRemoteUsers({});
      setIsMuted(false);
    } catch (error) {
      console.error("Error leaving voice channel:", error);
    }
  }, [localAudioTrack]);

  const toggleMute = useCallback(async () => {
    if (localAudioTrack) {
      const newMutedState = !isMuted;
      await localAudioTrack.setMuted(newMutedState);
      setIsMuted(newMutedState);
    }
  }, [localAudioTrack, isMuted]);

  const toggleDeafen = useCallback(() => {
    const newDeafenedState = !isDeafened;
    setIsDeafened(newDeafenedState);
    isDeafenedRef.current = newDeafenedState;
    Object.values(remoteUsers).forEach(user => {
      if (user.audioTrack) {
        user.audioTrack.setVolume(newDeafenedState ? 0 : 100);
      }
    });
  }, [isDeafened, remoteUsers]);

  const isVoiceReady = !!appId && !!client;

  const value = {
    client,
    isVoiceReady,
    isInChannel,
    isMuted,
    isDeafened,
    remoteUsers,
    joinVoiceChannel,
    leaveVoiceChannel,
    toggleMute,
    toggleDeafen
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
};
