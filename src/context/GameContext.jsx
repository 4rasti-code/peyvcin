/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from './AuthContext';
import { getLevelFromXP, getLevelData, getRewardForMode } from '../utils/progression';
import { safeJSONParse } from '../utils/safeParse';
import { allWordsMaster } from '../data/wordList';
import { MEDALS } from '../constants/medals';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const { user, loadingAuth, syncProfile, profileData } = useUser();

  const [lastNotifiedLevel, setLastNotifiedLevel] = useState(1);

  
  // INITIALIZATION: Priority to localStorage to prevent "Zero-Reset" on re-renders
  const [currentXP, setCurrentXP] = useState(() => {
    const saved = localStorage.getItem('peyvchin_xp');
    return saved ? Number(saved) : 0;
  });

  const [lastStreakAt, setLastStreakAt] = useState(null);
  const [dailyStreak, setDailyStreak] = useState(() => {
    const saved = localStorage.getItem('peyvchin_daily_streak');
    return saved ? Number(saved) : 0;
  });
  const [rewardStreak, setRewardStreak] = useState(0);
  const [lastRewardClaimedAt, setLastRewardClaimedAt] = useState(null);
  const [_userRank, setUserRank] = useState(1);
  const [inventory, setInventory] = useState({ badges: [] });
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('');
  const claimRef = useRef(false);

  const [claimedMedals, setClaimedMedals] = useState(() => {
    const saved = localStorage.getItem('peyvchin_claimed_medals');
    return safeJSONParse(saved, [], 'peyvchin_claimed_medals');
  });

  // Standardized Level Math (Hardcore Hybrid Infinite System)
  const { level, progressPercent, currentLevelBase, nextLevelBase } = useMemo(() => getLevelData(currentXP), [currentXP]);
  const minXPForLevel = currentLevelBase;
  const maxXP = nextLevelBase;
  
  const lastAppliedProfileRef = useRef(null);


  const getInitial = (key, fallback) => {
    const saved = localStorage.getItem(key);
    return (saved !== null) ? Number(saved) : fallback;
  };

  const [fils, setFils] = useState(() => getInitial('peyvchin_fils', 500));
  const [derhem, setDerhem] = useState(() => getInitial('peyvchin_derhem', 10));
  const [dinar, setDinar] = useState(() => getInitial('peyvchin_dinar', 5));
  const [magnetCount, setMagnetCount] = useState(() => getInitial('peyvchin_magnets', 3));
  const [hintCount, setHintCount] = useState(() => getInitial('peyvchin_hints', 3));
  const [skipCount, setSkipCount] = useState(() => getInitial('peyvchin_skips', 3));
  const [spinTicketCount, setSpinTicketCount] = useState(() => getInitial('peyvchin_spin_tickets', 0));

  const [solvedWords, setSolvedWords] = useState(() => {
    const saved = localStorage.getItem('peyvchin_solved_words');
    return safeJSONParse(saved, [], 'peyvchin_solved_words');
  });
  
  const [playerStats, setPlayerStats] = useState(() => {
    const saved = localStorage.getItem('peyvchin_stats');
    const defaultStats = {
      classic: { score: 0, bestScore: 0, totalXP: 0, solvedCount: 0, guess_distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0 } },
      mamak: { score: 0, bestScore: 0, totalXP: 0, solvedCount: 0, guess_distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0 } },
      word_fever: { score: 0, bestScore: 0, totalXP: 0, solvedCount: 0, guess_distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0 } },
      hard_words: { score: 0, bestScore: 0, totalXP: 0, solvedCount: 0, guess_distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0 } },
      battle: { score: 0, bestScore: 0, totalXP: 0, solvedCount: 0, guess_distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0 } }
    };
    return safeJSONParse(saved, defaultStats, 'peyvchin_stats');
  });

  const isSyncingProgressionRef = useRef(false);
  const lastRefreshTime = useRef(0);
  const lastXPRef = useRef(-1);
  const sessionGuardRef = useRef(new Set()); // To prevent double submission in same session

  const gameStateRef = useRef({ 
    user, fils, derhem, dinar, magnetCount, hintCount, skipCount, spinTicketCount,
    currentXP, level, inventory,
    dailyStreak, rewardStreak, lastRewardClaimedAt, lastStreakAt,
    playerStats, solvedWords, claimedMedals
  });

  useEffect(() => {
    gameStateRef.current = { 
      user, fils, derhem, dinar, magnetCount, hintCount, skipCount, spinTicketCount,
      currentXP, level, inventory,
      dailyStreak, rewardStreak, lastRewardClaimedAt,
      playerStats, solvedWords, claimedMedals
    };
  }, [
    user, fils, derhem, dinar, magnetCount, hintCount, skipCount, spinTicketCount,
    currentXP, level, inventory,
    dailyStreak, rewardStreak, lastRewardClaimedAt,
    playerStats, solvedWords, claimedMedals
  ]);

  // Sync statistics from profileData when it loads
  useEffect(() => {
    const serverStats = profileData?.statistics || profileData?.inventory?.stats;
    if (serverStats) {
      setPlayerStats(prev => {
        const merged = { ...prev };
        let hasChanged = false;

        Object.entries(serverStats).forEach(([mode, sData]) => {
          const pData = prev[mode] || {};
          
          // Deep merge the mode data
          const mergedMode = {
            ...pData,
            ...sData,
            // Preserve/Merge guess_distribution
            guess_distribution: sData.guess_distribution || pData.guess_distribution || { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0 }
          };

          if (JSON.stringify(pData) !== JSON.stringify(mergedMode)) {
            merged[mode] = mergedMode;
            hasChanged = true;
          }
        });

        if (hasChanged) {
          localStorage.setItem('peyvchin_stats', JSON.stringify(merged));
          return merged;
        }
        return prev;
      });
    }
  }, [profileData]);

  const refreshRank = useCallback(async (xpValue, force = false, signal = null) => {
    const val = xpValue !== undefined ? xpValue : gameStateRef.current.currentXP;
    const now = Date.now();
    if (!force && val === lastXPRef.current && (now - lastRefreshTime.current < 2000)) return;
    try {
      lastRefreshTime.current = now;
      lastXPRef.current = val;
      
      // 1. Get count of players with strictly more XP
      let query = supabase.from('profiles').select('id', { count: 'exact', head: true }).gt('xp', val).neq('nickname', 'Admin_4rasti').neq('nickname', 'ADMIN_PEYVOK').neq('nickname', 'پەیڤۆک').neq('id', '9a813c24-b662-477d-a74a-6f822d17bbf1');
      if (signal) query = query.abortSignal(signal);
      const { count, error } = await query;
      
      let finalRank = (count || 0) + 1;

      // 2. Tie-breaker: Count players with identical XP who registered/updated earlier
      const currentUserId = gameStateRef.current.user?.id;
      if (currentUserId && !error) {
         const { data: myProfile } = await supabase.from('profiles').select('updated_at').eq('id', currentUserId).single();
         if (myProfile?.updated_at) {
            const { count: tieCount } = await supabase.from('profiles').select('id', { count: 'exact', head: true })
               .eq('xp', val)
               .lt('updated_at', myProfile.updated_at)
               .neq('nickname', 'Admin_4rasti').neq('nickname', 'ADMIN_PEYVOK').neq('nickname', 'پەیڤۆک').neq('id', '9a813c24-b662-477d-a74a-6f822d17bbf1');
            finalRank += (tieCount || 0);
         }
      }

      if (!error) setUserRank(finalRank);
    } catch (err) { 
      const isAbort = err.name === 'AbortError' || 
                      err.message?.includes('AbortError') || 
                      err.code === '20' || 
                      err.code === 'ABORT_ERR';
      if (isAbort) return;
      console.warn("Rank refresh failed:", err); 
    }
  }, []); // Stable: uses refs for values

  // Aggressive loading lock: prevent gaps between AuthContext sync and GameContext sync
  useEffect(() => {
    if (user && !profileData) {
      setLoading(true);
      setSyncStatus('هێنان و پشکنینا پرۆفایلێ...');
    }
  }, [user, profileData]);

  // Track initialization: Moved below refreshRank to avoid TDZ (Temporal Dead Zone) error
  useEffect(() => {
    const controller = new AbortController();
    
    const applyProfileData = async () => {
      if (!loadingAuth && profileData) {
        // If we have profile data, apply it to local states ONLY IF it changed meaningfully
        const profileSignature = `${profileData.xp}-${profileData.fils}-${profileData.derhem}-${profileData.dinar}-${profileData.magnets}-${profileData.hints}-${profileData.skips}`;
        
        if (profileSignature !== lastAppliedProfileRef.current) {
          console.log("[GameContext] Applying profile progression sync...");
          lastAppliedProfileRef.current = profileSignature;
          
          // Silently sync without blocking UI
          setSyncStatus('سینککرنا داتایێن یاریزانان...');
          
          // Safety: If local XP is greater than remote XP, force a sync to prevent data loss.
          // Otherwise, only apply the remote XP if it's higher than the local XP.
          const remoteXP = Number(profileData.xp || 0);
          setCurrentXP(prev => {
            if (prev > remoteXP) {
              console.log(`[GameContext] Local XP (${prev}) > Remote XP (${remoteXP}). Triggering force sync.`);
              supabase.rpc('merge_profile_progress', {
                p_xp: prev,
                p_fils: getInitial('peyvchin_fils', 500),
                p_derhem: getInitial('peyvchin_derhem', 10),
                p_dinar: getInitial('peyvchin_dinar', 5)
              }).then(({error}) => {
                 if(error) console.error("Force sync failed:", error);
                 else console.log("Force sync successful.");
              });
              return prev;
            }
            return (prev === 0 || remoteXP > prev) ? remoteXP : prev;
          });
          
          const serverNotifiedLevel = profileData.last_notified_level;
          const currentLevelFromXP = getLevelFromXP(remoteXP);
          setLastNotifiedLevel(prev => {
            if (serverNotifiedLevel !== undefined) return Math.max(prev, serverNotifiedLevel);
            // If no server record, initialize to current level to prevent "catch-up" spam
            return Math.max(prev, currentLevelFromXP);
          });
          setFils(prev => {
            const next = profileData.fils ?? 500;
            return prev !== next ? next : prev;
          });
          setDerhem(prev => {
            const next = profileData.derhem ?? 10;
            return prev !== next ? next : prev;
          });
          setDinar(prev => {
            const next = profileData.dinar ?? 5;
            return prev !== next ? next : prev;
          });
          setMagnetCount(prev => prev !== (profileData.magnets ?? 3) ? (profileData.magnets ?? 3) : prev);
          setHintCount(prev => prev !== (profileData.hints ?? 3) ? (profileData.hints ?? 3) : prev);
          setSkipCount(prev => prev !== (profileData.skips ?? 3) ? (profileData.skips ?? 3) : prev);
          // Fallback reading from old JSON inventory in case the new column hasn't been populated yet
          if (profileData.spin_tickets !== undefined && profileData.spin_tickets !== null) {
            setSpinTicketCount(prev => prev !== profileData.spin_tickets ? profileData.spin_tickets : prev);
          } else if (profileData.inventory?.spinTickets !== undefined) {
            setSpinTicketCount(prev => prev !== profileData.inventory.spinTickets ? profileData.inventory.spinTickets : prev);
          }
          setDailyStreak(prev => prev !== (profileData.daily_streak || 0) ? (profileData.daily_streak || 0) : prev);
          setLastStreakAt(prev => prev !== profileData.last_streak_at ? profileData.last_streak_at : prev);
          setRewardStreak(prev => prev !== (profileData.reward_streak || 0) ? (profileData.reward_streak || 0) : prev);
          setLastRewardClaimedAt(prev => prev !== profileData.last_reward_claimed_at ? profileData.last_reward_claimed_at : prev);
          
          // --- CONSOLIDATED SOLVED WORDS SYNC (MERGE STRATEGY) ---
          const remoteWords = Array.isArray(profileData.solved_words) ? profileData.solved_words : [];
          
          let inventoryWords = [];
          if (profileData.inventory?.solved_words) {
            if (Array.isArray(profileData.inventory.solved_words)) {
              inventoryWords = profileData.inventory.solved_words;
            } else if (typeof profileData.inventory.solved_words === 'string') {
              try { inventoryWords = JSON.parse(profileData.inventory.solved_words); } catch (_e) { /* ignore */ }
            }
          }
          
          setSolvedWords(prev => {
            const local = Array.isArray(prev) ? prev : [];
            // Merge local, remote, and inventory words to prevent any data loss
            const merged = [...new Set([...local, ...remoteWords, ...inventoryWords])];
            
            if (JSON.stringify(local) !== JSON.stringify(merged)) {
              localStorage.setItem('peyvchin_solved_words', JSON.stringify(merged));
            }
            
            // --- AUTO-MIGRATE LEGACY STATS TO NEW COLUMNS ---
            const legacyStats = profileData.inventory?.stats;
            if (legacyStats) {
              let legacyGamesWon = 0;
              let legacyGamesPlayed = 0;
              let legacyFeverHigh = legacyStats.word_fever?.bestScore || 0;
              
              Object.values(legacyStats).forEach(m => {
                legacyGamesWon += (Number(m.solvedCount) || 0);
                legacyGamesPlayed += (Number(m.playedCount) || Number(m.solvedCount) || 0);
              });

              // If legacy stats have significantly more wins than the new columns, trigger rescue
              if (legacyGamesWon > (profileData.games_won || 0) + 5) {
                 console.log("[GameContext] 🚨 MIGRATING LEGACY STATS to top-level columns!");
                 const realGamesPlayed = Math.max(legacyGamesPlayed, legacyGamesWon, profileData.games_played || 0);
                 const realGamesWon = Math.max(legacyGamesWon, profileData.games_won || 0);
                 const maxWords = Math.max(merged.length, profileData.total_words_found || 0, realGamesWon);
                 const legacyPvpWins = legacyStats.battle?.solvedCount || 0;
                 
                 let finalWordsToSave = merged;
                 
                 // --- AUTO-FILL DICTIONARY RESCUE ---
                 // If they won more games than they have words (due to past data wipe), 
                 // randomly inject valid words so their dictionary matches their stats.
                 if (maxWords > merged.length) {
                   console.log(`[GameContext] 🚨 Auto-filling dictionary. Missing ${maxWords - merged.length} words.`);
                   const missingCount = maxWords - merged.length;
                   const availableWords = allWordsMaster.map(item => item.word).filter(w => !merged.includes(w));
                   const randomlySelected = availableWords.sort(() => 0.5 - Math.random()).slice(0, missingCount);
                   finalWordsToSave = [...merged, ...randomlySelected];
                   setSolvedWords(finalWordsToSave);
                   localStorage.setItem('peyvchin_solved_words', JSON.stringify(finalWordsToSave));
                 }

                 supabase.from('profiles').update({
                   games_played: realGamesPlayed,
                   games_won: realGamesWon,
                   pvp_wins: Math.max(profileData.pvp_wins || 0, legacyPvpWins),
                   total_words_found: maxWords,
                   fever_highscore: Math.max(legacyFeverHigh, profileData.fever_highscore || 0),
                   solved_words: finalWordsToSave,
                   statistics: legacyStats
                 }).eq('id', user.id).then(({error}) => {
                   if(error) console.error("Legacy migration failed:", error);
                   else console.log("Legacy migration successful.");
                 });
              }
            }
            
            return merged;
          });
          
          if (profileData.inventory) {
            setInventory(prev => JSON.stringify(prev) !== JSON.stringify(profileData.inventory) ? profileData.inventory : prev);
          }
  
          const remoteMedals = Array.isArray(profileData.claimed_medals) ? profileData.claimed_medals : [];
          setClaimedMedals(prev => {
            const local = Array.isArray(prev) ? prev : [];
            const merged = [...new Set([...local, ...remoteMedals])];
            if (JSON.stringify(local) !== JSON.stringify(merged)) {
              localStorage.setItem('peyvchin_claimed_medals', JSON.stringify(merged));
              return merged;
            }
            return prev;
          });
          
          setSyncStatus('پشکنینا ڕیزبەندییا تە...');
          // Run rank calculation in background so it doesn't freeze the loading screen
          refreshRank(remoteXP, true, controller.signal);
        }
        
        setSyncStatus('کۆتایی پێئینان...');
        setLoading(false);
      } else if (!loadingAuth && !profileData) {
        setLoading(false);
      }
    };

    applyProfileData();

    return () => controller.abort();
  }, [loadingAuth, profileData, refreshRank, user]);

  // REAL-TIME SUBSCRIPTION: Listen for profile changes from Supabase (HARDENED)
  useEffect(() => {
    if (!user?.id) return;

    console.log("[GameContext] Initializing real-time sync for:", user.id);
    const profileChannel = supabase
      .channel(`profile-realtime-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          const data = payload.new;
          console.log("⚡ [GameContext] Real-time profile update detected:", data);
          
          // Atomic updates for immediate UI sync
          if (data.xp !== undefined) {
             setCurrentXP(prev => {
                const next = Math.max(prev, data.xp);
                if (prev !== next) {
                   refreshRank(next, true);
                   return next;
                }
                return prev;
             });
          }
          
          if (data.daily_streak !== undefined) setDailyStreak(prev => prev !== data.daily_streak ? data.daily_streak : prev);
          if (data.fils !== undefined) setFils(prev => prev !== data.fils ? data.fils : prev);
          if (data.derhem !== undefined) setDerhem(prev => prev !== data.derhem ? data.derhem : prev);
          if (data.dinar !== undefined || data.dinars !== undefined) {
             const dValue = data.dinar !== undefined ? data.dinar : data.dinars;
             setDinar(prev => prev !== dValue ? dValue : prev);
          }
          if (data.magnets !== undefined) setMagnetCount(prev => prev !== data.magnets ? data.magnets : prev);
          if (data.hints !== undefined) setHintCount(prev => prev !== data.hints ? data.hints : prev);
          if (data.skips !== undefined) setSkipCount(prev => prev !== data.skips ? data.skips : prev);

          if (data.claimed_medals !== undefined) {
             setClaimedMedals(prev => {
                const local = Array.isArray(prev) ? prev : [];
                const remote = Array.isArray(data.claimed_medals) ? data.claimed_medals : [];
                const merged = [...new Set([...local, ...remote])];
                if (JSON.stringify(local) !== JSON.stringify(merged)) {
                  localStorage.setItem('peyvchin_claimed_medals', JSON.stringify(merged));
                  return merged;
                }
                return prev;
             });
          }

          // Deep merge for inventory/stats
          if (data.inventory) {
             setInventory(data.inventory);
             if (data.spin_tickets !== undefined && data.spin_tickets !== null) setSpinTicketCount(prev => prev !== data.spin_tickets ? data.spin_tickets : prev);
             else if (data.inventory?.spinTickets !== undefined) setSpinTicketCount(prev => prev !== data.inventory.spinTickets ? data.inventory.spinTickets : prev);
             if (data.inventory.stats) {
                setPlayerStats(prev => ({ ...prev, ...data.inventory.stats }));
             }
             if (data.inventory.solved_words) {
                setSolvedWords(prev => {
                  const local = Array.isArray(prev) ? prev : [];
                  const remote = Array.isArray(data.inventory.solved_words) ? data.inventory.solved_words : [];
                  return [...new Set([...local, ...remote])];
                });
             }
          }
        }
      )
      .subscribe((status) => {
         console.log(`[GameContext] Real-time sync status: ${status}`);
      });

    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, [user?.id, refreshRank]);

  // --- AUTO-SYNC REMOVED TO PREVENT INFINITE LOOP ---
  // Progression sync is now EXCLUSIVELY handled by explicit game events (wins) 
  // via the syncProgressToDatabase function. This prevents "ping-pong" loops.

  // Heartbeat is handled by secure RPCs on every action, so manual update is removed to avoid RLS/Trigger conflicts.

  const updateInventory = useCallback(async (updates, isAdditive = true, syncToDB = true) => {
    const calculateNext = (current, offset, additive) => additive ? (current + offset) : offset;
    const { user: currentUser, fils: currFils, derhem: currDerhem, dinar: currDinar, magnetCount: currMags, hintCount: currHints, skipCount: currSkips, spinTicketCount: currSpinTickets } = gameStateRef.current;
    
    const nextValues = {
      fils: updates.fils !== undefined ? calculateNext(currFils, updates.fils, isAdditive) : undefined,
      derhem: updates.derhem !== undefined ? calculateNext(currDerhem, updates.derhem, isAdditive) : undefined,
      dinar: updates.dinar !== undefined ? calculateNext(currDinar, updates.dinar, isAdditive) : undefined,
      magnets: updates.magnetCount !== undefined ? calculateNext(currMags, updates.magnetCount, isAdditive) : undefined,
      hints: updates.hintCount !== undefined ? calculateNext(currHints, updates.hintCount, isAdditive) : undefined,
      skips: updates.skipCount !== undefined ? calculateNext(currSkips, updates.skipCount, isAdditive) : undefined,
      spinTickets: updates.spinTicketCount !== undefined ? calculateNext(currSpinTickets, updates.spinTicketCount, isAdditive) : undefined
    };

    if (nextValues.fils !== undefined) setFils(nextValues.fils);
    if (nextValues.derhem !== undefined) setDerhem(nextValues.derhem);
    if (nextValues.dinar !== undefined) setDinar(nextValues.dinar);
    if (nextValues.magnets !== undefined) setMagnetCount(nextValues.magnets);
    if (nextValues.hints !== undefined) setHintCount(nextValues.hints);
    if (nextValues.skips !== undefined) setSkipCount(nextValues.skips);
    if (nextValues.spinTickets !== undefined) setSpinTicketCount(nextValues.spinTickets);

    Object.entries(updates).forEach(([key, val]) => {
      const storageKey = key === 'magnetCount' ? 'peyvchin_magnets' : key === 'hintCount' ? 'peyvchin_hints' : key === 'skipCount' ? 'peyvchin_skips' : key === 'spinTicketCount' ? 'peyvchin_spin_tickets' : `peyvchin_${key}`;
      const current = getInitial(storageKey, 0);
      localStorage.setItem(storageKey, (isAdditive ? (current + val) : val).toString());
    });

    if (currentUser && syncToDB) {
      try { 
        // Sync standalone spin_tickets column
        if (nextValues.spinTickets !== undefined) {
           await supabase.from('profiles').update({ spin_tickets: nextValues.spinTickets }).eq('id', currentUser.id);
        }

        const { error: rpcError } = await supabase.rpc('sync_profile_inventory', {
          p_magnets: nextValues.magnets,
          p_hints: nextValues.hints,
          p_skips: nextValues.skips,
          p_fils: nextValues.fils,
          p_derhem: nextValues.derhem,
          p_dinar: nextValues.dinar
        }); 
        if (rpcError) throw rpcError;
      }
      catch (err) { 
        console.warn("DB Inventory Sync Failed via RPC, trying direct update:", err); 
        try {
          const payload = {};
          if (nextValues.magnets !== undefined) payload.magnets = nextValues.magnets;
          if (nextValues.hints !== undefined) payload.hints = nextValues.hints;
          if (nextValues.skips !== undefined) payload.skips = nextValues.skips;
          if (nextValues.fils !== undefined) payload.fils = nextValues.fils;
          if (nextValues.derhem !== undefined) payload.derhem = nextValues.derhem;
          if (nextValues.dinar !== undefined) payload.dinar = nextValues.dinar;
          
          if (Object.keys(payload).length > 0) {
            await supabase.from('profiles').update(payload).eq('id', currentUser.id);
          }
          
          // Fallback for standalone spin tickets
          if (nextValues.spinTickets !== undefined) {
             await supabase.from('profiles').update({ spin_tickets: nextValues.spinTickets }).eq('id', currentUser.id);
          }
        } catch (fallbackErr) {
          console.error("Direct fallback update also failed:", fallbackErr);
        }
      }
    }
  }, []);

  const claimMedal = useCallback(async (medalId, rewardAmount = 1000) => {
    // Check locally first to prevent double claim
    const currentMedals = gameStateRef.current.claimedMedals || [];
    if (currentMedals.includes(medalId)) return;
    
    // 1. Optimistic local update
    const next = [...currentMedals, medalId];
    setClaimedMedals(next);
    localStorage.setItem('peyvchin_claimed_medals', JSON.stringify(next));

    // 2. Give reward
    if (rewardAmount && rewardAmount > 0) {
      updateInventory({ fils: rewardAmount }, true, true);
    }

    // 3. Try to sync to DB if user is logged in
    const { user: currentUser } = gameStateRef.current;
    if (currentUser?.id) {
      try {
        const { error } = await supabase.rpc('claim_medal', { p_medal_id: medalId, p_user_id: currentUser.id });
        if (error) {
           console.warn('claim_medal rpc failed, falling back:', error);
           await supabase.from('profiles').update({ claimed_medals: next }).eq('id', currentUser.id);
        }
      } catch (err) {
         // Silently catch missing RPC or network errors without crashing the app
         console.warn('claim_medal rpc error, falling back:', err);
         await supabase.from('profiles').update({ claimed_medals: next }).eq('id', currentUser.id);
      }
    }
  }, [updateInventory]);

  const processPurchase = useCallback(async (item) => {
    const { user: currentUser, fils: currFils, derhem: currDerhem, dinar: currDinar, hintCount: currHints, magnetCount: currMags, skipCount: currSkips } = gameStateRef.current;
    if (!currentUser) return { success: false, error: "Must be logged in" };

    // --- OPTIMISTIC UPDATE START ---
    // Save current values to revert if needed
    const oldValues = { fils: currFils, derhem: currDerhem, dinar: currDinar, hints: currHints, magnets: currMags, skips: currSkips };
    
    const itemType = item.type || (item.price_usd ? 'currency' : 'powerup');
    const currency = item.currency || 'fils';
    const price = item.price || 0;

    // Apply visual deduction immediately
    if (currency === 'fils') setFils(prev => prev - price);
    if (currency === 'derhem') setDerhem(prev => prev - price);
    if (currency === 'dinar') setDinar(prev => prev - price);

    // If it's a powerup, add it immediately to UI
    if (itemType === 'powerup') {
      if (item.id === 'hint_pack') setHintCount(prev => prev + 1);
      if (item.id === 'attractor_field') setMagnetCount(prev => prev + 1);
      if (item.id === 'full_skip') setSkipCount(prev => prev + 1);
    }
    // --- OPTIMISTIC UPDATE END ---

    try {
      // Execute atomic transaction on server
      const { error } = await supabase.rpc('process_purchase', {
        p_item_id: item.id,
        p_item_type: itemType,
        p_currency_used: currency,
        p_price: price,
        p_amount: item.amount || 0
      });

      if (error) throw error;
      
      // Final sync to ensure parity
      await syncProfile(currentUser.id);
      return { success: true };
    } catch (err) {
      console.error("Purchase failed, reverting:", err.message);
      // REVERT on failure
      setFils(oldValues.fils);
      setDerhem(oldValues.derhem);
      setDinar(oldValues.dinar);
      setHintCount(oldValues.hints);
      setMagnetCount(oldValues.magnets);
      setSkipCount(oldValues.skips);
      return { success: false, error: err.message };
    }
  }, [syncProfile]);

  const syncProgressToDatabase = useCallback(async (lettersCount, mode = 'classic', additionalData = {}) => {
    const { user: currentUser, currentXP: currXP, playerStats: currStats } = gameStateRef.current;
    
    // 1. SESSION GUARD: Prevent duplicate submissions for same session ID if provided
    if (additionalData.sessionId) {
      if (sessionGuardRef.current.has(additionalData.sessionId)) {
        console.warn("[GameContext] Duplicate session submission blocked:", additionalData.sessionId);
        return null;
      }
      sessionGuardRef.current.add(additionalData.sessionId);
    }    
    
    const currentAward = getRewardForMode(mode);
    
    // --- ASSISTANCE PENALTY CALCULATION ---
    // Deduct 2 XP for every Hint or Magnet used (Minimum floor 2 XP)
    const hintsUsed = additionalData.hintsUsed || 0;
    const magnetsUsed = additionalData.magnetsUsed || 0;
    const totalAssistance = hintsUsed + magnetsUsed;
    const penaltyXP = totalAssistance * 2;
    
    let xpToAdd = Math.max(2, currentAward.xp - penaltyXP);
    const newLocalXP = Number(currXP) + xpToAdd;

    // --- HYBRID INFINITE LEVEL CALCULATION ---
    const newLevel = getLevelFromXP(newLocalXP);

    // --- UPDATE STATISTICS (LOCAL) ---
    const score = additionalData.score || 0;
    const isWin = additionalData.isWin !== undefined ? additionalData.isWin : true;
    const updatedStats = { ...currStats };
    if (!updatedStats[mode]) {
      updatedStats[mode] = { 
        score: 0, 
        bestScore: 0, 
        totalXP: 0, 
        solvedCount: 0, 
        playedCount: 0,
        current_streak: 0,
        max_streak: 0
      };
    }
    
    updatedStats[mode].playedCount = (updatedStats[mode].playedCount || 0) + 1;
    
    if (isWin) {
      updatedStats[mode].solvedCount = (updatedStats[mode].solvedCount || 0) + 1;
      updatedStats[mode].current_streak = (updatedStats[mode].current_streak || 0) + 1;
      updatedStats[mode].max_streak = Math.max(updatedStats[mode].max_streak || 0, updatedStats[mode].current_streak);
    } else {
      updatedStats[mode].current_streak = 0;
    }

    updatedStats[mode].score = score;
    updatedStats[mode].totalXP = (updatedStats[mode].totalXP || 0) + xpToAdd;
    if (score > (updatedStats[mode].bestScore || 0)) {
      updatedStats[mode].bestScore = score;
    }

    // --- UPDATE GUESS DISTRIBUTION (LOCAL) ---
    if (additionalData.isWin && additionalData.attempts) {
      if (!updatedStats[mode].guess_distribution) {
        updatedStats[mode].guess_distribution = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0 };
      }
      const attemptsKey = additionalData.attempts.toString();
      updatedStats[mode].guess_distribution[attemptsKey] = (updatedStats[mode].guess_distribution[attemptsKey] || 0) + 1;
    }

    setPlayerStats(updatedStats);
    localStorage.setItem('peyvchin_stats', JSON.stringify(updatedStats));

    setCurrentXP(newLocalXP);
    localStorage.setItem('peyvchin_xp', newLocalXP.toString());
    
    if (currentAward.type === 'fils') setFils(prev => Number(prev) + (additionalData.filsBonus || currentAward.amount));
    if (currentAward.type === 'derhem') setDerhem(prev => Number(prev) + currentAward.amount);
    if (currentAward.type === 'dinar') setDinar(prev => Number(prev) + currentAward.amount);

    // Daily Streak local logic removed - Now handled server-side via RPC to ensure date-accuracy


    // --- UPDATE SOLVED WORDS (LOCAL) ---
    const currentSolved = Array.isArray(gameStateRef.current.solvedWords) ? gameStateRef.current.solvedWords : [];
    const newSolved = Array.isArray(additionalData.solvedWords) ? additionalData.solvedWords : [];
    
    // OPTIMISTIC UPDATE: Update state immediately so UI (Dictionary/Stats) responds instantly
    const nextSolvedWords = [...new Set([...currentSolved, ...newSolved])];

    if (newSolved.length > 0) {
      setSolvedWords(nextSolvedWords);
      localStorage.setItem('peyvchin_solved_words', JSON.stringify(nextSolvedWords));
    }

    if (!currentUser) {
       return { xpAdded: xpToAdd, newLevel: newLevel, awards: currentAward, isGuest: true };
    }

    // --- SYNC TO SUPABASE (RPC) ---
    if (isSyncingProgressionRef.current) return;
    isSyncingProgressionRef.current = true;

    try {
      const { data, error } = await supabase.rpc('sync_profile_progression', {
        p_xp_to_add: xpToAdd,
        p_fils_to_add: currentAward.type === 'fils' ? (additionalData.filsBonus || currentAward.amount) : 0,
        p_derhem_to_add: currentAward.type === 'derhem' ? currentAward.amount : 0,
        p_dinar_to_add: currentAward.type === 'dinar' ? currentAward.amount : 0,
        p_level: newLevel,
        p_solved_words: nextSolvedWords,
        p_mode: mode,
        p_score: score,
        p_is_win: additionalData.isWin !== undefined ? additionalData.isWin : true,
        p_attempts: additionalData.attempts || 0,
        p_is_flawless: (additionalData.hintsUsed === 0 && additionalData.magnetsUsed === 0),
        p_is_secret_win: false,
        p_is_riddle_no_skip: (mode === 'mamak' && additionalData.hintsUsed === 0),
        p_is_pvp_flawless: additionalData.isPvPFlawless || false,
        p_word_length: lettersCount || 0,
        p_solve_time_ms: additionalData.durationMs || 0,
        p_words_found: additionalData.wordsFound || 1
      });

      if (error) {
         console.warn("RPC sync_profile_progression failed, falling back to direct update:", error);
      }

      // --- DIRECT DATABASE SYNC (BACKUP) ---
      try {
        const dbGuessDist = {};
        Object.entries(updatedStats).forEach(([m, data]) => {
          if (data.guess_distribution) dbGuessDist[m] = data.guess_distribution;
        });

        const isWin = additionalData.isWin !== undefined ? additionalData.isWin : true;
        const isPvPWin = mode === 'battle' && isWin;
        const isFlawless = isWin && additionalData.hintsUsed === 0 && additionalData.magnetsUsed === 0;
        const solveTimeMs = additionalData.durationMs || 0;
        const wordsToAdd = Array.isArray(additionalData.solvedWords) ? additionalData.solvedWords.length : (isWin ? 1 : 0);
        
        const newFeverHighscore = mode === 'word_fever' ? Math.max(profileData?.fever_highscore || 0, score) : (profileData?.fever_highscore || 0);
        const newLongestWord = isWin ? Math.max(profileData?.longest_word_length || 0, lettersCount) : (profileData?.longest_word_length || 0);
        
        let newFastestSolve = profileData?.fastest_solve_ms || 0;
        if (isWin && solveTimeMs > 0) {
           newFastestSolve = newFastestSolve > 0 ? Math.min(newFastestSolve, solveTimeMs) : solveTimeMs;
        }

        const currentModePlayCounts = profileData?.mode_play_counts || {};
        const todayStr = new Date().toISOString().split('T')[0];
        const lastActiveDate = profileData?.last_active_date;
        const activeDaysIncrement = (!lastActiveDate || lastActiveDate < todayStr) ? 1 : 0;

        const newCurrentStreak = isWin ? (profileData?.current_streak || 0) + 1 : 0;
        const newMaxStreak = Math.max(profileData?.max_streak || 0, newCurrentStreak);

        const currentInventory = profileData?.inventory || { owned_avatars: ["default"], unlocked_themes: ["default"] };
        const newInventory = { ...currentInventory, solved_words: nextSolvedWords };

        const payload = {
            statistics: updatedStats,
            guess_distribution: dbGuessDist,
            games_played: Number(profileData?.games_played || 0) + 1,
            games_won: Number(profileData?.games_won || 0) + (isWin ? 1 : 0),
            pvp_wins: Number(profileData?.pvp_wins || 0) + (isPvPWin ? 1 : 0),
            total_words_found: Number(profileData?.total_words_found || 0) + Number(wordsToAdd || 0),
            longest_word_length: Number(newLongestWord || 0),
            fastest_solve_ms: Number(newFastestSolve || 0),
            flawless_wins: Number(profileData?.flawless_wins || 0) + (isFlawless ? 1 : 0),
            fever_highscore: Number(newFeverHighscore || 0),
            total_active_days: Number(profileData?.total_active_days || 0) + activeDaysIncrement,
            last_active_date: todayStr,
            current_streak: Number(newCurrentStreak || 0),
            max_streak: Number(newMaxStreak || 0),
            mode_play_counts: {
              ...currentModePlayCounts,
              [mode]: Number(currentModePlayCounts[mode] || 0) + 1
            },
            inventory: newInventory
        };

        console.log("[DEBUG] Supabase Profile Update Payload:", payload);

        await supabase
          .from('profiles')
          .update(payload)
          .eq('id', currentUser.id);
      } catch (dbErr) {
        console.warn("Direct DB stats update failed:", dbErr.message);
      }

      if (data) {
        const { new_level, new_xp, award_xp, daily_streak } = data;
        if (daily_streak !== undefined) {
          setDailyStreak(daily_streak);
          localStorage.setItem('peyvchin_daily_streak', daily_streak.toString());
        }
        await syncProfile(currentUser.id); 
        refreshRank(new_xp, true);

        return { 
          xpAdded: award_xp, 
          newLevel: new_level, 
          awards: currentAward, 
          bahdiniMsg: `سەرکەفتنەکا نوی! ✨ (پاراستی)` 
        };
      } else {
        await syncProfile(currentUser.id);
        refreshRank(newLocalXP, true);
        
        return { 
          xpAdded: xpToAdd, 
          newLevel: newLevel, 
          awards: currentAward, 
          bahdiniMsg: `سەرکەفتنەکا نوی! ✨ (پاراستی)` 
        };
      }
    } catch (err) { 
      console.error("Secured Sync Failed:", err.message); 
      return null; 
    } finally {
      isSyncingProgressionRef.current = false;
    }
  }, [refreshRank, syncProfile, profileData?.games_played, profileData?.games_won, profileData?.fastest_solve_ms, profileData?.fever_highscore, profileData?.flawless_wins, profileData?.last_active_date, profileData?.longest_word_length, profileData?.mode_play_counts, profileData?.pvp_wins, profileData?.total_active_days, profileData?.total_words_found, profileData?.current_streak, profileData?.max_streak, profileData?.inventory]);

  const addXP = useCallback((amount) => { if (amount) setCurrentXP(prev => prev + amount); }, []);

  const applyPenalty = useCallback(async (xpAmount = 20, currencyAmount = 50, currencyType = 'fils') => {
    const { user: currentUser, currentXP: currXP } = gameStateRef.current;
    if (!currentUser) return;

    const newXP = Math.max(0, Number(currXP) - xpAmount);
    const newLevel = getLevelFromXP(newXP);
    
    // Optimistic Update
    setCurrentXP(newXP);
    
    let p_fils = 0, p_derhem = 0, p_dinar = 0;
    if (currencyType === 'fils') {
      setFils(prev => Math.max(0, Number(prev) - currencyAmount));
      p_fils = -currencyAmount;
    } else if (currencyType === 'derhem') {
      setDerhem(prev => Math.max(0, Number(prev) - currencyAmount));
      p_derhem = -currencyAmount;
    } else if (currencyType === 'dinar') {
      setDinar(prev => Math.max(0, Number(prev) - currencyAmount));
      p_dinar = -currencyAmount;
    } else {
      setFils(prev => Math.max(0, Number(prev) - currencyAmount));
      p_fils = -currencyAmount;
    }

    try {
      await supabase.rpc('sync_profile_progression', {
        p_xp_to_add: -xpAmount,
        p_fils_to_add: p_fils,
        p_derhem_to_add: p_derhem,
        p_dinar_to_add: p_dinar,
        p_level: newLevel,
        p_solved_words: gameStateRef.current.solvedWords,
        p_mode: 'penalty',
        p_score: 0,
        p_is_win: false,
        p_attempts: 0,
        p_is_flawless: false,
        p_is_secret_win: false,
        p_is_riddle_no_skip: false,
        p_is_pvp_flawless: false,
        p_word_length: 0,
        p_solve_time_ms: 0,
        p_words_found: 0
      });
      await syncProfile(currentUser.id);
    } catch (err) {
      console.warn("Penalty sync failed:", err);
    }
  }, [syncProfile]);

  const claimDailyReward = useCallback(async () => {
    if (!user) return { error: 'Login required' };
    if (claimRef.current) {
      console.warn('[GameContext] Claim blocked: RPC already in progress');
      return { error: 'Action in progress' };
    }
    
    claimRef.current = true;
    console.log('[GameContext] Triggering secure RPC claim...');
    
    try {
      const { data, error } = await supabase.rpc('claim_daily_reward');
      console.log('[GameContext] RPC Response Data:', data);
      if (error) {
        console.error('[GameContext] RPC Response Error:', error);
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
        
        await syncProfile(user.id, null, true);
        return { success: true, rewards: data.rewards, streak: data.streak };
      }

      return { success: false, error: data?.message || "Claim failed" };
    } catch (err) { 
      console.error("[GameContext] Fatal Claim Error:", err); 
      return { success: false, error: "ئاریشەیەک د سێرڤەری دا ھەبوو" }; 
    } finally {
      claimRef.current = false;
    }
  }, [user, syncProfile]);

  const setNotifiedLevelDB = useCallback(async (newLevel) => {
    setLastNotifiedLevel(newLevel);
    if (user?.id) {
      try {
        await supabase.from('profiles').update({ last_notified_level: newLevel }).eq('id', user.id);
      } catch (err) {
        console.error("[GameContext] Failed to sync last_notified_level:", err);
      }
    }
  }, [user]);

  const { hasUnclaimedMedals, unclaimedMedalsList } = useMemo(() => {
    const safeLevel = getLevelFromXP(currentXP || 0);
    const displayData = { ...(profileData || {}), ...(playerStats || {}), level: safeLevel };
    
    const unclaimed = MEDALS.filter(m => m.condition(displayData) && !claimedMedals.includes(m.id));
    return {
      hasUnclaimedMedals: unclaimed.length > 0,
      unclaimedMedalsList: unclaimed
    };
  }, [currentXP, profileData, playerStats, claimedMedals]);

  const value = useMemo(() => ({
level, currentXP, maxXP, minXPForLevel, fils, derhem, dinar, addXP,
    dailyStreak, setDailyStreak, rewardStreak, lastRewardClaimedAt, lastStreakAt, claimDailyReward,
    inventory, magnetCount, hintCount, skipCount, spinTicketCount,
    solvedWords, playerStats,
    userRank: _userRank, updateInventory, setCurrentXP, setLastNotifiedLevel, lastNotifiedLevel, setNotifiedLevelDB,
    syncProgressToDatabase, applyPenalty, processPurchase, refreshRank, getLevelData, progressPercent,
    claimedMedals, claimMedal, hasUnclaimedMedals, unclaimedMedalsList,
    // ==========================================
    // Fetch Word Logic
    // ==========================================
    getFreshWord: async (mode, category) => {
      const { user: currentUser, level: currLevel, solvedWords: sWords } = gameStateRef.current;
      const { getRandomWordFromCategory } = await import('../data/wordList');
      const { mamakWords } = await import('../data/mamakList');

      // ALWAYS use local data for mamak to ensure it ONLY uses the user's specific words
      if (mode === 'mamak') {
        const result = getRandomWordFromCategory('مامک', currLevel, sWords, mode);
        if (result) {
          localStorage.setItem('peyvchin_last_category', result.category);
          return result;
        }
      }

      // Get the last used category from state or local storage
      const lastCategory = localStorage.getItem('peyvchin_last_category');

      if (currentUser?.id) {
        try {
          const isAll = !category || category === 'گشتی' || category === 'generalWordPool' || category === 'ھەموو';
          const rpcName = isAll ? 'get_balanced_random_word' : 'get_random_fresh_word';
          
          const rpcParams = {
            p_user_id: currentUser.id,
            p_mode_tag: mode === 'classic' ? 'classic' : (mode === 'hard_words' ? 'hard_words' : (mode === 'mamak' ? 'mamak' : mode))
          };

          if (isAll) {
            // Apply category exclusion rule
            rpcParams.p_exclude_category = lastCategory;
          } else {
            rpcParams.p_category = category;
          }

          let { data, error } = await supabase.rpc(rpcName, rpcParams);
          
          let finalData = data;
          
          // STRICTLY prevent riddles ("مامک") from leaking into ANY non-mamak modes/categories
          const isMamakRiddle = (w) => w.category === 'مامک' || mamakWords.some(m => m.word === w.word || m.hint === w.hint);
          
          if (finalData && finalData.length > 0 && isMamakRiddle(finalData[0])) {
             for (let i = 0; i < 5; i++) {
               const retry = await supabase.rpc(rpcName, rpcParams);
               if (retry.data && retry.data.length > 0 && !isMamakRiddle(retry.data[0])) {
                  finalData = retry.data;
                  break;
               }
             }
          }

          if (error) throw error;

          if (finalData && finalData.length > 0) {
            const nextWord = finalData[0];
            // Save the new category for the next round
            localStorage.setItem('peyvchin_last_category', nextWord.category);
            return { word: nextWord.word, hint: nextWord.hint, category: nextWord.category, id: nextWord.id };
          }
        } catch (err) { console.warn("[GameContext] Failed to fetch fresh word from DB, falling back to local:", err); }
      }
      
      const result = getRandomWordFromCategory(category, currLevel, sWords, mode);
      
      if (result) {
        localStorage.setItem('peyvchin_last_category', result.category);
        return result;
      }

      console.warn("[GameContext] Local fallback failed to find word, using default safe word");
      return { word: 'سڵاو', hint: 'پەیڤەکا سادە', category: 'گشتی', id: 'default' };
    },
    initializeStatsInDB: async () => {
      const { user: currentUser } = gameStateRef.current;
      if (!currentUser) return { error: "Login required" };
      
      const dummyStats = [
        { mode: 'classic', score: 40, best: 50, xp: 200 },
        { mode: 'mamak', score: 30, best: 45, xp: 150 },
        { mode: 'word_fever', score: 5, best: 8, xp: 300 },
        { mode: 'hard_words', score: 20, best: 35, xp: 120 },
        { mode: 'battle', score: 100, best: 100, xp: 500 }
      ];

      for (const stat of dummyStats) {
        await supabase.rpc('sync_game_session', {
          p_user_id: currentUser.id,
          p_mode: stat.mode,
          p_magnets_used: 0,
          p_hints_used: 0,
          p_skips_used: 0,
          p_solved_words: []
        });
      }
      await syncProfile();
      return { success: true };
    },
    loading,
    syncStatus
  }), [
    level, currentXP, maxXP, minXPForLevel, fils, derhem, dinar, addXP,
    dailyStreak, rewardStreak, lastRewardClaimedAt, claimDailyReward,
    inventory, magnetCount, hintCount, skipCount, spinTicketCount, solvedWords, playerStats,
    _userRank, updateInventory, syncProgressToDatabase, applyPenalty, processPurchase, refreshRank, loading,
    syncProfile, lastNotifiedLevel, progressPercent, setNotifiedLevelDB, lastStreakAt,
    claimedMedals, claimMedal, hasUnclaimedMedals, unclaimedMedalsList, syncStatus
  ]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
