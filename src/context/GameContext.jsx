import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { playSuccessSfx, playPopSfx, playNotifSfx, playMessageSfx, playGameStartSfx, playCoinSfx } from '../utils/audio';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [level, setLevel] = useState(1);
  const [lastNotifiedLevel, setLastNotifiedLevel] = useState(1);
  const [winsTowardsSecret, setWinsTowardsSecret] = useState(0);
  const [currentXP, setCurrentXP] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [appSoundsEnabled, setAppSoundsEnabled] = useState(() => {
    const saved = localStorage.getItem('peyvchin_app_sounds');
    return saved !== null ? saved === 'true' : true;
  });
  const [hapticEnabled, setHapticEnabled] = useState(() => {
    const saved = localStorage.getItem('peyvchin_haptic_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);
   const [userRank, setUserRank] = useState(1);
   const [inventory, setInventory] = useState({ badges: [] });
 


  // INVENTORY STATE (Robust Initialization)
  const getInitial = (key, fallback) => {
    const saved = localStorage.getItem(key);
    return (saved !== null) ? Number(saved) : fallback;
  };

  const [fils, setFils] = useState(() => getInitial('peyvchin_fils', 1000));
  const [derhem, setDerhem] = useState(() => getInitial('peyvchin_derhem', 50));
  const [zer, setZer] = useState(() => getInitial('peyvchin_zer', 5));
  const [magnetCount, setMagnetCount] = useState(() => getInitial('peyvchin_magnets', 3));
  const [hintCount, setHintCount] = useState(() => getInitial('peyvchin_hints', 5));
  const [skipCount, setSkipCount] = useState(() => getInitial('peyvchin_skips', 2));

  // EXTENDED PLAYER DATA (Everything Connected)
  const [userNickname, setUserNickname] = useState('یاریزان');
  const [userAvatar, setUserAvatar] = useState('default');
  const [city, setCity] = useState('');
  const [isInKurdistan, setIsInKurdistan] = useState(true);
  const [countryCode, setCountryCode] = useState('IQ');
  const [ownedAvatars, setOwnedAvatars] = useState(['default']);
  const [unlockedThemes, setUnlockedThemes] = useState(['default']);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [solvedWords, setSolvedWords] = useState([]);
  const [playerStats, setPlayerStats] = useState({
    classic: { bestStreak: 0, currentStreak: 0, totalCorrect: 0 },
    mamak: { totalCorrect: 0 },
    hard: { totalCorrect: 0 },
    wordFever: { bestTime: 0, totalWins: 0 }
  });

  /**
   * EXPONENTIAL PROGRESSION FORMULA
   * Base: 500, Factor: 1.1 (10% increase per level)
   */
  const LEVEL_BASE_XP = 500;
  const LEVEL_FACTOR = 1.1;

  const getLevelFromXP = (xp) => {
    if (xp <= 0) return 1;
    return Math.floor(Math.log(xp * (LEVEL_FACTOR - 1) / LEVEL_BASE_XP + 1) / Math.log(LEVEL_FACTOR)) + 1;
  };

  const getLevelData = (xp) => {
    const level = getLevelFromXP(xp);
    const currentLevelBase = LEVEL_BASE_XP * (Math.pow(LEVEL_FACTOR, level - 1) - 1) / (LEVEL_FACTOR - 1);
    const nextLevelBase = LEVEL_BASE_XP * (Math.pow(LEVEL_FACTOR, level) - 1) / (LEVEL_FACTOR - 1);
    const levelWidth = nextLevelBase - currentLevelBase;
    const progressInLevel = xp - currentLevelBase;
    const progressPercent = levelWidth > 0 ? (progressInLevel / levelWidth) * 100 : 0;
    
    return {
      level,
      currentLevelBase,
      nextLevelBase,
      progressInLevel,
      levelWidth,
      progressPercent: Math.min(100, Math.max(0, progressPercent))
    };
  };
  
  const levelData = getLevelData(currentXP);
  const minXPForLevel = levelData.currentLevelBase;
  const maxXP = levelData.nextLevelBase;


  const lastRefreshTime = useRef(0);
  const lastXPRef = useRef(-1);

  const refreshRank = async (xpValue = currentXP) => {
    // 1. Guard: If value hasn't changed AND we refreshed very recently (< 2s), skip
    const now = Date.now();
    if (xpValue === lastXPRef.current && (now - lastRefreshTime.current < 2000)) {
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
  };

  // 1. DATA SYNCHRONIZATION LIFECYCLE
  useEffect(() => {
    const initializeSession = async () => {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await syncProfile(session.user.id);
      } else {
        // Fallback to local storage for guests
        const localXP = localStorage.getItem('peyvchin_xp');
        const localLvl = localStorage.getItem('peyvchin_level');
        const localNotifiedLvl = localStorage.getItem('peyvchin_last_notified_level');
        const localUnlockProgress = localStorage.getItem('peyvchin_wins_towards_secret');
        
        if (localXP) setCurrentXP(parseFloat(localXP));
        if (localLvl) setLevel(parseInt(localLvl));
        if (localNotifiedLvl) setLastNotifiedLevel(parseInt(localNotifiedLvl));
        if (localUnlockProgress) setWinsTowardsSecret(parseInt(localUnlockProgress));
        
        // Sync items
        setFils(getInitial('peyvchin_fils', 1000));
        setDerhem(getInitial('peyvchin_derhem', 50));
        setZer(getInitial('peyvchin_zer', 5));
        setMagnetCount(getInitial('peyvchin_magnets', 3));
        setHintCount(getInitial('peyvchin_hints', 5));
        setSkipCount(getInitial('peyvchin_skips', 2));
      }
      setLoading(false);
    };

    const syncProfile = async (userId) => {
      try {
        let data, error;
        try {
          // 1. Primary Attempt: All Premium Columns
          const columns = 'level, xp, last_notified_level, wins_towards_secret, shayi, dirham, dinar, magnets, hints, skips, daily_streak, inventory, app_sounds_enabled, haptic_enabled, nickname, avatar_url, city, is_kurdistan, country_code, updated_at';
          
          let result = await supabase.from('profiles').select(columns).eq('id', userId).single();
          
          // 2. Defensive Fallback: If 42703 (Undefined Column) occurs, fetch only 100% Core columns
          if (result.error && result.error.code === '42703') {
            console.warn("Detection of missing columns in Supabase. Falling back to Core Select.");
            const coreColumns = 'level, xp, last_notified_level, shayi, magnets, hints, skips'; // Basics that must exist
            result = await supabase.from('profiles').select(coreColumns).eq('id', userId).single();
          }

          data = result.data;
          error = result.error;
        } catch (fetchError) {
          console.warn("Supabase fetch fatal error:", fetchError);
          return;
        }

        if (error && error.code === 'PGRST116') {
          const initialRecord = {
            id: userId, level: 1, xp: 0, last_notified_level: 1,
            shayi: 1000, dirham: 50, dinar: 5,
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
            updated_at: new Date().toISOString()
          };
          await supabase.from('profiles').insert([initialRecord]);
          setFils(1000); setMagnetCount(3); setHintCount(5); setSkipCount(2); setDailyStreak(0);
        } else if (data && !error) {
          // Safe Data Mapping (Try/Catch per field)
          const safeSet = (setter, val, fallback) => {
            try { setter(val ?? fallback); } catch(e) { console.warn("Mapping failed for field", e); }
          };

          safeSet(setLevel, data.level, 1);
          safeSet(setWinsTowardsSecret, data.wins_towards_secret, 0);
          safeSet(setCurrentXP, data.xp, 0);
          safeSet(setFils, data.shayi, 1000);
          safeSet(setDerhem, data.dirham, 50);
          safeSet(setZer, data.dinar, 5);
          safeSet(setMagnetCount, data.magnets, 3);
          safeSet(setHintCount, data.hints, 5);
          safeSet(setSkipCount, data.skips, 2);
          safeSet(setDailyStreak, data.daily_streak, 0);
          safeSet(setLastNotifiedLevel, data.last_notified_level, 1);
          
          // Safety fallback for sound/haptic columns
          setAppSoundsEnabled(data.app_sounds_enabled !== undefined ? data.app_sounds_enabled : (localStorage.getItem('peyvchin_app_sounds') === 'true'));
          setHapticEnabled(data.haptic_enabled !== undefined ? data.haptic_enabled : (localStorage.getItem('peyvchin_haptic_enabled') === 'true'));
          
          // Extended Data
          setUserNickname(data.nickname || 'یاریزان');
          setUserAvatar(data.avatar_url || 'default');
          setCity(data.city || '');
          setIsInKurdistan(data.is_kurdistan ?? true);
          setCountryCode(data.country_code || 'IQ');

          const inv = data.inventory || {};
          setInventory(inv);
          if (inv.owned_avatars) setOwnedAvatars(inv.owned_avatars);
          if (inv.unlocked_themes) setUnlockedThemes(inv.unlocked_themes);
          if (inv.solved_words) setSolvedWords(inv.solved_words);
          if (inv.stats) setPlayerStats(inv.stats);
          if (inv.equipped_theme) setCurrentTheme(inv.equipped_theme);
          

          // Daily Streak Logic
          const today = new Date().toISOString().split('T')[0];
          const lastLoginDate = inv.last_login;
          let newStreak = data.daily_streak || 0;

          if (!lastLoginDate) {
            newStreak = 1;
            updateProfile({ playerStats: { ...inv.stats, last_login: today }, dailyStreak: 1 });
          } else if (lastLoginDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastLoginDate === yesterdayStr) {
               newStreak += 1;
            } else {
               newStreak = 1;
            }
            
            // Persist the new streak and update login date
            const nextInv = { ...inv, last_login: today };
            setInventory(nextInv);
            setDailyStreak(newStreak);
            
            // Sync to DB
            supabase.from('profiles').update({ 
               daily_streak: newStreak,
               inventory: nextInv,
               updated_at: new Date().toISOString()
            }).eq('id', userId).then();
          } else {
            setDailyStreak(newStreak);
          }
          
          localStorage.setItem('peyvchin_skips', (data.skips ?? 2).toString());
          localStorage.setItem('peyvchin_daily_streak', (data.daily_streak ?? 0).toString());
          localStorage.setItem('peyvchin_app_sounds', (data.app_sounds_enabled ?? true).toString());
          localStorage.setItem('peyvchin_haptic_enabled', (data.haptic_enabled ?? true).toString());
          
          refreshRank(data.xp || 0);
        }
      } catch (err) {
        console.warn("Profile Sync Error:", err);
      }
    };
 


    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) syncProfile(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ONLINE HEARTBEAT
  useEffect(() => {
    if (!user) return;
    const heartbeat = setInterval(async () => {
      try {
        await supabase.from('profiles').update({ updated_at: new Date().toISOString() }).eq('id', user.id);
      } catch(e) {}
    }, 60000);
    return () => clearInterval(heartbeat);
  }, [user]);

  /**
   * syncProgressToDatabase (NEW XP & STREAK SYSTEM)
   * Uses handle_game_xp RPC for atomic progression sync.
   */
  const syncProgressToDatabase = async (lettersCount, gameMode = 'classic', additionalData = {}) => {
    if (!user?.id) return null;

    try {
      // 1. Execute the primary atomic RPC for XP and Currency
      const { data, error } = await supabase.rpc('handle_game_xp', {
        p_user_id: user.id,
        p_letters_count: lettersCount,
        p_shayi_bonus: additionalData.shayiBonus || 5
      });

      if (error) throw error;

      if (data) {
        const { new_level, xp_added, current_streak } = data;
        const finalXP = (currentXP || 0) + xp_added;

        // 2. Perform any additional profile updates in parallel to save time (solved words, secret progress)
        const profileUpdates = {
          updated_at: new Date().toISOString()
        };
        
        if (additionalData.solvedWords) profileUpdates.inventory = { ...inventory, solved_words: additionalData.solvedWords };
        if (additionalData.winsTowardsSecret !== undefined) profileUpdates.wins_towards_secret = additionalData.winsTowardsSecret;
        if (additionalData.resetSecretProgress) profileUpdates.wins_towards_secret = 0;

        // Fire-and-forget these secondary updates or wait for them? 
        // We'll wait to ensure everything is solid before the victory screen.
        await supabase.from('profiles').update(profileUpdates).eq('id', user.id);

        // 3. Local State Sync
        setCurrentXP(finalXP);
        setDailyStreak(current_streak);
        if (additionalData.solvedWords) setSolvedWords(additionalData.solvedWords);
        if (additionalData.winsTowardsSecret !== undefined) setWinsTowardsSecret(additionalData.winsTowardsSecret);
        if (additionalData.resetSecretProgress) setWinsTowardsSecret(0);
        
        if (new_level > level) {
          setLevel(new_level);
          refreshRank(finalXP); // Correctly passing the numeric value
        } else {
          // Refresh rank if XP changed significantly or just for correctness
          refreshRank(finalXP);
        }

        // Return sync data for the Victory Overlay
        return {
          xpAdded: xp_added,
          currentStreak: current_streak,
          newLevel: new_level,
          bahdiniMsg: current_streak > 1 
            ? `ستریکێن تە: ${current_streak} ڕۆژ 🔥` 
            : `دەستپێکرنەکا باشە! ✨`
        };
      }
    } catch (err) {
      console.error("XP Sync Failed:", err.message);
      return null;
    }
    return null;
  };

  /**
   * processLevelCompletion (LEGACY - Kept for compatibility if needed)
   */
  const processLevelCompletion = async (baseReward, xp, gameMode = 'classic', completedLevel = null) => {
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
  };

  const addXP = (amount) => {
    if (!amount) return;
    setCurrentXP(prev => {
      const next = prev + amount;
      localStorage.setItem('peyvchin_xp', next.toString());
      // Fire-and-forget DB update
      if (user) {
        supabase.from('profiles').update({ xp: next }).eq('id', user.id).then();
      }
      return next;
    });
  };

  /**
   * updateInventory ACTION
   * Atomic update for any inventory item or currency.
   */
  const updateInventory = async (updates, isAdditive = true) => {
    // 1. captures previous values for local storage consistency
    const getLocalVal = (key, fallback) => {
      const saved = localStorage.getItem(key);
      return saved !== null ? Number(saved) : fallback;
    };

    // 2. Perform state updates using the functional pattern
    if (updates.fils !== undefined) setFils(prev => isAdditive ? prev + updates.fils : updates.fils);
    if (updates.derhem !== undefined) setDerhem(prev => isAdditive ? prev + updates.derhem : updates.derhem);
    if (updates.zer !== undefined) setZer(prev => isAdditive ? prev + updates.zer : updates.zer);
    if (updates.magnetCount !== undefined) setMagnetCount(prev => isAdditive ? prev + updates.magnetCount : updates.magnetCount);
    if (updates.hintCount !== undefined) setHintCount(prev => isAdditive ? prev + updates.hintCount : updates.hintCount);
    if (updates.skipCount !== undefined) setSkipCount(prev => isAdditive ? prev + updates.skipCount : updates.skipCount);

    // 3. Persistent Local Storage Sync
    Object.entries(updates).forEach(([key, val]) => {
      const storageKey = key === 'magnetCount' ? 'peyvchin_magnets' : key === 'hintCount' ? 'peyvchin_hints' : key === 'skipCount' ? 'peyvchin_skips' : `peyvchin_${key}`;
      const fallback = key === 'fils' ? 250 : key === 'derhem' ? 50 : key === 'zer' ? 5 : key === 'magnetCount' ? 1 : key === 'hintCount' ? 2 : 1;
      const current = getLocalVal(storageKey, fallback);
      const finalVal = isAdditive ? (current + val) : val;
      localStorage.setItem(storageKey, finalVal.toString());
    });

    // 4. Remote Database Sync (Supabase)
    if (user) {
      // For DB, we use a relative update RPC if available, or fetch fresh values.
      // To keep it simple and reactive, we calculate based on the current context state + the update.
      // Note: This relies on the context being mostly in sync.
      const dbUpdates = {};
      if (updates.fils !== undefined) dbUpdates.shayi = isAdditive ? (fils + updates.fils) : updates.fils;
      if (updates.derhem !== undefined) dbUpdates.dirham = isAdditive ? (derhem + updates.derhem) : updates.derhem;
      if (updates.zer !== undefined) dbUpdates.dinar = isAdditive ? (zer + updates.zer) : updates.zer;
      if (updates.magnetCount !== undefined) dbUpdates.magnets = isAdditive ? (magnetCount + updates.magnetCount) : updates.magnetCount;
      if (updates.hintCount !== undefined) dbUpdates.hints = isAdditive ? (hintCount + updates.hintCount) : updates.hintCount;
      if (updates.skipCount !== undefined) dbUpdates.skips = isAdditive ? (skipCount + updates.skipCount) : updates.skipCount;
      dbUpdates.updated_at = new Date().toISOString();

      try {
        await supabase.from('profiles').update(dbUpdates).eq('id', user.id);
      } catch (err) {
        console.warn("DB Inventory Sync Failed:", err);
      }
    }
  };

  /**
   * SECRET WORD UNLOCK TRACKER
   */
  const incrementSecretWordProgress = async () => {
    setWinsTowardsSecret(prev => {
      const next = Math.min(3, prev + 1);
      localStorage.setItem('peyvchin_wins_towards_secret', next.toString());
      if (user) {
        supabase.from('profiles').update({ wins_towards_secret: next }).eq('id', user.id).then();
      }
      return next;
    });
  };

  const resetSecretWordProgress = async () => {
    setWinsTowardsSecret(0);
    localStorage.setItem('peyvchin_wins_towards_secret', '0');
    if (user) {
      await supabase.from('profiles').update({ wins_towards_secret: 0 }).eq('id', user.id);
    }
  };

  const playPopSound = (bypassDebounce = false) => {
    playPopSfx(appSoundsEnabled, bypassDebounce);
  };

  const playNotifSound = () => {
    playNotifSfx(appSoundsEnabled);
  };

  const playMessageSound = () => {
    playMessageSfx(appSoundsEnabled);
  };

  const playStartSound = () => {
    playGameStartSfx(appSoundsEnabled);
  };

  const playVictorySound = () => {
    playSuccessSfx(appSoundsEnabled);
  };

  const playRewardSound = () => {
    playCoinSfx(appSoundsEnabled);
  };

  /**
   * GENERAL PROFILE UPDATER
   */
  const updateProfile = async (profileData) => {
    if (!user?.id) return;

    // Apply Local Updates First
    if (profileData.nickname !== undefined) setUserNickname(profileData.nickname);
    if (profileData.avatar_url !== undefined) setUserAvatar(profileData.avatar_url);
    if (profileData.city !== undefined) setCity(profileData.city);
    if (profileData.is_kurdistan !== undefined) setIsInKurdistan(profileData.is_kurdistan);
    if (profileData.country_code !== undefined) setCountryCode(profileData.country_code);
    if (profileData.lastNotifiedLevel !== undefined) {
      setLastNotifiedLevel(profileData.lastNotifiedLevel);
      localStorage.setItem('peyvchin_last_notified_level', profileData.lastNotifiedLevel.toString());
    }

    // Map internal names to DB column names (Direct Columns)
    const dbUpdates = {};
    if (profileData.lastNotifiedLevel !== undefined) dbUpdates.last_notified_level = profileData.lastNotifiedLevel;
    if (profileData.nickname !== undefined) {
      const cleanNickname = profileData.nickname.trim();
      dbUpdates.nickname = cleanNickname;
      setUserNickname(cleanNickname);
    }
    if (profileData.avatar_url !== undefined) dbUpdates.avatar_url = profileData.avatar_url;
    if (profileData.city !== undefined) dbUpdates.city = profileData.city;
    if (profileData.is_kurdistan !== undefined) dbUpdates.is_kurdistan = profileData.is_kurdistan;
    if (profileData.country_code !== undefined) dbUpdates.country_code = profileData.country_code;
    if (profileData.app_sounds_enabled !== undefined) dbUpdates.app_sounds_enabled = profileData.app_sounds_enabled;
    if (profileData.haptic_enabled !== undefined) dbUpdates.haptic_enabled = profileData.haptic_enabled;
    
    // Inventory JSONB Updates
    let nextInventory = { ...inventory };
    let hasInventoryUpdate = false;
    
    if (profileData.ownedAvatars) { nextInventory.owned_avatars = profileData.ownedAvatars; setOwnedAvatars(profileData.ownedAvatars); hasInventoryUpdate = true; }
    if (profileData.unlockedThemes) { nextInventory.unlocked_themes = profileData.unlockedThemes; setUnlockedThemes(profileData.unlockedThemes); hasInventoryUpdate = true; }
    if (profileData.solvedWords) { nextInventory.solved_words = profileData.solvedWords; setSolvedWords(profileData.solvedWords); hasInventoryUpdate = true; }
    if (profileData.playerStats) { nextInventory.stats = profileData.playerStats; setPlayerStats(profileData.playerStats); hasInventoryUpdate = true; }
    if (profileData.currentTheme) { nextInventory.equipped_theme = profileData.currentTheme; setCurrentTheme(profileData.currentTheme); hasInventoryUpdate = true; }

    if (hasInventoryUpdate) {
      dbUpdates.inventory = nextInventory;
      setInventory(nextInventory);
    }

    // SANITIZATION: Remove any undefined values to prevent 400 Bad Request
    Object.keys(dbUpdates).forEach(key => {
      if (dbUpdates[key] === undefined) delete dbUpdates[key];
    });

    dbUpdates.updated_at = new Date().toISOString();

    try {
      console.log("Supabase Profile Sync Proceeding:", { id: user.id, ...dbUpdates });
      const { data, error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', user.id);
      
      if (error) {
        console.error("Supabase Profile Sync FAILED:", error);
        throw error;
      }
      console.log("Supabase Profile Sync SUCCESSFUL");
      return { success: true };
    } catch (err) {
      console.error("Critical Profile Update Error:", err);
      return { success: false, error: err.message };
    }
  };


  const handleToggleBlock = async (targetId, currentStatus) => {
    if (!user?.id) return;
    try {
      if (currentStatus) {
        // Unblock
        await supabase
          .from('blocks')
          .delete()
          .eq('blocker_id', user?.id)
          .eq('blocked_id', targetId);
      } else {
        // Block
        await supabase
          .from('blocks')
          .insert([{ blocker_id: user?.id, blocked_id: targetId }]);
      }
      return true;
    } catch (err) {
      console.error("Block toggle failed:", err);
      return false;
    }
  };

  const checkBlockStatus = async (targetId) => {
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
  };

  return (
    <GameContext.Provider value={{ 
      level, 
      winsTowardsSecret, incrementSecretWordProgress, resetSecretWordProgress,
      currentXP, maxXP, minXPForLevel, fils, derhem, zer, addXP,
      dailyStreak, setDailyStreak,
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
      setFils, setDerhem, setZer,
      setMagnetCount, setHintCount, setSkipCount,
      appSoundsEnabled, setAppSoundsEnabled,
      hapticEnabled, setHapticEnabled,
      playPopSound, playNotifSound, playMessageSound,
      playStartSound, playVictorySound, playRewardSound,
      setLevel, setCurrentXP,
      lastNotifiedLevel, setLastNotifiedLevel,
      loading 
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
