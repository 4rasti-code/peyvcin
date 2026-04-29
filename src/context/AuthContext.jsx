/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [authProgress, setAuthProgress] = useState(0);
  const [userNickname, setUserNickname] = useState('یاریزان');
  const [userAvatar, setUserAvatar] = useState('default');
  const [city, setCity] = useState('');
  const [isInKurdistan, setIsInKurdistan] = useState(true);
  const [countryCode, setCountryCode] = useState('IQ');
  const [lastProfileUpdate, setLastProfileUpdate] = useState(() => Date.now());
  const [ownedAvatars, setOwnedAvatars] = useState(() => {
    const saved = localStorage.getItem('peyvchin_owned_avatars');
    return saved ? JSON.parse(saved) : ['default'];
  });
  const [unlockedThemes, setUnlockedThemes] = useState(() => {
    const saved = localStorage.getItem('peyvchin_unlocked_themes');
    return saved ? JSON.parse(saved) : ['default'];
  });
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('peyvchin_current_theme') || 'default';
  });
  const [hapticEnabled, setHapticEnabled] = useState(() => {
    const saved = localStorage.getItem('peyvchin_haptic_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [profileData, setProfileData] = useState(null);

  const isProfileLoaded = useRef(false);
  const syncPromiseRef = useRef(null);

  // Cross-context state ref for stable callbacks
  const authStateRef = useRef({ user, userNickname, userAvatar, countryCode, isInKurdistan });
  useEffect(() => {
    authStateRef.current = { user, userNickname, userAvatar, countryCode, isInKurdistan };
  }, [user, userNickname, userAvatar, countryCode, isInKurdistan]);

  const syncProfile = useCallback(async (userId, onProfileLoaded) => {
    const activeUserId = userId || authStateRef.current.user?.id;
    if (!activeUserId || activeUserId === 'undefined' || typeof activeUserId !== 'string' || activeUserId.length < 5) return;
    
    if (syncPromiseRef.current) {
      await syncPromiseRef.current;
      return;
    }

    const doSync = async () => {
      try {
        console.log("[AuthContext] Fetching profile for:", activeUserId);
        
        // Add a 15-second timeout to the Supabase request
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Sync timed out")), 10000)
        );

        const fetchPromise = supabase.from('profiles').select('*').eq('id', activeUserId).single();
        
        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

        if (error && error.code === 'PGRST116') {
          console.log("[AuthContext] No profile found, initializing new record...");
          const initialRecord = {
            id: userId, level: 1, xp: 0, last_notified_level: 1,
            fils: 1000, derhem: 50, dinar: 5, magnets: 3, hints: 5, skips: 2,
            inventory: { badges: [], owned_avatars: ['default'], unlocked_themes: ['default'], equipped_theme: 'default', solved_words: [], stats: { classic: { bestStreak: 0, totalCorrect: 0 } } },
            daily_streak: 0, reward_streak: 0, last_reward_claimed_at: null, updated_at: new Date().toISOString()
          };
          const { error: insertError } = await supabase.from('profiles').insert([initialRecord]);
          if (insertError) {
             console.warn("[AuthContext] Profile initialization error:", insertError);
          }
        } else if (data && !error) {
          console.log("[AuthContext] Profile data received.");
          const userInventoryData = data.inventory || {};
          
          setUserNickname(data.nickname || 'یاریزان');
          setUserAvatar(data.avatar_url || 'default');
          setCity(data.city || '');
          setIsInKurdistan(data.is_kurdistan ?? true);
          setCountryCode(data.country_code || 'IQ');

          if (userInventoryData.owned_avatars) setOwnedAvatars(userInventoryData.owned_avatars);
          if (userInventoryData.unlocked_themes) setUnlockedThemes(userInventoryData.unlocked_themes);
          
          const haptic = data.haptic_enabled ?? true;
          setHapticEnabled(haptic);
          localStorage.setItem('peyvchin_haptic_enabled', haptic.toString());

          const theme = data.preferred_theme ?? userInventoryData.equipped_theme ?? 'default';
          setCurrentTheme(theme);
          localStorage.setItem('peyvchin_current_theme', theme);

          isProfileLoaded.current = true;
          setProfileData(data);
          if (onProfileLoaded) onProfileLoaded(data);
        }
      } catch (err) {
        console.log("[AuthContext] [Sync] Connection slow, retrying in background...");
      } finally {
        syncPromiseRef.current = null;
      }
    };

    syncPromiseRef.current = doSync();
    try {
      await syncPromiseRef.current;
    } catch (err) {
      // Silent catch, handled inside doSync
    }
  }, []);

  // MANDATORY SESSION RECOVERY & AUTH LISTENER
  useEffect(() => {
    console.log("[AuthContext] Initializing...");
    const initializeAuth = async () => {
      // Global safety timeout to prevent getting stuck on the sun loader forever
      const safetyTimeout = setTimeout(() => {
        if (loadingAuth) {
          console.warn("[AuthContext] Safety timeout reached! Forcing ready state.");
          setAuthProgress(100);
          setTimeout(() => {
            setLoadingAuth(false);
            setLoading(false);
          }, 300);
        }
      }, 20000);

      try {
        setAuthProgress(15);
        console.log("[AuthContext] Checking session...");
        
        // Use a more relaxed timeout for the initial session check
        const sessionTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Initial session check deferred")), 10000)
        );
        const sessionFetch = supabase.auth.getSession();
        
        const { data: { session } } = await Promise.race([sessionFetch, sessionTimeout]);
        
        if (session?.user) {
          setAuthProgress(40);
          console.log("[AuthContext] Active session recovered:", session.user.id);
          setUser(session.user);
          // Sync in background to avoid blocking the UI
          if (!isProfileLoaded.current) {
            setAuthProgress(70);
            syncProfile(session.user.id); // No await
          }
          setAuthProgress(100);
        } else {
          setAuthProgress(100);
          console.log("[AuthContext] No active session found, proceeding as guest.");
        }
      } catch (err) {
        // Log as a standard info message instead of a red error
        console.log("[AuthContext] [Notice]", err.message);
      } finally {
        clearTimeout(safetyTimeout);
        if (loadingAuth) {
          setAuthProgress(100);
          console.log("[AuthContext] Auth system ready.");
          setTimeout(() => {
            setLoadingAuth(false);
            setLoading(false);
          }, 300);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("[AuthContext] Auth state change:", _event, session?.user?.id);
      if (session?.user) {
        setUser(session.user);
        if (!isProfileLoaded.current) {
          setAuthProgress(60);
          await syncProfile(session.user.id);
          setAuthProgress(100);
        }
      } else {
        setUser(null);
      }
      setLoadingAuth(false);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [syncProfile]);

  const updateProfile = useCallback(async (profileData) => {
    const { user: currentUser, userNickname, userAvatar, countryCode, isInKurdistan } = authStateRef.current;
    if (!currentUser?.id) return { success: false, error: "Must be logged in" };

    if (profileData.nickname !== undefined) setUserNickname(profileData.nickname);
    if (profileData.avatar_url !== undefined) setUserAvatar(profileData.avatar_url);
    if (profileData.city !== undefined) setCity(profileData.city);
    if (profileData.is_kurdistan !== undefined) setIsInKurdistan(profileData.is_kurdistan);
    if (profileData.country_code !== undefined) setCountryCode(profileData.country_code);

    if (profileData.haptic_enabled !== undefined) {
      setHapticEnabled(profileData.haptic_enabled);
      localStorage.setItem('peyvchin_haptic_enabled', profileData.haptic_enabled.toString());
    }
    if (profileData.currentTheme !== undefined) {
      setCurrentTheme(profileData.currentTheme);
      localStorage.setItem('peyvchin_current_theme', profileData.currentTheme);
    }

    try {
      const { error } = await supabase.rpc('update_profile_identity', {
        p_nickname: profileData.nickname || userNickname,
        p_avatar_url: profileData.avatar_url || userAvatar,
        p_country_code: profileData.country_code || countryCode,
        p_is_in_kurdistan: profileData.is_kurdistan ?? isInKurdistan
      });

      if (error) throw error;
      setLastProfileUpdate(Date.now());
      return { success: true };
    } catch (err) { 
      console.error("Profile update failed:", err);
      return { success: false, error: err.message }; 
    }
  }, []);

  const handleToggleBlock = useCallback(async (targetId, currentStatus) => {
    if (!user?.id) return;
    try {
      if (currentStatus) { await supabase.from('blocks').delete().eq('blocker_id', user.id).eq('blocked_id', targetId); }
      else { await supabase.from('blocks').insert([{ blocker_id: user.id, blocked_id: targetId }]); }
      return true;
    } catch { return false; }
  }, [user]);

  const checkBlockStatus = useCallback(async (targetId) => {
    if (!user?.id) return false;
    try {
      const { data, error } = await supabase.from('blocks').select('id').eq('blocker_id', user.id).eq('blocked_id', targetId).maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch { return false; }
  }, [user]);

  const value = useMemo(() => ({
    user, setUser, loadingAuth, loading, authProgress,
    userNickname, setUserNickname, userAvatar, setUserAvatar, city, setCity,
    isInKurdistan, setIsInKurdistan, countryCode, setCountryCode,
    profileData,
    ownedAvatars, setOwnedAvatars, unlockedThemes, setUnlockedThemes,
    currentTheme, setCurrentTheme, hapticEnabled, setHapticEnabled,
    lastProfileUpdate, setLastProfileUpdate,
    syncProfile, refreshProfile: syncProfile, updateProfile, handleToggleBlock, checkBlockStatus,
    isProfileLoaded
  }), [
    user, loadingAuth, loading, authProgress, userNickname, userAvatar, city, isInKurdistan, 
    countryCode, ownedAvatars, unlockedThemes, currentTheme, hapticEnabled, syncProfile, 
    updateProfile, handleToggleBlock, checkBlockStatus, profileData, lastProfileUpdate
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useUser = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useUser must be used within an AuthProvider');
  return context;
};
