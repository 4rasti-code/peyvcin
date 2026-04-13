import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { playSuccessSfx, playPopSfx, playNotifSfx, playMessageSfx, playGameStartSfx, playCoinSfx } from '../utils/audio';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [level, setLevel] = useState(1);
  const [mamakLevel, setMamakLevel] = useState(1);
  const [hardWordsLevel, setHardWordsLevel] = useState(1);
  const [wordFeverLevel, setWordFeverLevel] = useState(1);
  const [secretWordLevel, setSecretWordLevel] = useState(1);
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
   * RPG PROGRESSION FORMULA
   * Required XP starts at 500 and scales up by 150 each level.
   */
  const calculateMaxXP = (lvl) => {
    if (lvl >= 100) return 999999;
    return 500 + ((lvl - 1) * 150);
  };

  const maxXP = calculateMaxXP(level);

  const refreshRank = async (xpValue = currentXP) => {
    try {
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
 
    // --- LOGIC: Automatic Level Up (Multi-level Jump Support) ---
    useEffect(() => {
      let tempLevel = level;
      let didLevelUp = false;
      
      // Advance as many levels as the XP allows
      while (currentXP >= calculateMaxXP(tempLevel) && tempLevel < 100) {
        tempLevel++;
        didLevelUp = true;
      }

      if (didLevelUp) {
        setLevel(tempLevel);
        
        if (user) {
          supabase.from('profiles').update({ 
            level: tempLevel,
            updated_at: new Date().toISOString()
          }).eq('id', user.id).then();
        }
        localStorage.setItem('peyvchin_level', tempLevel.toString());
        console.log(`🚀 Level Up! You reached Level ${tempLevel}`);
        playSuccessSfx(); // Optional: level up fanfare
        refreshRank(); // Refresh rank when level/xp changes significantly
      }
    }, [currentXP, level, user]);

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
        const localMamakLvl = localStorage.getItem('peyvchin_mamak_level');
        const localHardLvl = localStorage.getItem('peyvchin_hard_words_level');
        const localFeverLvl = localStorage.getItem('peyvchin_word_fever_level');
        const localSecretLvl = localStorage.getItem('peyvchin_secret_word_level');
        const localUnlockProgress = localStorage.getItem('peyvchin_wins_towards_secret');
        
        if (localXP) setCurrentXP(parseFloat(localXP));
        if (localLvl) setLevel(parseInt(localLvl));
        if (localMamakLvl) setMamakLevel(parseInt(localMamakLvl));
        if (localHardLvl) setHardWordsLevel(parseInt(localHardLvl));
        if (localFeverLvl) setWordFeverLevel(parseInt(localFeverLvl));
        if (localSecretLvl) setSecretWordLevel(parseInt(localSecretLvl));
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
          const columns = 'level, xp, mamak_level, hard_word_count, word_fever_level, secret_word_level, wins_towards_secret, shayi, dirham, dinar, magnets, hints, skips, daily_streak, inventory, app_sounds_enabled, haptic_enabled, nickname, avatar_url, city, is_kurdistan, country_code, updated_at';
          
          let result = await supabase.from('profiles').select(columns).eq('id', userId).single();
          
          // 2. Defensive Fallback: If 42703 (Undefined Column) occurs, fetch only 100% Core columns
          if (result.error && result.error.code === '42703') {
            console.warn("Detection of missing columns in Supabase. Falling back to Core Select.");
            const coreColumns = 'level, xp, shayi, magnets, hints, skips'; // Basics that must exist
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
            id: userId, level: 1, xp: 0,
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
          safeSet(setMamakLevel, data.mamak_level, 1);
          safeSet(setHardWordsLevel, data.hard_word_count, 1); // Mapping hard_word_count to local state
          safeSet(setWordFeverLevel, data.word_fever_level, 1);
          safeSet(setSecretWordLevel, data.secret_word_level, 1);
          safeSet(setWinsTowardsSecret, data.wins_towards_secret, 0);
          safeSet(setCurrentXP, data.xp, 0);
          safeSet(setFils, data.shayi, 1000);
          safeSet(setDerhem, data.dirham, 50);
          safeSet(setZer, data.dinar, 5);
          safeSet(setMagnetCount, data.magnets, 3);
          safeSet(setHintCount, data.hints, 5);
          safeSet(setSkipCount, data.skips, 2);
          safeSet(setDailyStreak, data.daily_streak, 0);
          
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

  /**
   * processLevelCompletion ACTION
   * Executes the secure handle_level_completion RPC and updates local state.
   */
  const processLevelCompletion = async (baseReward, xp, gameMode = 'classic', completedLevel = null) => {
    // 1. Calculate Expected Reward for Optimistic UI
    const multipliers = {
      'hard_words': 2.0,
      'secret_word': 2.5,
      'mamak': 1.5,
      'word_fever': 1.25,
      'classic': 1.0
    };
    const multiplier = multipliers[gameMode] || 1.0;
    const reward = Math.ceil(baseReward * multiplier);

    // 2. Optimistic Updates
    setFils(prev => prev + reward);
    setCurrentXP(prev => prev + xp);
    
    if (gameMode === 'mamak' && completedLevel === mamakLevel) setMamakLevel(prev => prev + 1);
    if (gameMode === 'hard_words' && completedLevel === hardWordsLevel) setHardWordsLevel(prev => prev + 1);
    if (gameMode === 'word_fever' && completedLevel === wordFeverLevel) setWordFeverLevel(prev => prev + 1);
    if (gameMode === 'secret_word' && completedLevel === secretWordLevel) setSecretWordLevel(prev => prev + 1);

    // 3. Database Sync via RPC
    if (user) {
      try {
        const { error } = await supabase.rpc('handle_level_completion', {
          p_user_id: user.id,
          p_reward_amount: Math.ceil(baseReward),
          p_xp_amount: xp,
          p_game_mode: gameMode,
          p_completed_level: completedLevel
        });
 
        if (error) throw error;
      } catch (err) {
        console.error("RPC Completion Failed:", err);
      }
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

    // Map internal names to DB column names (Direct Columns)
    const dbUpdates = {};
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

    dbUpdates.updated_at = new Date().toISOString();

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...dbUpdates }, { onConflict: 'id' });
      
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error("Profile Sync Error:", err);
      return { success: false, error: err };
    }
  };


  return (
    <GameContext.Provider value={{ 
      level, mamakLevel, hardWordsLevel, wordFeverLevel, secretWordLevel,
      winsTowardsSecret, incrementSecretWordProgress, resetSecretWordProgress,
      currentXP, maxXP, fils, derhem, zer, addXP,
      dailyStreak, setDailyStreak,
      inventory, setInventory,
      magnetCount, hintCount, skipCount,
      ownedAvatars, equippedAvatar: userAvatar, unlockedThemes, currentTheme,
      solvedWords, playerStats,
      userNickname, userAvatar, city, isInKurdistan, countryCode,
      updateInventory,
      updateProfile,
      processLevelCompletion,
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
