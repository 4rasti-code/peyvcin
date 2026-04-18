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
  startBackgroundMusic, stopBackgroundMusic
} from '../utils/audio';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [level, setLevel] = useState(1);
  const [lastNotifiedLevel, setLastNotifiedLevel] = useState(1);
  const [winsTowardsSecret, setWinsTowardsSecret] = useState(0);
  const [currentXP, setCurrentXP] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [rewardStreak, setRewardStreak] = useState(0);
  const [lastRewardClaimedAt, setLastRewardClaimedAt] = useState(null);

  const [appSfxVolume, setAppSfxVolume] = useState(() => {
    const saved = localStorage.getItem('peyvchin_sfx_volume');
    return saved !== null ? Number(saved) : 15; // 15% Default
  });
  const [bgMusicVolume, setBgMusicVolume] = useState(() => {
    const saved = localStorage.getItem('peyvchin_bg_music_volume');
    return saved !== null ? Number(saved) : 30; // 30% Default
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

  const getLevelFromXP = useCallback((xp) => {
    if (xp <= 0) return 1;
    return Math.floor(Math.log(xp * (LEVEL_FACTOR - 1) / LEVEL_BASE_XP + 1) / Math.log(LEVEL_FACTOR)) + 1;
  }, []);

  const getLevelData = useCallback((xp) => {
    const levelVal = getLevelFromXP(xp);
    const currentLevelBase = LEVEL_BASE_XP * (Math.pow(LEVEL_FACTOR, levelVal - 1) - 1) / (LEVEL_FACTOR - 1);
    const nextLevelBase = LEVEL_BASE_XP * (Math.pow(LEVEL_FACTOR, levelVal) - 1) / (LEVEL_FACTOR - 1);
    const levelWidth = nextLevelBase - currentLevelBase;
    const progressInLevel = xp - currentLevelBase;
    const progressPercent = levelWidth > 0 ? (progressInLevel / levelWidth) * 100 : 0;
    
    return {
      level: levelVal,
      currentLevelBase,
      nextLevelBase,
      progressInLevel,
      levelWidth,
      progressPercent: Math.min(100, Math.max(0, progressPercent))
    };
  }, [getLevelFromXP]);
  
  const levelData = getLevelData(currentXP);
  const minXPForLevel = levelData.currentLevelBase;
  const maxXP = levelData.nextLevelBase;


  const lastRefreshTime = useRef(0);
  const lastXPRef = useRef(-1);

  const refreshRank = useCallback(async (xpValue = currentXP) => {
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
  }, [currentXP]);

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
          // Use select('*') so Supabase returns whatever columns exist without throwing a 400 Bad Request for unmigrated fields
          let result = await supabase.from('profiles').select('*').eq('id', userId).single();
          
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
            reward_streak: 0,
            last_reward_claimed_at: null,
            updated_at: new Date().toISOString()
          };
          await supabase.from('profiles').insert([initialRecord]);
          setFils(1000); setMagnetCount(3); setHintCount(5); setSkipCount(2); setDailyStreak(0);
          setRewardStreak(0); setLastRewardClaimedAt(null);
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
          safeSet(setRewardStreak, data.reward_streak, 0);
          safeSet(setLastRewardClaimedAt, data.last_reward_claimed_at, null);
          
          // Safety fallback for haptic column
          setHapticEnabled(data.haptic_enabled !== undefined ? data.haptic_enabled : (localStorage.getItem('peyvchin_haptic_enabled') === 'true'));
          
          const inv = data.inventory || {};
          setInventory(inv);
          
          const lsSfx = localStorage.getItem('peyvchin_sfx_volume');
          const sfxVol = inv.settings?.app_sfx_volume ?? (lsSfx !== null ? Number(lsSfx) : 15);
          setAppSfxVolume(sfxVol);
          
          const lsMusic = localStorage.getItem('peyvchin_bg_music_volume');
          const musicVol = inv.settings?.bg_music_volume ?? (lsMusic !== null ? Number(lsMusic) : 30);
          setBgMusicVolume(musicVol);

          // Forward initial settings to the audio engine immediately
          import('../utils/audio').then(m => {
            m.setSfxVolume(sfxVol / 100);
            m.setBackgroundMusicVolume(musicVol / 100);
          });
          
          // Extended Data
          setUserNickname(data.nickname || 'یاریزان');
          setUserAvatar(data.avatar_url || 'default');
          setCity(data.city || '');
          setIsInKurdistan(data.is_kurdistan ?? true);
          setCountryCode(data.country_code || 'IQ');

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
          localStorage.setItem('peyvchin_sfx_volume', (inv.settings?.app_sfx_volume ?? 15).toString());
          localStorage.setItem('peyvchin_bg_music_volume', (inv.settings?.bg_music_volume ?? 6).toString());
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ONLINE HEARTBEAT
  useEffect(() => {
    if (!user) return;
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
    const { user: currentUser } = stateRef.current;
    setCurrentXP(prev => {
      const next = prev + amount;
      localStorage.setItem('peyvchin_xp', next.toString());
      if (currentUser) {
        supabase.from('profiles').update({ xp: next }).eq('id', currentUser.id).then();
      }
      return next;
    });
  }, []);

  // --- STABILIZATION REFS ---
  // We mirror state in refs to allow actions to have [] dependencies
  const stateRef = useRef({ fils, derhem, zer, magnetCount, hintCount, skipCount, user, currentXP, level, inventory });
  useEffect(() => {
    stateRef.current = { fils, derhem, zer, magnetCount, hintCount, skipCount, user, currentXP, level, inventory };
  }, [fils, derhem, zer, magnetCount, hintCount, skipCount, user, currentXP, level, inventory]);

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
    playStartGameSfx(appSoundsEnabled);
  }, [appSoundsEnabled]);
  
  const startSearchingSound = useCallback(() => {
    startSearchingSfx();
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
    const { user: currentUser, inventory: currentInv } = stateRef.current;
    if (currentUser) {
      const updatedInv = { 
        ...(currentInv || {}), 
        settings: { ...(currentInv?.settings || {}), bg_music_volume: val } 
      };
      setInventory(updatedInv);
      supabase.from('profiles').update({ 
        inventory: updatedInv,
        updated_at: new Date().toISOString() 
      }).eq('id', currentUser.id).then();
    }
  }, []);

  const updateSfxVolume = useCallback((val) => {
    setAppSfxVolume(val);
    localStorage.setItem('peyvchin_sfx_volume', val.toString());
    import('../utils/audio').then(m => m.setSfxVolume(val / 100));
    
    // Also sync to Supabase if user is logged in
    const { user: currentUser, inventory: currentInv } = stateRef.current;
    if (currentUser) {
      const updatedInv = { 
        ...(currentInv || {}), 
        settings: { ...(currentInv?.settings || {}), app_sfx_volume: val } 
      };
      setInventory(updatedInv);
      supabase.from('profiles').update({ 
        inventory: updatedInv,
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
      zer: currZer, 
      magnetCount: currMags, 
      hintCount: currHints, 
      skipCount: currSkips 
    } = stateRef.current;

    // Local results to ensure what we set in state matches what we send to DB
    const nextValues = {
      shayi: updates.fils !== undefined ? calculateNext(currFils, updates.fils, isAdditive) : undefined,
      dirham: updates.derhem !== undefined ? calculateNext(currDerhem, updates.derhem, isAdditive) : undefined,
      dinar: updates.zer !== undefined ? calculateNext(currZer, updates.zer, isAdditive) : undefined,
      magnets: updates.magnetCount !== undefined ? calculateNext(currMags, updates.magnetCount, isAdditive) : undefined,
      hints: updates.hintCount !== undefined ? calculateNext(currHints, updates.hintCount, isAdditive) : undefined,
      skips: updates.skipCount !== undefined ? calculateNext(currSkips, updates.skipCount, isAdditive) : undefined
    };

    // 3. Perform state updates
    if (nextValues.shayi !== undefined) setFils(nextValues.shayi);
    if (nextValues.dirham !== undefined) setDerhem(nextValues.dirham);
    if (nextValues.dinar !== undefined) setZer(nextValues.dinar);
    if (nextValues.magnets !== undefined) setMagnetCount(nextValues.magnets);
    if (nextValues.hints !== undefined) setHintCount(nextValues.hints);
    if (nextValues.skips !== undefined) setSkipCount(nextValues.skips);

    // 4. Persistent Local Storage Sync
    Object.entries(updates).forEach(([key, val]) => {
      const storageKey = key === 'magnetCount' ? 'peyvchin_magnets' : key === 'hintCount' ? 'peyvchin_hints' : key === 'skipCount' ? 'peyvchin_skips' : `peyvchin_${key}`;
      const fallback = key === 'fils' ? 250 : key === 'derhem' ? 50 : key === 'zer' ? 5 : key === 'magnetCount' ? 1 : key === 'hintCount' ? 2 : 1;
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
  const syncProgressToDatabase = useCallback(async (lettersCount, gameMode, additionalData = {}) => {
    // USE REFS TO AVOID STALE CLOSURES (Critical for Async Saving)
    const { 
      user: currentUser, 
      currentXP: currXP, 
      level: currLevel, 
      inventory: currInv,
      derhem: currDerhem,
      magnetCount: currMags,
      hintCount: currHints,
      skipCount: currSkips
    } = stateRef.current;

    if (!currentUser?.id) return null;

    try {
      // 1. Update XP and Shayi (Fils) via RPC in Database
      const shayiBonus = Number(additionalData.shayiBonus || 5);
      
      const { data, error } = await supabase.rpc('handle_game_xp', {
        p_user_id: currentUser.id,
        p_letters_count: lettersCount,
        p_shayi_bonus: shayiBonus
      });

      if (error) throw error;

      if (data) {
        const { new_level, xp_added, current_streak } = data;
        const finalXP = (currXP || 0) + xp_added;

        // 2. Prepare Profile Updates (Inventory, Progress)
        const profileUpdates = { 
          updated_at: new Date().toISOString(),
          magnets: currMags,
          hints: currHints,
          skips: currSkips
        };
        
        // Add Derhem sync if bonus provided
        if (additionalData.derhemBonus) {
          profileUpdates.dirham = Number(currDerhem || 0) + additionalData.derhemBonus;
        }

        if (additionalData.solvedWords) {
          profileUpdates.inventory = { ...currInv, solved_words: additionalData.solvedWords };
        }
        if (additionalData.winsTowardsSecret !== undefined) {
          profileUpdates.wins_towards_secret = additionalData.winsTowardsSecret;
        }
        if (additionalData.resetSecretProgress) {
          profileUpdates.wins_towards_secret = 0;
        }

        // Save progress fields to Supabase
        await supabase.from('profiles').update(profileUpdates).eq('id', currentUser.id);

        // 3. Update Local UI State (Instant Feedback)
        setCurrentXP(finalXP);
        setDailyStreak(current_streak);
        
        // Sync the coin reward locally
        if (shayiBonus > 0) {
          setFils(prev => Number(prev) + shayiBonus);
        }

        if (additionalData.derhemBonus) {
          setDerhem(prev => Number(prev) + additionalData.derhemBonus);
        }

        if (additionalData.solvedWords) setSolvedWords(additionalData.solvedWords);
        if (additionalData.winsTowardsSecret !== undefined) setWinsTowardsSecret(additionalData.winsTowardsSecret);
        if (additionalData.resetSecretProgress) setWinsTowardsSecret(0);
        
        if (new_level > currLevel) {
          setLevel(new_level);
          refreshRank(finalXP);
        } else {
          refreshRank(finalXP);
        }

        return {
          xpAdded: xp_added,
          currentStreak: current_streak,
          newLevel: new_level,
          bahdiniMsg: current_streak > 1 ? `ستریکێن تە: ${current_streak} ڕۆژ 🔥` : `دەستپێکرنەکا باشە! ✨`
        };
      }
    } catch (err) {
      console.error("XP Sync Failed:", err.message);
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
    const todayStr = now.toISOString().split('T')[0];
    const lastClaimDate = lastClaimed ? new Date(lastClaimed).toISOString().split('T')[0] : null;

    if (lastClaimDate === todayStr) {
      return { success: false, error: "Te xەlatێ خۆ یێ ئەڤرۆ وەرگرتییە" }; // Already claimed today
    }

    // Determine next streak
    let nextStreak = 1;
    if (lastClaimDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastClaimDate === yesterdayStr) {
        nextStreak = (currRewardStreak % 7) + 1;
      }
    }

    // Reward Logic
    const rewards = {
      1: { fils: 100 },
      2: { magnetCount: 1 },
      3: { derhem: 5 },
      4: { hintCount: 1 },
      5: { zer: 5 },
      6: { skipCount: 1 },
      7: { fils: 2000, magnetCount: 1, hintCount: 1, skipCount: 1 }
    };

    const currentReward = rewards[nextStreak];
    
    // Update State & DB
    try {
      setRewardStreak(nextStreak);
      setLastRewardClaimedAt(now.toISOString());
      
      // Update Inventory
      updateInventory(currentReward);
      
      // Sync to DB
      await supabase.from('profiles').update({
        reward_streak: nextStreak,
        last_reward_claimed_at: now.toISOString(),
        updated_at: now.toISOString()
      }).eq('id', currentUser.id);

      return { success: true, streak: nextStreak, reward: currentReward };
    } catch (err) {
      console.error("Daily Reward Claim Failed:", err);
      return { success: false, error: "ئاریشەیەک د داتابەیسێ دا ھەبوو" };
    }
  }, [updateInventory]);

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
    if (profileData.app_sounds_enabled !== undefined) dbUpdates.app_sounds_enabled = profileData.app_sounds_enabled;
    if (profileData.haptic_enabled !== undefined) dbUpdates.haptic_enabled = profileData.haptic_enabled;
    
    let nextInventory = { ...currInv };
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
      // Ignore
      return false;
    }
  }, []);

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
    currentXP, maxXP, minXPForLevel, fils, derhem, zer, addXP,
    dailyStreak, setDailyStreak,
    rewardStreak, lastRewardClaimedAt, claimDailyReward,
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
    setLevel, setCurrentXP,
    lastNotifiedLevel, setLastNotifiedLevel,
    loading 
  }), [
    level, winsTowardsSecret, currentXP, maxXP, minXPForLevel, fils, derhem, zer, 
    dailyStreak, rewardStreak, lastRewardClaimedAt, claimDailyReward,
    inventory, magnetCount, hintCount, skipCount, 
    ownedAvatars, userAvatar, unlockedThemes, currentTheme, solvedWords, playerStats,
    userNickname, city, isInKurdistan, countryCode, userRank, user, loading,
    appSoundsEnabled, hapticEnabled, lastNotifiedLevel,
    incrementSecretWordProgress, resetSecretWordProgress, addXP, updateInventory,
    updateProfile, processLevelCompletion, syncProgressToDatabase, getLevelFromXP,
    getLevelData, handleToggleBlock, checkBlockStatus, refreshRank, setUser,
    setFils, setDerhem, setZer, setMagnetCount, setHintCount, setSkipCount,
    setHapticEnabled, playPopSound, playNotifSound,
    appSfxVolume, updateSfxVolume,
    playMessageSound, playVictorySound, playRewardSound, playPurchaseSound, playBoosterSound,
    playSettingsOpenSound, playSettingsCloseSound,
    playAlertSound, playBackSound, playSaveSound, playBubblePopSound,
    startSearchingSound, stopSearchingSound,
    startBGM, stopBGM,
    playTabSound,
    playStartGameSound,
    setLevel, setCurrentXP, setLastNotifiedLevel,
    bgMusicVolume, updateMusicVolume
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
