/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { 
  playPopSfx, 
  playNotifSfx, 
  playMessageSfx,
  playMessageSentSfx,
  playVictorySfx,
  playRewardSfx, 
  playPurchaseSfx, 
  playBoosterSfx, 
  playBubblePopSfx,
  playSettingsOpenSfx, 
  playSettingsCloseSfx,
  playTabSfx,
  playAlertSfx,
  playBackSfx,
  playSaveSfx,
  playStartGameSfx,
  startSearchingSfx,
  stopSearchingSfx,
  setBackgroundMusicVolume,
  startBackgroundMusic, 
  stopBackgroundMusic, 
  setSfxVolume
} from '../utils/audio';

import { getLevelFromXP, getLevelData, getRewardForMode } from '../utils/progression';
import { getLocalDateString, isYesterday } from '../utils/formatters';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [lastNotifiedLevel, setLastNotifiedLevel] = useState(1);
  const [winsTowardsSecret, setWinsTowardsSecret] = useState(0);
  const [currentXP, setCurrentXP] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [rewardStreak, setRewardStreak] = useState(0);
  const [lastRewardClaimedAt, setLastRewardClaimedAt] = useState(null);
  
  // Derived state for level (Always in sync with XP)
  const levelData = useMemo(() => getLevelData(currentXP), [currentXP]);
  const level = levelData.level;
  const minXPForLevel = levelData.currentLevelBase;
  const maxXP = levelData.nextLevelBase;

  const [appSfxVolume, setAppSfxVolume] = useState(() => {
    const saved = localStorage.getItem('peyvchin_sfx_volume');
    return saved !== null ? Number(saved) : 20; 
  });
  const [bgMusicVolume, setBgMusicVolume] = useState(() => {
    const saved = localStorage.getItem('peyvchin_bg_music_volume');
    return saved !== null ? Number(saved) : 10;
  });
  const [hapticEnabled, setHapticEnabled] = useState(() => {
    const saved = localStorage.getItem('peyvchin_haptic_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [_userRank, setUserRank] = useState(1);
  const [inventory, setInventory] = useState({ badges: [] });

  const getInitial = (key, fallback) => {
    const saved = localStorage.getItem(key);
    return (saved !== null) ? Number(saved) : fallback;
  };

  const [fils, setFils] = useState(() => getInitial('peyvchin_fils', 1000));
  const [derhem, setDerhem] = useState(() => getInitial('peyvchin_derhem', 50));
  const [dinar, setDinar] = useState(() => getInitial('peyvchin_dinar', 5));
  const [magnetCount, setMagnetCount] = useState(() => getInitial('peyvchin_magnets', 3));
  const [hintCount, setHintCount] = useState(() => getInitial('peyvchin_hints', 5));
  const [skipCount, setSkipCount] = useState(() => getInitial('peyvchin_skips', 2));

  const [userNickname, setUserNickname] = useState('یاریزان');
  const [userAvatar, setUserAvatar] = useState('default');
  const [city, setCity] = useState('');
  const [isInKurdistan, setIsInKurdistan] = useState(true);
  const [countryCode, setCountryCode] = useState('IQ');
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
  const [solvedWords, setSolvedWords] = useState(() => {
    const saved = localStorage.getItem('peyvchin_solved_words');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [playerStats, setPlayerStats] = useState(() => {
    const saved = localStorage.getItem('peyvchin_stats');
    return saved ? JSON.parse(saved) : {
      classic: { bestStreak: 0, currentStreak: 0, totalCorrect: 0 },
      mamak: { totalCorrect: 0 },
      hard: { totalCorrect: 0 },
      wordFever: { bestTime: 0, totalWins: 0 },
      battle: { totalWins: 0, totalLosses: 0 },
      secretWord: { totalSolved: 0 }
    };
  });

  const dbSyncRef = useRef({ lastSyncedXP: -1, lastSyncedLevel: -1 });
  const isProfileLoaded = useRef(false);
  const lastRefreshTime = useRef(0);
  const lastXPRef = useRef(-1);

  const stateRef = useRef({ 
    fils, derhem, dinar, magnetCount, hintCount, skipCount, 
    user, currentXP, level, inventory,
    dailyStreak, rewardStreak, lastRewardClaimedAt, winsTowardsSecret
  });
  useEffect(() => {
    stateRef.current = { 
      fils, derhem, dinar, magnetCount, hintCount, skipCount, 
      user, currentXP, level, inventory,
      dailyStreak, rewardStreak, lastRewardClaimedAt, winsTowardsSecret
    };
  }, [
    fils, derhem, dinar, magnetCount, hintCount, skipCount, 
    user, currentXP, level, inventory,
    dailyStreak, rewardStreak, lastRewardClaimedAt, winsTowardsSecret
  ]);

  useEffect(() => {
    const syncLevelToDB = async () => {
      if (currentXP === dbSyncRef.current.lastSyncedXP) return;
      const calculatedLevel = getLevelFromXP(currentXP);
      
      localStorage.setItem('peyvchin_xp', currentXP.toString());
      localStorage.setItem('peyvchin_level', calculatedLevel.toString());
      
      // Cloud sync guard: Abort DB update if guest, if profile not loaded, or if XP is 0
      if (!user?.id || !isProfileLoaded.current || currentXP === 0) {
        dbSyncRef.current = { lastSyncedXP: currentXP, lastSyncedLevel: calculatedLevel };
        return;
      }

      try {
        await supabase.from('profiles').update({ 
          xp: currentXP, 
          level: calculatedLevel,
          updated_at: new Date().toISOString()
        }).eq('id', user.id);
        dbSyncRef.current = { lastSyncedXP: currentXP, lastSyncedLevel: calculatedLevel };
        refreshRank(currentXP);
      } catch (err) { console.warn("[GameContext] Auto-Sync failed:", err); }
    };
    const timeout = setTimeout(syncLevelToDB, 1000);
    return () => clearTimeout(timeout);
  }, [currentXP, user?.id]);

  const refreshRank = useCallback(async (xpValue = currentXP, force = false) => {
    const now = Date.now();
    if (!force && xpValue === lastXPRef.current && (now - lastRefreshTime.current < 2000)) return;
    try {
      lastRefreshTime.current = now;
      lastXPRef.current = xpValue;
      const { count, error } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).gt('xp', xpValue);
      if (!error && count !== null) setUserRank(count + 1);
    } catch (err) { console.warn("Rank refresh failed:", err); }
  }, [currentXP]);

  const updateProfile = useCallback(async (profileData) => {
    const { user: currentUser, inventory: currInv } = stateRef.current;
    if (!currentUser?.id) return;
    if (profileData.nickname !== undefined) setUserNickname(profileData.nickname);
    if (profileData.avatar_url !== undefined) setUserAvatar(profileData.avatar_url);
    if (profileData.city !== undefined) setCity(profileData.city);
    if (profileData.is_kurdistan !== undefined) setIsInKurdistan(profileData.is_kurdistan);
    if (profileData.country_code !== undefined) setCountryCode(profileData.country_code);

    const dbUpdates = {};
    if (profileData.lastNotifiedLevel !== undefined) {
      dbUpdates.last_notified_level = profileData.lastNotifiedLevel;
      setLastNotifiedLevel(profileData.lastNotifiedLevel);
    }
    if (profileData.nickname !== undefined) dbUpdates.nickname = profileData.nickname.trim();
    if (profileData.avatar_url !== undefined) dbUpdates.avatar_url = profileData.avatar_url;
    if (profileData.city !== undefined) dbUpdates.city = profileData.city;
    if (profileData.is_kurdistan !== undefined) dbUpdates.is_kurdistan = profileData.is_kurdistan;
    if (profileData.country_code !== undefined) dbUpdates.country_code = profileData.country_code;
    if (profileData.haptic_enabled !== undefined) {
      dbUpdates.haptic_enabled = profileData.haptic_enabled;
      setHapticEnabled(profileData.haptic_enabled);
      localStorage.setItem('peyvchin_haptic_enabled', profileData.haptic_enabled.toString());
    }
    if (profileData.currentTheme !== undefined) {
      dbUpdates.preferred_theme = profileData.currentTheme;
      setCurrentTheme(profileData.currentTheme);
      localStorage.setItem('peyvchin_current_theme', profileData.currentTheme);
    }

    let nextInventory = { ...currInv };
    let hasInventoryUpdate = false;
    if (profileData.ownedAvatars) { nextInventory.owned_avatars = profileData.ownedAvatars; setOwnedAvatars(profileData.ownedAvatars); hasInventoryUpdate = true; }
    if (profileData.unlockedThemes) { nextInventory.unlocked_themes = profileData.unlockedThemes; setUnlockedThemes(profileData.unlockedThemes); hasInventoryUpdate = true; }
    if (profileData.solvedWords) { nextInventory.solved_words = profileData.solvedWords; setSolvedWords(profileData.solvedWords); hasInventoryUpdate = true; }
    if (profileData.playerStats) { nextInventory.stats = profileData.playerStats; setPlayerStats(profileData.playerStats); hasInventoryUpdate = true; }
    if (profileData.currentTheme) { nextInventory.equipped_theme = profileData.currentTheme; hasInventoryUpdate = true; }

    if (hasInventoryUpdate) { dbUpdates.inventory = nextInventory; setInventory(nextInventory); }
    dbUpdates.updated_at = new Date().toISOString();
    try {
      await supabase.from('profiles').update(dbUpdates).eq('id', currentUser.id);
      return { success: true };
    } catch (err) { return { success: false, error: err.message }; }
  }, []);

  const handleToggleBlock = useCallback(async (targetId, currentStatus) => {
    const { user: currentUser } = stateRef.current;
    if (!currentUser?.id) return;
    try {
      if (currentStatus) { await supabase.from('blocks').delete().eq('blocker_id', currentUser.id).eq('blocked_id', targetId); }
      else { await supabase.from('blocks').insert([{ blocker_id: currentUser.id, blocked_id: targetId }]); }
      return true;
    } catch { return false; }
  }, []);

  const syncPromiseRef = useRef(null);

  const syncProfile = useCallback(async (userId) => {
    const activeUserId = userId || user?.id;
    if (!activeUserId || activeUserId === 'undefined' || typeof activeUserId !== 'string' || activeUserId.length < 5) return;
    
    // Prevent concurrent syncs for the same user
    if (syncPromiseRef.current) {
      await syncPromiseRef.current;
      return;
    }

    const doSync = async () => {
      try {
        let { data, error } = await supabase.from('profiles').select('*').eq('id', activeUserId).single();
      if (error && error.code === 'PGRST116') {
        const initialRecord = {
          id: userId, level: 1, xp: 0, last_notified_level: 1,
          fils: 1000, derhem: 50, dinar: 5, magnets: 3, hints: 5, skips: 2,
          inventory: { badges: [], owned_avatars: ['default'], unlocked_themes: ['default'], equipped_theme: 'default', solved_words: [], stats: { classic: { bestStreak: 0, totalCorrect: 0 } } },
          daily_streak: 0, reward_streak: 0, last_reward_claimed_at: null, updated_at: new Date().toISOString()
        };
        const { error: insertError } = await supabase.from('profiles').insert([initialRecord]);
        if (insertError) {
          if (insertError.code === '23503') {
            // Ghost session: User exists in local storage but was deleted from the database.
            console.warn("Ghost session detected. Logging out...");
            await supabase.auth.signOut();
            
            // Clear local storage progression
            const keysToKeep = ['peyvchin_app_sfx_volume', 'peyvchin_bg_music_volume', 'peyvchin_haptic_enabled', 'peyvchin_current_theme'];
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('peyvchin_') && !keysToKeep.includes(key)) {
                localStorage.removeItem(key);
              }
            });
            
            window.location.reload();
            return;
          } else if (insertError.code !== '23505') {
            console.warn("Profile initialization error:", insertError);
          }
        }
        setFils(1000); setMagnetCount(3); setHintCount(5); setSkipCount(2); setDailyStreak(0);
      } else if (data && !error) {
        const userInventoryData = data.inventory || {};
        
        // --- SAFE MERGE LOGIC: Local vs Cloud ---
        const localXP = Number(localStorage.getItem('peyvchin_xp')) || 0;
        const localFils = Number(localStorage.getItem('peyvchin_fils')) || 0;
        const localDerhem = Number(localStorage.getItem('peyvchin_derhem')) || 0;
        const localDinar = Number(localStorage.getItem('peyvchin_dinar')) || 0;
        const localSolvedWords = JSON.parse(localStorage.getItem('peyvchin_solved_words') || '[]');
        
        const dbXP = data.xp || 0;
        const dbFils = data.fils || 0;
        const dbDerhem = data.derhem || 0;
        const dbDinar = data.dinar || 0;
        const dbSolvedWords = userInventoryData.solved_words || [];

        // Determine if local is more advanced
        const needsCloudUpdate = (localXP > dbXP) || (localFils > dbFils) || (localDerhem > dbDerhem) || (localDinar > dbDinar) || (localSolvedWords.length > dbSolvedWords.length);

        if (needsCloudUpdate) {
          console.log("[GameContext] Local progress is ahead. Merging and pushing to cloud...");
          const mergedXP = Math.max(localXP, dbXP);
          const mergedFils = Math.max(localFils, dbFils);
          const mergedDerhem = Math.max(localDerhem, dbDerhem);
          const mergedDinar = Math.max(localDinar, dbDinar);
          const mergedWordsSet = new Set([...localSolvedWords, ...dbSolvedWords]);
          const mergedWords = Array.from(mergedWordsSet);
          
          const dbUpdates = {
            xp: mergedXP,
            fils: mergedFils,
            derhem: mergedDerhem,
            dinar: mergedDinar,
            inventory: { ...userInventoryData, solved_words: mergedWords },
            updated_at: new Date().toISOString()
          };
          
          await supabase.from('profiles').update(dbUpdates).eq('id', activeUserId);
          
          // Re-map DB data to the newly merged values for state setters
          data.xp = mergedXP;
          data.fils = mergedFils;
          data.derhem = mergedDerhem;
          data.dinar = mergedDinar;
          userInventoryData.solved_words = mergedWords;
        }

        setInventory(userInventoryData);
        const safeSet = (setter, val, fallback) => { try { setter(val ?? fallback); } catch { console.warn("Mapping failed"); } };
        safeSet(setWinsTowardsSecret, data.wins_towards_secret, 0);
        safeSet(setCurrentXP, data.xp, 0);
        safeSet(setFils, data.fils, 1000);
        safeSet(setDerhem, data.derhem, 50);
        safeSet(setDinar, data.dinar, 5);
        safeSet(setMagnetCount, data.magnets, 3);
        safeSet(setHintCount, data.hints, 5);
        safeSet(setSkipCount, data.skips, 2);
        safeSet(setDailyStreak, data.daily_streak, 0);
        safeSet(setLastNotifiedLevel, data.last_notified_level, 1);
        safeSet(setRewardStreak, data.reward_streak, 0);
        safeSet(setLastRewardClaimedAt, data.last_reward_claimed_at, null);

        localStorage.setItem('peyvchin_xp', (data.xp || 0).toString());
        localStorage.setItem('peyvchin_fils', (data.fils || 1000).toString());
        localStorage.setItem('peyvchin_derhem', (data.derhem || 50).toString());
        localStorage.setItem('peyvchin_dinar', (data.dinar || 5).toString());
        localStorage.setItem('peyvchin_magnets', (data.magnets || 3).toString());
        localStorage.setItem('peyvchin_hints', (data.hints || 5).toString());
        localStorage.setItem('peyvchin_skips', (data.skips || 2).toString());

        const sfxVol = data.sfx_volume ?? userInventoryData.settings?.app_sfx_volume ?? 20;
        setAppSfxVolume(sfxVol);
        localStorage.setItem('peyvchin_sfx_volume', sfxVol.toString());

        const musicEnabled = data.music_enabled ?? true;
        const bgVol = musicEnabled ? (userInventoryData.settings?.bg_music_volume ?? 10) : 0;
        setBgMusicVolume(bgVol);
        localStorage.setItem('peyvchin_bg_music_volume', bgVol.toString());

        const haptic = data.haptic_enabled ?? true;
        setHapticEnabled(haptic);
        localStorage.setItem('peyvchin_haptic_enabled', haptic.toString());

        const theme = data.preferred_theme ?? userInventoryData.equipped_theme ?? 'default';
        setCurrentTheme(theme);
        localStorage.setItem('peyvchin_current_theme', theme);

        setUserNickname(data.nickname || 'یاریزان');
        setUserAvatar(data.avatar_url || 'default');
        setCity(data.city || '');
        setIsInKurdistan(data.is_kurdistan ?? true);
        setCountryCode(data.country_code || 'IQ');

        if (userInventoryData.owned_avatars) setOwnedAvatars(userInventoryData.owned_avatars);
        if (userInventoryData.unlocked_themes) setUnlockedThemes(userInventoryData.unlocked_themes);
        if (userInventoryData.solved_words) setSolvedWords(userInventoryData.solved_words);
        if (userInventoryData.stats) setPlayerStats(userInventoryData.stats);

        isProfileLoaded.current = true;
        refreshRank(data.xp || 0);
      }
    } catch (err) { console.warn("Profile Sync Error [v2]:", err); }
  };

  syncPromiseRef.current = doSync();
  try {
    await syncPromiseRef.current;
  } finally {
    syncPromiseRef.current = null;
  }
}, [refreshRank]);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) { setUser(session.user); await syncProfile(session.user.id); }
        else {
          setCurrentXP(getInitial('peyvchin_xp', 0));
          setLastNotifiedLevel(getInitial('peyvchin_last_notified_level', 1));
          setWinsTowardsSecret(getInitial('peyvchin_wins_towards_secret', 0));
          setFils(getInitial('peyvchin_fils', 1000));
          setDerhem(getInitial('peyvchin_derhem', 50));
          setDinar(getInitial('peyvchin_dinar', 5));
          setMagnetCount(getInitial('peyvchin_magnets', 3));
          setHintCount(getInitial('peyvchin_hints', 5));
          setSkipCount(getInitial('peyvchin_skips', 2));
        }
      } catch (err) { console.error("[GameContext] Session init failed:", err); }
      finally { setLoadingAuth(false); setLoading(false); }
    };
    initializeSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        syncProfile(session.user.id);
      } else {
        isProfileLoaded.current = false;
      }
    });
    return () => subscription.unsubscribe();
  }, [syncProfile]);

  useEffect(() => {
    if (!user?.id || loadingAuth) return;
    const heartbeat = setInterval(async () => {
      try { await supabase.from('profiles').update({ updated_at: new Date().toISOString() }).eq('id', user.id); }
      catch (err) { console.warn("Heartbeat update failed:", err); }
    }, 60000);
    return () => clearInterval(heartbeat);
  }, [user, loadingAuth]);

  const updateInventory = useCallback(async (updates, isAdditive = true) => {
    const calculateNext = (current, offset, additive) => additive ? (current + offset) : offset;
    const { user: currentUser, fils: currFils, derhem: currDerhem, dinar: currDinar, magnetCount: currMags, hintCount: currHints, skipCount: currSkips } = stateRef.current;
    const nextValues = {
      fils: updates.fils !== undefined ? calculateNext(currFils, updates.fils, isAdditive) : undefined,
      derhem: updates.derhem !== undefined ? calculateNext(currDerhem, updates.derhem, isAdditive) : undefined,
      dinar: updates.dinar !== undefined ? calculateNext(currDinar, updates.dinar, isAdditive) : undefined,
      magnets: updates.magnetCount !== undefined ? calculateNext(currMags, updates.magnetCount, isAdditive) : undefined,
      hints: updates.hintCount !== undefined ? calculateNext(currHints, updates.hintCount, isAdditive) : undefined,
      skips: updates.skipCount !== undefined ? calculateNext(currSkips, updates.skipCount, isAdditive) : undefined
    };
    if (nextValues.fils !== undefined) setFils(nextValues.fils);
    if (nextValues.derhem !== undefined) setDerhem(nextValues.derhem);
    if (nextValues.dinar !== undefined) setDinar(nextValues.dinar);
    if (nextValues.magnets !== undefined) setMagnetCount(nextValues.magnets);
    if (nextValues.hints !== undefined) setHintCount(nextValues.hints);
    if (nextValues.skips !== undefined) setSkipCount(nextValues.skips);

    Object.entries(updates).forEach(([key, val]) => {
      const storageKey = key === 'magnetCount' ? 'peyvchin_magnets' : key === 'hintCount' ? 'peyvchin_hints' : key === 'skipCount' ? 'peyvchin_skips' : `peyvchin_${key}`;
      const current = getInitial(storageKey, 0);
      localStorage.setItem(storageKey, (isAdditive ? (current + val) : val).toString());
    });

    if (currentUser) {
      const dbUpdates = { updated_at: new Date().toISOString() };
      Object.entries(nextValues).forEach(([dbKey, val]) => { if (val !== undefined) dbUpdates[dbKey] = val; });
      try { await supabase.from('profiles').update(dbUpdates).eq('id', currentUser.id); }
      catch (err) { console.warn("DB Inventory Sync Failed:", err); }
    }
  }, []);

  const syncProgressToDatabase = useCallback(async (lettersCount, mode = 'classic', additionalData = {}) => {
    const { user: currentUser, currentXP: currXP } = stateRef.current;
    const currentAward = getRewardForMode(mode);
    const xpToAdd = currentAward.xp;
    const newLocalXP = Number(currXP) + xpToAdd;

    // LOCAL UPDATES (For instant UI feedback)
    setCurrentXP(newLocalXP);
    if (currentAward.type === 'fils') setFils(prev => Number(prev) + currentAward.amount);
    if (currentAward.type === 'derhem') setDerhem(prev => Number(prev) + currentAward.amount);
    if (currentAward.type === 'dinar') setDinar(prev => Number(prev) + currentAward.amount);

    if (mode === 'classic' || mode === 'hard_words' || mode === 'mamak') {
      setDailyStreak(prev => {
        const next = prev + 1;
        localStorage.setItem('peyvchin_daily_streak', next.toString());
        return next;
      });
    }

    if (!currentUser) {
       localStorage.setItem('peyvchin_xp', newLocalXP.toString());
       return { xpAdded: xpToAdd, newLevel: getLevelFromXP(newLocalXP), awards: currentAward, isGuest: true };
    }

    try {
      // NEW SECURED SYNC: Only send what was USED, server calculates REWARDS
      const { data, error } = await supabase.rpc('sync_game_session', {
        p_user_id: currentUser.id,
        p_mode: mode,
        p_magnets_used: additionalData.magnetsUsed || 0,
        p_hints_used: additionalData.hintsUsed || 0,
        p_skips_used: additionalData.skipsUsed || 0,
        p_solved_words: additionalData.solvedWords || []
      });

      if (error) throw error;
      if (data) {
        const { new_level, new_xp, award_xp } = data;
        
        // Refresh local stats (server already updated them)
        await syncProfile(currentUser.id); 
        refreshRank(new_xp, true);

        return { 
          xpAdded: award_xp, 
          newLevel: new_level, 
          awards: currentAward, 
          bahdiniMsg: `سەرکەفتنەکا نوی! ✨ (پاراستی)` 
        };
      }
    } catch (err) { 
      console.error("Secured Sync Failed:", err.message); 
      return null; 
    }
    return null;
  }, [refreshRank, syncProfile]);

  const addXP = useCallback((amount) => { if (amount) setCurrentXP(prev => prev + amount); }, []);

  const appSoundsEnabled = appSfxVolume > 0;
  const playPopSound = useCallback((bypass = false) => playPopSfx(appSoundsEnabled, bypass), [appSoundsEnabled]);
  const playNotifSound = useCallback(() => playNotifSfx(appSoundsEnabled), [appSoundsEnabled]);
  const playMessageSound = useCallback(() => playMessageSfx(appSoundsEnabled), [appSoundsEnabled]);
  const playMessageSentSound = useCallback(() => playMessageSentSfx(appSoundsEnabled), [appSoundsEnabled]);
  const playVictorySound = useCallback(() => playVictorySfx(appSoundsEnabled), [appSoundsEnabled]);
  const playRewardSound = useCallback(() => playRewardSfx(appSoundsEnabled), [appSoundsEnabled]);
  const playPurchaseSound = useCallback(() => playPurchaseSfx(appSoundsEnabled), [appSoundsEnabled]);
  const playBoosterSound = useCallback(() => playBoosterSfx(appSoundsEnabled), [appSoundsEnabled]);
  const playBubblePopSound = useCallback(() => playBubblePopSfx(appSoundsEnabled), [appSoundsEnabled]);
  const playSettingsOpenSound = useCallback(() => playSettingsOpenSfx(appSoundsEnabled), [appSoundsEnabled]);
  const playSettingsCloseSound = useCallback(() => playSettingsCloseSfx(appSoundsEnabled), [appSoundsEnabled]);
  const playTabSound = useCallback(() => playTabSfx(appSoundsEnabled), [appSoundsEnabled]);
  const playAlertSound = useCallback(() => playAlertSfx(appSoundsEnabled), [appSoundsEnabled]);
  const playBackSound = useCallback(() => playBackSfx(appSoundsEnabled), [appSoundsEnabled]);
  const playSaveSound = useCallback(() => playSaveSfx(appSoundsEnabled), [appSoundsEnabled]);
  const playStartGameSound = useCallback(() => { try { playStartGameSfx(appSoundsEnabled); } catch { console.warn("Audio fail"); } }, [appSoundsEnabled]);
  const startSearchingSound = useCallback(() => { try { startSearchingSfx(); } catch { console.warn("Audio fail"); } }, []);
  const stopSearchingSound = useCallback((fade = true) => stopSearchingSfx(fade), []);
  const startBGM = useCallback(() => startBackgroundMusic(), []);
  const stopBGM = useCallback(() => stopBackgroundMusic(), []);

  const updateMusicVolume = useCallback((val) => {
    setBgMusicVolume(val);
    localStorage.setItem('peyvchin_bg_music_volume', val.toString());
    setBackgroundMusicVolume(val / 100);
    
    // Optimized: Only sync with DB after 1s of inactivity or on "interaction complete" logic elsewhere
    const { user: currentUser } = stateRef.current;
    if (currentUser) {
      if (stateRef.current.musicUpdateTimeout) clearTimeout(stateRef.current.musicUpdateTimeout);
      stateRef.current.musicUpdateTimeout = setTimeout(() => {
        supabase.from('profiles').update({ music_enabled: val > 0, updated_at: new Date().toISOString() }).eq('id', currentUser.id).then();
      }, 1000);
    }
  }, []);

  const updateSfxVolume = useCallback((val) => {
    setAppSfxVolume(val);
    localStorage.setItem('peyvchin_sfx_volume', val.toString());
    import('../utils/audio').then(m => m.setSfxVolume(val / 100));
    
    const { user: currentUser } = stateRef.current;
    if (currentUser) {
      if (stateRef.current.sfxUpdateTimeout) clearTimeout(stateRef.current.sfxUpdateTimeout);
      stateRef.current.sfxUpdateTimeout = setTimeout(() => {
        supabase.from('profiles').update({ sfx_volume: val, updated_at: new Date().toISOString() }).eq('id', currentUser.id).then();
      }, 1000);
    }
  }, []);

  useEffect(() => { setBackgroundMusicVolume(bgMusicVolume / 100); }, [bgMusicVolume]);

  const incrementSecretWordProgress = useCallback(async () => {
    const { user: currentUser } = stateRef.current;
    setWinsTowardsSecret(prev => {
      const next = Math.min(3, prev + 1);
      localStorage.setItem('peyvchin_wins_towards_secret', next.toString());
      if (currentUser) supabase.from('profiles').update({ wins_towards_secret: next }).eq('id', currentUser.id).then();
      return next;
    });
  }, []);

  const resetSecretWordProgress = useCallback(async () => {
    const { user: currentUser } = stateRef.current;
    setWinsTowardsSecret(0);
    localStorage.setItem('peyvchin_wins_towards_secret', '0');
    if (currentUser) await supabase.from('profiles').update({ wins_towards_secret: 0 }).eq('id', currentUser.id);
  }, []);

  const claimDailyReward = useCallback(async () => {
    const { user: currentUser, rewardStreak: currRewardStreak, lastRewardClaimedAt: lastClaimed } = stateRef.current;
    if (!currentUser?.id) return { success: false, error: "Tkaye pêşî wەرە ژوور" };
    const now = new Date();
    const todayStr = getLocalDateString(now);
    const lastClaimDate = lastClaimed ? (lastClaimed.includes('T') ? lastClaimed.split('T')[0] : lastClaimed) : null;
    if (lastClaimDate === todayStr) return { success: false, error: "Te xەلاتێ خۆ یێ ئەڤرۆ وەرگرتییە" };
    let nextStreak = (lastClaimDate && isYesterday(lastClaimDate, now)) ? (currRewardStreak % 7) + 1 : 1;
    const rewards = { 
      1: { fils: 200 }, 
      2: { hintCount: 1 }, 
      3: { derhem: 5 }, 
      4: { magnetCount: 1 }, 
      5: { derhem: 15 }, 
      6: { skipCount: 1 }, 
      7: { fils: 2000, dinar: 1 } 
    };
    const currentReward = rewards[nextStreak];
    try {
      setRewardStreak(nextStreak);
      setLastRewardClaimedAt(todayStr);
      updateInventory(currentReward);
      await supabase.from('profiles').update({ reward_streak: nextStreak, last_reward_claimed_at: todayStr, updated_at: now.toISOString() }).eq('id', currentUser.id);
      return { success: true, streak: nextStreak, reward: currentReward };
    } catch (err) { console.error("Daily Reward Claim Failed:", err); return { success: false, error: "ئاریشەیەک د داتابەیسێ دا ھەبوو" }; }
  }, [updateInventory]);

  const checkBlockStatus = useCallback(async (targetId) => {
    if (!user?.id) return false;
    try {
      const { data, error } = await supabase.from('blocks').select('id').eq('blocker_id', user.id).eq('blocked_id', targetId).maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch { return false; }
  }, [user?.id]);

  const value = useMemo(() => ({
    user, setUser,
    level,
    winsTowardsSecret, incrementSecretWordProgress, resetSecretWordProgress,
    currentXP, maxXP, minXPForLevel, fils, derhem, dinar, addXP,
    dailyStreak, setDailyStreak,
    rewardStreak, lastRewardClaimedAt, claimDailyReward,
    playMessageSound, playMessageSentSound,
    inventory, setInventory,
    magnetCount, hintCount, skipCount,
    ownedAvatars, equippedAvatar: userAvatar, unlockedThemes, currentTheme,
    solvedWords, playerStats,
    userNickname, userAvatar, city, isInKurdistan, countryCode,
    userRank: _userRank,
    updateInventory,
    appSfxVolume, updateSfxVolume, appSoundsEnabled,
    bgMusicVolume, updateMusicVolume,
    hapticEnabled, setHapticEnabled,
    playPopSound, playNotifSound, playVictorySound, playRewardSound, playPurchaseSound, playBoosterSound,
    playSettingsOpenSound, playSettingsCloseSound,
    playTabSound, playAlertSound, playBackSound, playSaveSound, playBubblePopSound,
    startSearchingSound, stopSearchingSound,
    startBGM, stopBGM, playStartGameSound,
    playDailyOpenSfx, playDailyClaimSfx,
    setCurrentXP, setLastNotifiedLevel,
    checkBlockStatus,
    syncProfile,
    updateProfile,
    handleToggleBlock,
    syncProgressToDatabase,
    getLevelData
  }), [
    user, level, winsTowardsSecret, currentXP, maxXP, minXPForLevel, fils, derhem, dinar,
    dailyStreak, rewardStreak, lastRewardClaimedAt,
    inventory, magnetCount, hintCount, skipCount,
    ownedAvatars, userAvatar, unlockedThemes, currentTheme, solvedWords, playerStats,
    userNickname, city, isInKurdistan, countryCode, loadingAuth, loading,
    appSoundsEnabled, hapticEnabled, lastNotifiedLevel, appSfxVolume, bgMusicVolume,
    incrementSecretWordProgress, resetSecretWordProgress, addXP, claimDailyReward,
    updateInventory, updateSfxVolume, updateMusicVolume, setHapticEnabled,
    playPopSound, playNotifSound, playVictorySound, playRewardSound, playPurchaseSound,
    playBoosterSound, playSettingsOpenSound, playSettingsCloseSound, playTabSound,
    playAlertSound, playBackSound, playSaveSound, playBubblePopSound,
    startSearchingSound, stopSearchingSound, startBGM, stopBGM, playStartGameSound,
    playDailyOpenSfx, playDailyClaimSfx, syncProfile, updateProfile, handleToggleBlock,
    playMessageSound, playMessageSentSound,
    checkBlockStatus, syncProgressToDatabase, getLevelData,
    _userRank
  ]);

  const valueWithRefs = useMemo(() => ({
    ...value,
    loadingAuth,
    loading,
    refreshProfile: syncProfile
  }), [value, loadingAuth, loading, syncProfile]);

  return (
    <GameContext.Provider value={valueWithRefs}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
