/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import {
  playAlertSfx, playStartGameSfx, playBackSfx, playSaveSfx,
  playTabSfx, setBackgroundMusicVolume,
  playSettingsOpenSfx, playSettingsCloseSfx,
  playPopSfx, playSuccessSfx,
  playNotifSfx, playMessageSfx, playVictorySfx, playCoinSfx, playRewardSfx, playPurchaseSfx, playBoosterSfx,
  playDailyOpenSfx, playDailyClaimSfx, playBubblePopSfx,
  startSearchingSfx, stopSearchingSfx,
  playMessageSentSfx,
  startBackgroundMusic, stopBackgroundMusic
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
  const progressPercent = levelData.progressPercent;

  const [appSfxVolume, setAppSfxVolume] = useState(() => {
    const saved = localStorage.getItem('peyvchin_sfx_volume');
    return saved !== null ? Number(saved) : 20; // 20% Default (Increased from 15%)
  });
  const [bgMusicVolume, setBgMusicVolume] = useState(() => {
    const saved = localStorage.getItem('peyvchin_bg_music_volume');
    return saved !== null ? Number(saved) : 10; // 10% Default (Reduced from 30%)
  });
  const [hapticEnabled, setHapticEnabled] = useState(() => {
    const saved = localStorage.getItem('peyvchin_haptic_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [userRank, setUserRank] = useState(1);
  const [inventory, setInventory] = useState({ badges: [] });



  // INVENTORY STATE (Robust Initialization)
  const getInitial = (key, fallback) => {
    const saved = localStorage.getItem(key);
    return (saved !== null) ? Number(saved) : fallback;
  };

  const [fils, setFils] = useState(() => getInitial('peyvchin_fils', null));
  const [derhem, setDerhem] = useState(() => getInitial('peyvchin_derhem', null));
  const [dinar, setDinar] = useState(() => getInitial('peyvchin_dinar', null));
  const [magnetCount, setMagnetCount] = useState(() => getInitial('peyvchin_magnets', 3));
  const [hintCount, setHintCount] = useState(() => getInitial('peyvchin_hints', 5));
  const [skipCount, setSkipCount] = useState(() => getInitial('peyvchin_skips', 2));

  // EXTENDED PLAYER DATA (Everything Connected)
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
  const [solvedWords, setSolvedWords] = useState([]);
  const [playerStats, setPlayerStats] = useState({
    classic: { bestStreak: 0, currentStreak: 0, totalCorrect: 0 },
    mamak: { totalCorrect: 0 },
    hard: { totalCorrect: 0 },
    wordFever: { bestTime: 0, totalWins: 0 },
    battle: { totalWins: 0, totalLosses: 0 },
    secretWord: { totalSolved: 0 }
  });



  const dbSyncRef = useRef({ lastSyncedXP: -1, lastSyncedLevel: -1 });


  const lastRefreshTime = useRef(0);
  const lastXPRef = useRef(-1);

  // CRITICAL: stateRef for stable async state access
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

  // --- AUTOMATIC LEVEL & XP PERSIStENCE WATCHER ---
  // Ensures that whenever currentXP changes, the 'level' column in Supabase is also updated if needed.
  useEffect(() => {
    const syncLevelToDB = async () => {
      if (!user?.id || currentXP === dbSyncRef.current.lastSyncedXP) return;

      const calculatedLevel = getLevelFromXP(currentXP);
      
      // Update local storage for guest-to-auth transitions
      localStorage.setItem('peyvchin_xp', currentXP.toString());
      localStorage.setItem('peyvchin_level', calculatedLevel.toString());

      // Only perform DB update if values changed or haven't been synced yet
      if (calculatedLevel !== dbSyncRef.current.lastSyncedLevel || currentXP !== dbSyncRef.current.lastSyncedXP) {
        try {
          // The database trigger 'trg_sync_profile_level' will automatically calculate 
          // the 'level' column based on 'xp', but we still pass calculatedLevel
          // as a fallback and to ensure the local state stays in sync.
          await supabase.from('profiles').update({ 
            xp: currentXP, 
            level: calculatedLevel,
            updated_at: new Date().toISOString()
          }).eq('id', user.id);
          
          dbSyncRef.current = { lastSyncedXP: currentXP, lastSyncedLevel: calculatedLevel };
          refreshRank(currentXP);
          console.log(`[GameContext] Auto-Synced: XP=${currentXP}, Level=${calculatedLevel}`);
        } catch (err) {
          console.warn("[GameContext] Auto-Sync failed:", err);
        }
      }
    };

    const timeout = setTimeout(syncLevelToDB, 1000); // Debounce sync to avoid spamming DB
    return () => clearTimeout(timeout);
  }, [currentXP, user?.id]);

  const refreshRank = useCallback(async (xpValue = currentXP, force = false) => {
    // 1. Guard: If value hasn't changed AND we refreshed very recently (< 2s), skip
    const now = Date.now();
    if (!force && xpValue === lastXPRef.current && (now - lastRefreshTime.current < 2000)) {
      return;
    }

    try {
      lastRefreshTime.current = now;
      lastXPRef.current = xpValue;

      // Query how many users have MORE xp than current user
      const { count, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gt('xp', xpValue);

      if (!error && count !== null) {
        setUserRank(count + 1);
      }
    } catch (err) {
      console.warn("Rank refresh failed:", err);
    }
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
    // Note: 'level' is now handled exclusively by the XP watcher for consistency
    if (profileData.lastNotifiedLevel !== undefined) {
      dbUpdates.last_notified_level = profileData.lastNotifiedLevel;
      setLastNotifiedLevel(profileData.lastNotifiedLevel);
    }
    if (profileData.nickname !== undefined) dbUpdates.nickname = profileData.nickname.trim();
    if (profileData.avatar_url !== undefined) dbUpdates.avatar_url = profileData.avatar_url;
    if (profileData.city !== undefined) dbUpdates.city = profileData.city;
    if (profileData.is_kurdistan !== undefined) dbUpdates.is_kurdistan = profileData.is_kurdistan;
    if (profileData.country_code !== undefined) dbUpdates.country_code = profileData.country_code;
    if (profileData.app_sounds_enabled !== undefined) dbUpdates.app_sounds_enabled = profileData.app_sounds_enabled;
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

    if (hasInventoryUpdate) {
      dbUpdates.inventory = nextInventory;
      setInventory(nextInventory);
    }

    dbUpdates.updated_at = new Date().toISOString();
    try {
      await supabase.from('profiles').update(dbUpdates).eq('id', currentUser.id);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const handleToggleBlock = useCallback(async (targetId, currentStatus) => {
    const { user: currentUser } = stateRef.current;
    if (!currentUser?.id) return;
    try {
      if (currentStatus) {
        await supabase.from('blocks').delete().eq('blocker_id', currentUser.id).eq('blocked_id', targetId);
      } else {
        await supabase.from('blocks').insert([{ blocker_id: currentUser.id, blocked_id: targetId }]);
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const syncProfile = useCallback(async (userId) => {
    // 1. HARDENED GUARD: Reject invalid, undefined, or non-string IDs immediately
    const activeUserId = userId || user?.id;
    if (!activeUserId || activeUserId === 'undefined' || typeof activeUserId !== 'string' || activeUserId.length < 5) {
      return;
    }

    try {
      let data, error;
      try {
        let result = await supabase.from('profiles').select('*').eq('id', activeUserId).single();
        data = result.data;
        error = result.error;
      } catch (fetchError) {
        console.warn("Supabase fetch fatal error:", fetchError);
        return;
      }

      if (error && error.code === 'PGRST116') {
        const initialRecord = {
          id: userId, level: 1, xp: 0, last_notified_level: 1,
          fils: 1000, derhem: 50, dinar: 5,
          magnets: 3, hints: 5, skips: 2,
          inventory: {
            badges: [],
            owned_avatars: ['default'],
            unlocked_themes: ['default'],
            equipped_theme: 'default',
            solved_words: [],
            stats: { classic: { bestStreak: 0, totalCorrect: 0 } }
          },
          daily_streak: 0,
          reward_streak: 0,
          last_reward_claimed_at: null,
          updated_at: new Date().toISOString()
        };
        await supabase.from('profiles').insert([initialRecord]);
        setFils(1000); setMagnetCount(3); setHintCount(5); setSkipCount(2); setDailyStreak(0);
        setRewardStreak(0); setLastRewardClaimedAt(null);
      } else if (data && !error) {
        const userInventoryData = data.inventory || {};
        setInventory(userInventoryData);

        const safeSet = (setter, val, fallback) => {
          try { setter(val ?? fallback); } catch (e) { console.warn("Mapping failed:", e); }
        };

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

        // SYNC LOCAL STORAGE: Ensure local storage matches the authenticated user to prevent "ghost" snaps
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

        if (userInventoryData.unlocked_themes) {
          setUnlockedThemes(userInventoryData.unlocked_themes);
          localStorage.setItem('peyvchin_unlocked_themes', JSON.stringify(userInventoryData.unlocked_themes));
        }

        import('../utils/audio').then(m => {
          m.setSfxVolume(sfxVol / 100);
          m.setBackgroundMusicVolume(bgVol / 100);
        });

        setUserNickname(data.nickname || 'یاریزان');
        setUserAvatar(data.avatar_url || 'default');
        setCity(data.city || '');
        setIsInKurdistan(data.is_kurdistan ?? true);
        setCountryCode(data.country_code || 'IQ');

        if (userInventoryData.owned_avatars) setOwnedAvatars(userInventoryData.owned_avatars);
        if (userInventoryData.unlocked_themes) setUnlockedThemes(userInventoryData.unlocked_themes);
        if (userInventoryData.solved_words) setSolvedWords(userInventoryData.solved_words);
        if (userInventoryData.stats) setPlayerStats(userInventoryData.stats);
        if (userInventoryData.equipped_theme) setCurrentTheme(userInventoryData.equipped_theme);

        const today = new Date().toISOString().split('T')[0];
        const lastLoginDate = userInventoryData.last_login;
        let newStreak = data.daily_streak || 0;

        if (!lastLoginDate) {
          newStreak = 1;
          updateProfile({ playerStats: { ...userInventoryData.stats, last_login: today }, dailyStreak: 1 });
        } else if (lastLoginDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (lastLoginDate === yesterdayStr) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }

          const nextInv = { ...userInventoryData, last_login: today };
          setInventory(nextInv);
          setDailyStreak(newStreak);

          supabase.from('profiles').update({
            daily_streak: newStreak,
            inventory: nextInv,
            updated_at: new Date().toISOString()
          }).eq('id', activeUserId).then();
        } else {
          setDailyStreak(newStreak);
        }

        localStorage.setItem('peyvchin_skips', (data.skips ?? 2).toString());
        localStorage.setItem('peyvchin_daily_streak', (data.daily_streak ?? 0).toString());
        localStorage.setItem('peyvchin_sfx_volume', (sfxVol).toString());
        localStorage.setItem('peyvchin_bg_music_volume', (bgVol).toString());
        localStorage.setItem('peyvchin_haptic_enabled', (haptic).toString());

        refreshRank(data.xp || 0);
      }
    } catch (err) {
      console.warn("Profile Sync Error [v2]:", err);
    }
  }, [refreshRank, updateProfile]);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await syncProfile(session.user.id);
        } else {
          const localXP = localStorage.getItem('peyvchin_xp');
          const localLvl = localStorage.getItem('peyvchin_level');
          const localNotifiedLvl = localStorage.getItem('peyvchin_last_notified_level');
          const localUnlockProgress = localStorage.getItem('peyvchin_wins_towards_secret');

          if (localXP) setCurrentXP(parseFloat(localXP));
          if (localNotifiedLvl) setLastNotifiedLevel(parseInt(localNotifiedLvl));
          if (localUnlockProgress) setWinsTowardsSecret(parseInt(localUnlockProgress));

          setFils(getInitial('peyvchin_fils', 1000));
          setDerhem(getInitial('peyvchin_derhem', 50));
          setDinar(getInitial('peyvchin_dinar', 5));
          setMagnetCount(getInitial('peyvchin_magnets', 3));
          setHintCount(getInitial('peyvchin_hints', 5));
          setSkipCount(getInitial('peyvchin_skips', 2));
        }
      } catch (err) {
        console.error("[GameContext] Session init failed:", err);
      } finally {
        setLoadingAuth(false);
        setLoading(false);
      }
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) syncProfile(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [syncProfile]);

  // ONLINE HEARTBEAT
  useEffect(() => {
    if (!user?.id || loadingAuth) return;
    const heartbeat = setInterval(async () => {
      try {
        await supabase.from('profiles').update({ updated_at: new Date().toISOString() }).eq('id', user.id);
      } catch (err) {
        console.warn("Heartbeat update failed:", err);
      }
    }, 60000);
    return () => clearInterval(heartbeat);
  }, [user]);

  /**
   * syncProgressToDatabase (NEW XP & STREAK SYSTEM)
   * Uses handle_game_xp RPC for atomic progression sync.
   */

  /**
   * processLevelCompletion (LEGACY - Kept for compatibility if needed)
   */
  const processLevelCompletion = useCallback(async (baseReward, xp, gameMode = 'classic', completedLevel = null) => {
    // We now prefer syncProgressToDatabase for primary game loops
    const multipliers = {
      'hard_words': 2.0,
      'secret_word': 2.5,
      'mamak': 1.5,
      'word_fever': 1.25,
      'classic': 1.0
    };
    const multiplier = multipliers[gameMode] || 1.0;
    const reward = Math.ceil(baseReward * multiplier);

    setFils(prev => prev + reward);

    setCurrentXP(prevXP => {
      const nextXP = prevXP + xp;
      // Level increment is handled by the useEffect above
      return nextXP;
    });

    if (user) {
      await supabase.rpc('handle_level_completion', {
        p_user_id: user.id,
        p_reward_amount: Math.ceil(baseReward),
        p_xp_amount: xp,
        p_game_mode: gameMode,
        p_completed_level: completedLevel
      });
    }
  }, [user]);

  const addXP = useCallback((amount) => {
    if (!amount) return;
    setCurrentXP(prev => prev + amount);
    // The useEffect watcher above handles the database synchronization
  }, []);


  const appSoundsEnabled = appSfxVolume > 0;

  const playPopSound = useCallback((bypassDebounce = false) => {
    playPopSfx(appSoundsEnabled, bypassDebounce);
  }, [appSoundsEnabled]);

  const playNotifSound = useCallback(() => {
    playNotifSfx(appSoundsEnabled);
  }, [appSoundsEnabled]);

  const playMessageSound = useCallback(() => {
    playMessageSfx(appSoundsEnabled);
  }, [appSoundsEnabled]);

  const playMessageSentSound = useCallback(() => {
    playMessageSentSfx(appSoundsEnabled);
  }, [appSoundsEnabled]);


  const playVictorySound = useCallback(() => playVictorySfx(appSoundsEnabled), [appSoundsEnabled]);
  const playRewardSound = useCallback(() => playRewardSfx(appSoundsEnabled), [appSoundsEnabled]);
  const playPurchaseSound = useCallback(() => playPurchaseSfx(appSoundsEnabled), [appSoundsEnabled]);
  const playBoosterSound = useCallback(() => playBoosterSfx(appSoundsEnabled), [appSoundsEnabled]);
  const playBubblePopSound = useCallback(() => playBubblePopSfx(appSoundsEnabled), [appSoundsEnabled]);

  const playSettingsOpenSound = useCallback(() => {
    playSettingsOpenSfx(appSoundsEnabled);
  }, [appSoundsEnabled]);

  const playSettingsCloseSound = useCallback(() => {
    playSettingsCloseSfx(appSoundsEnabled);
  }, [appSoundsEnabled]);

  const playTabSound = useCallback(() => {
    playTabSfx(appSoundsEnabled);
  }, [appSoundsEnabled]);

  const playAlertSound = useCallback(() => {
    playAlertSfx(appSoundsEnabled);
  }, [appSoundsEnabled]);

  const playBackSound = useCallback(() => {
    playBackSfx(appSoundsEnabled);
  }, [appSoundsEnabled]);

  const playSaveSound = useCallback(() => {
    playSaveSfx(appSoundsEnabled);
  }, [appSoundsEnabled]);

  const playStartGameSound = useCallback(() => {
    try { playStartGameSfx(appSoundsEnabled); } catch (e) { console.warn("Audio fail:", e); }
  }, [appSoundsEnabled]);

  const startSearchingSound = useCallback(() => {
    try { startSearchingSfx(); } catch (e) { console.warn("Audio fail:", e); }
  }, []);

  const stopSearchingSound = useCallback((fade = true) => {
    stopSearchingSfx(fade);
  }, []);

  const startBGM = useCallback(() => {
    startBackgroundMusic();
  }, []);

  const stopBGM = useCallback(() => {
    stopBackgroundMusic();
  }, []);

  const updateMusicVolume = useCallback((val) => {
    setBgMusicVolume(val);
    localStorage.setItem('peyvchin_bg_music_volume', val.toString());
    setBackgroundMusicVolume(val / 100);

    // Also sync to Supabase if user is logged in
    const { user: currentUser } = stateRef.current;
    if (currentUser) {
      supabase.from('profiles').update({
        music_enabled: val > 0,
        updated_at: new Date().toISOString()
      }).eq('id', currentUser.id).then();
    }
  }, []);

  const updateSfxVolume = useCallback((val) => {
    setAppSfxVolume(val);
    localStorage.setItem('peyvchin_sfx_volume', val.toString());
    import('../utils/audio').then(m => m.setSfxVolume(val / 100));

    // Also sync to Supabase if user is logged in
    const { user: currentUser } = stateRef.current;
    if (currentUser) {
      supabase.from('profiles').update({
        sfx_volume: val,
        updated_at: new Date().toISOString()
      }).eq('id', currentUser.id).then();
    }
  }, []);

  // Sync initial music volume with SoundEngine once loaded
  useEffect(() => {
    setBackgroundMusicVolume(bgMusicVolume / 100);
  }, [bgMusicVolume]);

  /**
   * updateInventory ACTION (STABILIZED)
   */
  const updateInventory = useCallback(async (updates, isAdditive = true) => {
    // 1. captures previous values for local storage consistency
    const getLocalVal = (key, fallback) => {
      const saved = localStorage.getItem(key);
      return saved !== null ? Number(saved) : fallback;
    };

    // 2. Calculate next values for state and DB
    const calculateNext = (current, offset, additive) => additive ? (current + offset) : offset;

    const {
      user: currentUser,
      fils: currFils,
      derhem: currDerhem,
      dinar: currDinar,
      magnetCount: currMags,
      hintCount: currHints,
      skipCount: currSkips
    } = stateRef.current;

    // Local results to ensure what we set in state matches what we send to DB
    const nextValues = {
      fils: updates.fils !== undefined ? calculateNext(currFils, updates.fils, isAdditive) : undefined,
      derhem: updates.derhem !== undefined ? calculateNext(currDerhem, updates.derhem, isAdditive) : undefined,
      dinar: updates.dinar !== undefined ? calculateNext(currDinar, updates.dinar, isAdditive) : undefined,
      magnets: updates.magnetCount !== undefined ? calculateNext(currMags, updates.magnetCount, isAdditive) : undefined,
      hints: updates.hintCount !== undefined ? calculateNext(currHints, updates.hintCount, isAdditive) : undefined,
      skips: updates.skipCount !== undefined ? calculateNext(currSkips, updates.skipCount, isAdditive) : undefined
    };

    // 3. Perform state updates
    if (nextValues.fils !== undefined) setFils(nextValues.fils);
    if (nextValues.derhem !== undefined) setDerhem(nextValues.derhem);
    if (nextValues.dinar !== undefined) setDinar(nextValues.dinar);
    if (nextValues.magnets !== undefined) setMagnetCount(nextValues.magnets);
    if (nextValues.hints !== undefined) setHintCount(nextValues.hints);
    if (nextValues.skips !== undefined) setSkipCount(nextValues.skips);

    // 4. Persistent Local Storage Sync
    Object.entries(updates).forEach(([key, val]) => {
      const storageKey = key === 'magnetCount' ? 'peyvchin_magnets' : key === 'hintCount' ? 'peyvchin_hints' : key === 'skipCount' ? 'peyvchin_skips' : `peyvchin_${key}`;
      const fallback = key === 'fils' ? 250 : key === 'derhem' ? 50 : key === 'dinar' ? 5 : key === 'magnetCount' ? 1 : key === 'hintCount' ? 2 : 1;
      const current = getLocalVal(storageKey, fallback);
      const finalVal = isAdditive ? (current + val) : val;
      localStorage.setItem(storageKey, finalVal.toString());
    });

    // 5. Remote Database Sync
    if (currentUser) {
      const dbUpdates = { updated_at: new Date().toISOString() };
      Object.entries(nextValues).forEach(([dbKey, val]) => {
        if (val !== undefined) dbUpdates[dbKey] = val;
      });

      try {
        await supabase.from('profiles').update(dbUpdates).eq('id', currentUser.id);
      } catch (err) {
        console.warn("DB Inventory Sync Failed:", err);
      }
    }
  }, []); // IDENTITY STABLE

  /**
   * syncProgressToDatabase (STABILIZED)
   */
  const syncProgressToDatabase = useCallback(async (lettersCount, mode = 'classic', additionalData = {}) => {
    // USE REFS TO AVOID STALE CLOSURES (Critical for Async Saving)
    const {
      user: currentUser,
      currentXP: currXP,
      fils: currFils,
      derhem: currDerhem,
      dinar: currDinar,
      magnetCount: currMags,
      hintCount: currHints,
      skipCount: currSkips
    } = stateRef.current;

    const currentAward = getRewardForMode(mode);
    const xpToAdd = currentAward.xp;

    // 2. Instant Local Feedback (Guest & Auth)
    const newLocalXP = Number(currXP) + xpToAdd;
    setCurrentXP(newLocalXP);
    
    // Currency Update
    if (currentAward.type === 'fils') setFils(prev => Number(prev) + currentAward.amount);
    if (currentAward.type === 'derhem') setDerhem(prev => Number(prev) + currentAward.amount);
    if (currentAward.type === 'dinar') setDinar(prev => Number(prev) + currentAward.amount);

    // Streak Logic (If Classic or specialized mode)
    if (mode === 'classic' || mode === 'hard_words' || mode === 'mamak') {
      setDailyStreak(prev => {
        const next = prev + 1;
        localStorage.setItem('peyvchin_daily_streak', next.toString());
        return next;
      });
    }

    // Local Storage for Guests
    if (!currentUser) {
       localStorage.setItem('peyvchin_xp', newLocalXP.toString());
       if (currentAward.type === 'fils') localStorage.setItem('peyvchin_fils', (Number(currFils) + currentAward.amount).toString());
       // ... other currencies follow same pattern if needed
       return { 
          xpAdded: xpToAdd, 
          newLevel: getLevelFromXP(newLocalXP), 
          awards: currentAward, 
          isGuest: true 
       };
    }

    // 3. Database Synchronization (Auth Users)
    try {
      const { data, error } = await supabase.rpc('handle_game_xp', {
        p_user_id: currentUser.id,
        p_award_xp: xpToAdd,
        p_currency_type: currentAward.type,
        p_currency_amount: currentAward.amount
      });

      if (error) throw error;

      if (data) {
        const { new_level, new_xp, award_xp, award_amount, award_type } = data;
        const finalXP = new_xp;

        // 3. Prepare Profile Updates (Inventory, Progress)
        const profileUpdates = {
          updated_at: new Date().toISOString(),
          magnets: currMags,
          hints: currHints,
          skips: currSkips
        };

        // 5. Update Statistics (Wins/Correct/Etc)
        setPlayerStats(prev => {
          const next = { ...prev };
          if (mode === 'classic') {
             if (!next.classic) next.classic = { bestStreak: 0, currentStreak: 0, totalCorrect: 0 };
             next.classic.totalCorrect = (next.classic.totalCorrect || 0) + 1;
             next.classic.currentStreak = (next.classic.currentStreak || 0) + 1;
             if (next.classic.currentStreak > next.classic.bestStreak) next.classic.bestStreak = next.classic.currentStreak;
          } else if (mode === 'battle') {
             if (!next.battle) next.battle = { totalWins: 0, totalLosses: 0 };
             next.battle.totalWins = (next.battle.totalWins || 0) + 1;
          } else if (mode === 'mamak') {
             if (!next.mamak) next.mamak = { totalCorrect: 0 };
             next.mamak.totalCorrect = (next.mamak.totalCorrect || 0) + 1;
          } else if (mode === 'hard_words') {
             if (!next.hard) next.hard = { totalCorrect: 0 };
             next.hard.totalCorrect = (next.hard.totalCorrect || 0) + 1;
          } else if (mode === 'word_fever') {
             if (!next.wordFever) next.wordFever = { bestTime: 0, totalWins: 0 };
             next.wordFever.totalWins = (next.wordFever.totalWins || 0) + 1;
          } else if (mode === 'secret_word') {
             if (!next.secretWord) next.secretWord = { totalSolved: 0 };
             next.secretWord.totalSolved = (next.secretWord.totalSolved || 0) + 1;
          }
          
          // Persist Stats to DB periodically or immediately
          profileUpdates.inventory = { ...stateRef.current.inventory, stats: next };
          if (additionalData.solvedWords) {
            profileUpdates.inventory.solved_words = additionalData.solvedWords;
          }
          return next;
        });

        if (additionalData.solvedWords) setSolvedWords(additionalData.solvedWords);
        
        // Final Sync for metadata (Inventory, Stats)
        await supabase.from('profiles').update(profileUpdates).eq('id', currentUser.id);
        
        // Forced Rank Refresh (Auth Only)
        refreshRank(finalXP, true);

        // Typography: tracking-normal ensuring no letter-spacing on Kurdish dynamic text
        return {
          xpAdded: award_xp,
          newLevel: new_level,
          awards: currentAward,
          bahdiniMsg: `سەرکەفتنەکا نوی! ✨`
        };
      }
    } catch (err) {
      console.error("Unified XP Sync Failed:", err.message);
      return null;
    }
    return null;
  }, [refreshRank]);

  /**
   * incrementSecretWordProgress (STABILIZED)
   */
  const incrementSecretWordProgress = useCallback(async () => {
    const { user: currentUser } = stateRef.current;
    setWinsTowardsSecret(prev => {
      const next = Math.min(3, prev + 1);
      localStorage.setItem('peyvchin_wins_towards_secret', next.toString());
      if (currentUser) {
        supabase.from('profiles').update({ wins_towards_secret: next }).eq('id', currentUser.id).then(() => {
        });
      }
      return next;
    });
  }, []);

  const resetSecretWordProgress = useCallback(async () => {
    const { user: currentUser } = stateRef.current;
    setWinsTowardsSecret(0);
    localStorage.setItem('peyvchin_wins_towards_secret', '0');
    if (currentUser) {
      await supabase.from('profiles').update({ wins_towards_secret: 0 }).eq('id', currentUser.id);
    }
  }, []);

  const claimDailyReward = useCallback(async () => {
    const { user: currentUser, rewardStreak: currRewardStreak, lastRewardClaimedAt: lastClaimed } = stateRef.current;
    if (!currentUser?.id) return { success: false, error: "Tkaye pêşî wەرە ژوور" }; // Login required

    const now = new Date();
    const todayStr = getLocalDateString(now);
    
    // lastClaimed from DB might be a full ISO string, we need just the YYYY-MM-DD part
    const lastClaimDate = lastClaimed ? (lastClaimed.includes('T') ? lastClaimed.split('T')[0] : lastClaimed) : null;

    if (lastClaimDate === todayStr) {
      return { success: false, error: "Te xەlatێ خۆ یێ ئەڤرۆ وەرگرتییە" }; // Already claimed today
    }

    // Determine next streak mathematically
    let nextStreak = 1;
    if (lastClaimDate && isYesterday(lastClaimDate, now)) {
      nextStreak = (currRewardStreak % 7) + 1;
    }

    // Reward Mapping (Based on the newly calculated nextStreak)
    const rewards = {
      1: { fils: 100 },
      2: { magnetCount: 1 },
      3: { derhem: 5 },
      4: { hintCount: 1 },
      5: { dinar: 5 },
      6: { skipCount: 1 },
      7: { fils: 2000, magnetCount: 1, hintCount: 1, skipCount: 1 }
    };

    const currentReward = rewards[nextStreak];

    // Atomic Update: State & DB
    try {
      // 1. Update State immediately for UI responsiveness
      setRewardStreak(nextStreak);
      setLastRewardClaimedAt(todayStr); // Store just the date for cleaner comparison next time

      // 2. Grant the items
      updateInventory(currentReward);

      // 3. Persist to DB
      const { error: dbError } = await supabase.from('profiles').update({
        reward_streak: nextStreak,
        last_reward_claimed_at: todayStr,
        updated_at: now.toISOString()
      }).eq('id', currentUser.id);

      if (dbError) throw dbError;

      return { success: true, streak: nextStreak, reward: currentReward };
    } catch (err) {
      console.error("Daily Reward Claim Failed:", err);
      // Optional: rollback local state if needed, but usually Supabase eventual consistency or retry is better
      return { success: false, error: "ئاریشەیەک د داتابەیسێ دا ھەبوو" };
    }
  }, [updateInventory]);


  const checkBlockStatus = useCallback(async (targetId) => {
    if (!user?.id) return false;
    try {
      const { data, error } = await supabase
        .from('blocks')
        .select('id')
        .eq('blocker_id', user.id)
        .eq('blocked_id', targetId)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (err) {
      console.warn("Failed to check block status (possibly RLS):", err);
      return false;
    }
  }, [user?.id]);

  const value = useMemo(() => ({
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
    updateInventory,
    updateProfile,
    processLevelCompletion,
    syncProgressToDatabase,
    getLevelFromXP, getLevelData,
    handleToggleBlock, checkBlockStatus,
    userRank,
    refreshRank,
    user, setUser,
    setFils, setDerhem, setDinar,
    setMagnetCount, setHintCount, setSkipCount,
    appSfxVolume, updateSfxVolume,
    appSoundsEnabled,
    bgMusicVolume, updateMusicVolume,
    hapticEnabled, setHapticEnabled,
    playPopSound, playNotifSound, playMessageSound,
    playVictorySound, playRewardSound, playPurchaseSound, playBoosterSound,
    playSettingsOpenSound, playSettingsCloseSound,
    playTabSound, playAlertSound, playBackSound, playSaveSound, playBubblePopSound,
    startSearchingSound, stopSearchingSound,
    startBGM, stopBGM,
    playStartGameSound,
    playDailyOpenSfx, playDailyClaimSfx,
    setCurrentXP,
    lastNotifiedLevel, setLastNotifiedLevel,
    loading, loadingAuth,
    refreshProfile: syncProfile
  }), [
    level, winsTowardsSecret, currentXP, maxXP, minXPForLevel, progressPercent, fils, derhem, dinar,
    dailyStreak, rewardStreak, lastRewardClaimedAt, claimDailyReward,
    inventory, magnetCount, hintCount, skipCount,
    ownedAvatars, userAvatar, unlockedThemes, currentTheme, solvedWords, playerStats,
    userNickname, city, isInKurdistan, countryCode, userRank, user, loading, loadingAuth,
    appSoundsEnabled, hapticEnabled, lastNotifiedLevel,
    incrementSecretWordProgress, resetSecretWordProgress, addXP, updateInventory,
    updateProfile, processLevelCompletion, syncProgressToDatabase, getLevelFromXP,
    getLevelData, handleToggleBlock, checkBlockStatus, refreshRank, setUser,
    setFils, setDerhem, setDinar, setMagnetCount, setHintCount, setSkipCount,
    setHapticEnabled, playPopSound, playNotifSound,
    appSfxVolume, updateSfxVolume,
    playMessageSound, playVictorySound, playRewardSound, playPurchaseSound, playBoosterSound,
    playSettingsOpenSound, playSettingsCloseSound,
    playAlertSound, playBackSound, playSaveSound, playBubblePopSound,
    startSearchingSound, stopSearchingSound,
    startBGM, stopBGM,
    playTabSound,
    playStartGameSound,
    setCurrentXP, setLastNotifiedLevel,
    bgMusicVolume, updateMusicVolume,
    syncProfile
  ]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
