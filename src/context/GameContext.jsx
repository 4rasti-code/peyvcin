/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from './AuthContext';
import { useAudio } from './AudioContext';
import { getLevelFromXP, getLevelData, getRewardForMode } from '../utils/progression';
import { getLocalDateString } from '../utils/formatters';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const { user, loadingAuth, isProfileLoaded, syncProfile, profileData } = useUser();
  const { refreshProfile } = { refreshProfile: syncProfile }; // Compatibility shim if needed

  const [lastNotifiedLevel, setLastNotifiedLevel] = useState(1);
  const [winsTowardsSecret, setWinsTowardsSecret] = useState(0);
  const [currentXP, setCurrentXP] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [rewardStreak, setRewardStreak] = useState(0);
  const [lastRewardClaimedAt, setLastRewardClaimedAt] = useState(null);
  const [_userRank, setUserRank] = useState(1);
  const [inventory, setInventory] = useState({ badges: [] });
  const [loading, setLoading] = useState(true);

  const levelData = useMemo(() => getLevelData(currentXP), [currentXP]);
  const level = levelData.level;
  const minXPForLevel = levelData.currentLevelBase;
  const maxXP = levelData.nextLevelBase;
  
  // Track initialization
  useEffect(() => {
    if (!loadingAuth) {
      console.log("[GameContext] Auth ready, finalizing game state...");
      
      // If we have profile data, apply it to local states
      if (profileData) {
        console.log("[GameContext] Applying profile progression...");
        setCurrentXP(profileData.xp || 0);
        setLastNotifiedLevel(profileData.last_notified_level || 1);
        setFils(profileData.fils ?? 1000);
        setDerhem(profileData.derhem ?? 50);
        setDinar(profileData.dinar ?? 5);
        setMagnetCount(profileData.magnets ?? 3);
        setHintCount(profileData.hints ?? 5);
        setSkipCount(profileData.skips ?? 2);
        setDailyStreak(profileData.daily_streak || 0);
        setRewardStreak(profileData.reward_streak || 0);
        setLastRewardClaimedAt(profileData.last_reward_claimed_at);
        setWinsTowardsSecret(profileData.wins_towards_secret || 0);
        if (profileData.inventory) setInventory(profileData.inventory);
      }
      
      setLoading(false);
      console.log("[GameContext] Ready!");
    }
  }, [loadingAuth, profileData]);

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
  const lastRefreshTime = useRef(0);
  const lastXPRef = useRef(-1);

  const gameStateRef = useRef({ 
    user, fils, derhem, dinar, magnetCount, hintCount, skipCount, 
    currentXP, level, inventory,
    dailyStreak, rewardStreak, lastRewardClaimedAt, winsTowardsSecret
  });

  useEffect(() => {
    gameStateRef.current = { 
      user, fils, derhem, dinar, magnetCount, hintCount, skipCount, 
      currentXP, level, inventory,
      dailyStreak, rewardStreak, lastRewardClaimedAt, winsTowardsSecret
    };
  }, [
    user, fils, derhem, dinar, magnetCount, hintCount, skipCount, 
    currentXP, level, inventory,
    dailyStreak, rewardStreak, lastRewardClaimedAt, winsTowardsSecret
  ]);

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

  useEffect(() => {
    const syncLevelToDB = async () => {
      if (currentXP === dbSyncRef.current.lastSyncedXP) return;
      const calculatedLevel = getLevelFromXP(currentXP);
      
      localStorage.setItem('peyvchin_xp', currentXP.toString());
      localStorage.setItem('peyvchin_level', calculatedLevel.toString());
      
      if (!user?.id || !isProfileLoaded.current || currentXP === 0) {
        dbSyncRef.current = { lastSyncedXP: currentXP, lastSyncedLevel: calculatedLevel };
        return;
      }

      try {
        await supabase.rpc('sync_profile_progression', { 
          p_xp: currentXP, 
          p_level: calculatedLevel
        });
        dbSyncRef.current = { lastSyncedXP: currentXP, lastSyncedLevel: calculatedLevel };
        refreshRank(currentXP);
      } catch (err) { console.warn("[GameContext] Auto-Sync failed:", err); }
    };
    const timeout = setTimeout(syncLevelToDB, 1000);
    return () => clearTimeout(timeout);
  }, [currentXP, user?.id, isProfileLoaded, refreshRank]);

  // Heartbeat is handled by secure RPCs on every action, so manual update is removed to avoid RLS/Trigger conflicts.

  const updateInventory = useCallback(async (updates, isAdditive = true, syncToDB = true) => {
    const calculateNext = (current, offset, additive) => additive ? (current + offset) : offset;
    const { user: currentUser, fils: currFils, derhem: currDerhem, dinar: currDinar, magnetCount: currMags, hintCount: currHints, skipCount: currSkips } = gameStateRef.current;
    
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

    if (currentUser && syncToDB) {
      try { 
        await supabase.rpc('sync_profile_inventory', {
          p_magnets: nextValues.magnets,
          p_hints: nextValues.hints,
          p_skips: nextValues.skips,
          p_fils: nextValues.fils,
          p_derhem: nextValues.derhem,
          p_dinar: nextValues.dinar
        }); 
      }
      catch (err) { console.warn("DB Inventory Sync Failed:", err); }
    }
  }, []);

  const processPurchase = useCallback(async (item) => {
    const { user: currentUser } = gameStateRef.current;
    if (!currentUser) return { success: false, error: "Must be logged in" };

    try {
      // 1. Pre-sync to ensure local state is parity with DB before transaction
      await syncProfile(currentUser.id);
      
      // 2. Execute atomic transaction
      const { data, error } = await supabase.rpc('process_purchase', {
        p_item_id: item.id,
        p_item_type: item.type || (item.price_usd ? 'currency' : 'powerup'),
        p_currency_used: item.currency || 'fils',
        p_price: item.price || 0,
        p_amount: item.amount || 0
      });

      if (error) throw error;
      
      // 3. Post-sync to get new balances immediately
      await syncProfile(currentUser.id);
      return { success: true };
    } catch (err) {
      console.error("Purchase failed:", err.message);
      return { success: false, error: err.message };
    }
  }, [syncProfile]);

  const syncProgressToDatabase = useCallback(async (lettersCount, mode = 'classic', additionalData = {}) => {
    const { user: currentUser, currentXP: currXP } = gameStateRef.current;
    const currentAward = getRewardForMode(mode);
    const xpToAdd = currentAward.xp;
    const newLocalXP = Number(currXP) + xpToAdd;

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

  const incrementSecretWordProgress = useCallback(async () => {
    const { user: currentUser } = gameStateRef.current;
    setWinsTowardsSecret(prev => {
      const next = Math.min(3, prev + 1);
      localStorage.setItem('peyvchin_wins_towards_secret', next.toString());
      if (currentUser) supabase.from('profiles').update({ wins_towards_secret: next }).eq('id', currentUser.id).then();
      return next;
    });
  }, []);

  const resetSecretWordProgress = useCallback(async () => {
    const { user: currentUser } = gameStateRef.current;
    setWinsTowardsSecret(0);
    localStorage.setItem('peyvchin_wins_towards_secret', '0');
    if (currentUser) await supabase.from('profiles').update({ wins_towards_secret: 0 }).eq('id', currentUser.id);
  }, []);

  const [isClaimingReward, setIsClaimingReward] = useState(false);

  const claimDailyReward = useCallback(async () => {
    if (!user || isClaimingReward) return { error: 'Action in progress or login required' };
    
    setIsClaimingReward(true);
    console.log('[GameContext] Triggering secure RPC claim...');
    
    try {
      const { data, error } = await supabase.rpc('claim_daily_reward');
      
      if (error) {
        console.error('[GameContext] RPC Error:', error);
        return { error: error.message };
      }

      if (data && data.success) {
        // Atomic local state sync
        if (data.rewards) {
          setFils(prev => prev + (data.rewards.fils || 0));
          setDerhem(prev => prev + (data.rewards.derhem || 0));
          setDinar(prev => prev + (data.rewards.dinar || 0));
          setMagnetCount(prev => prev + (data.rewards.magnets || 0));
          setHintCount(prev => prev + (data.rewards.hints || 0));
          setSkipCount(prev => prev + (data.rewards.skips || 0));
        }
        
        setRewardStreak(data.streak);
        setLastRewardClaimedAt(new Date().toISOString());
        
        await syncProfile();
        return { success: true, rewards: data.rewards, streak: data.streak };
      }

      return { success: false, error: data?.message || "Claim failed" };
    } catch (err) { 
      console.error("[GameContext] Fatal Claim Error:", err); 
      return { success: false, error: "ئاریشەیەک د سێرڤەری دا ھەبوو" }; 
    } finally {
      setIsClaimingReward(false);
    }
  }, [user, syncProfile, isClaimingReward]);

  const value = useMemo(() => ({
    level, currentXP, maxXP, minXPForLevel, fils, derhem, dinar, addXP,
    dailyStreak, setDailyStreak, rewardStreak, lastRewardClaimedAt, claimDailyReward,
    inventory, magnetCount, hintCount, skipCount,
    solvedWords, playerStats, winsTowardsSecret, incrementSecretWordProgress, resetSecretWordProgress,
    userRank: _userRank, updateInventory, setCurrentXP, setLastNotifiedLevel,
    syncProgressToDatabase, getLevelData, progressPercent: getLevelData(currentXP).progressPercent,
    getFreshWord: async (mode, category) => {
      const { user: currentUser } = gameStateRef.current;
      if (currentUser?.id) {
        try {
          const { data, error } = await supabase.rpc('get_random_fresh_word', {
            p_user_id: currentUser.id,
            p_mode_tag: mode === 'classic' ? 'classic' : (mode === 'hard_words' ? 'hard_words' : (mode === 'mamak' ? 'mamak' : mode)),
            p_category: (category && category !== 'ھەموو') ? category : null
          });
          if (error) throw error;
          if (data && data.length > 0) return { word: data[0].word, hint: data[0].hint, category: data[0].category, id: data[0].id };
        } catch (err) { console.warn("[GameContext] Failed to fetch fresh word from DB, falling back to local:", err); }
      }
      const { level: currLevel, solvedWords: sWords } = gameStateRef.current;
      const { getRandomWordFromCategory } = await import('../data/wordList');
      return getRandomWordFromCategory(category, currLevel, sWords, mode);
    },
    refreshRank,
    getLevelData,
    processPurchase,
    loading
  }), [
    level, currentXP, maxXP, minXPForLevel, fils, derhem, dinar, addXP,
    dailyStreak, rewardStreak, lastRewardClaimedAt, claimDailyReward,
    inventory, magnetCount, hintCount, skipCount, solvedWords, playerStats,
    winsTowardsSecret, incrementSecretWordProgress, resetSecretWordProgress, _userRank,
    updateInventory, syncProgressToDatabase, processPurchase, refreshRank, loading
  ]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
