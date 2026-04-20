/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getUnifiedWords } from '../data/wordList';
import { triggerHaptic } from '../utils/haptics';
import { useGame } from './GameContext';

const MultiplayerContext = createContext();

export const MultiplayerProvider = ({ children }) => {
  const { 
    user, 
    startSearchingSound, 
    stopSearchingSound, 
    playStartGameSound 
  } = useGame();
  const [multiplayerState, setMultiplayerState] = useState('idle'); // 'idle', 'searching', 'waiting', 'playing', 'game_over'
  const [matchmakingTime, setMatchmakingTime] = useState(0);
  const [activeMatch, setActiveMatch] = useState(null);
  const [matchId, setMatchId] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [lastMatchResult, setLastMatchResult] = useState(null);
  const [matchResultTrigger, setMatchResultTrigger] = useState(0);

  // New Game State
  const [opponentGuesses, setOpponentGuesses] = useState([]);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [currentWordIndex, setCurrentWordIndex] = useState(1);
  const [isRoundWinner, setIsRoundWinner] = useState(false);
  const [winnerNickname, setWinnerNickname] = useState('');
  const [roundMessage, setRoundMessage] = useState('');
  const [forfeitStatus, setForfeitStatus] = useState(null); // 'pending', 'confirmed'
  const [forfeitCountdown, setForfeitCountdown] = useState(10);
  const forfeitTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const [opponentLiveStatuses, setOpponentLiveStatuses] = useState([]);
  const [opponentLiveCursor, setOpponentLiveCursor] = useState(0);

  const stateRef = useRef(multiplayerState);
  const wordIndexRef = useRef(currentWordIndex);
  const scoresRef = useRef(scores);
  const opponentRef = useRef(opponent);
  const matchIdRef = useRef(matchId);
  const channelRef = useRef(null);
  const matchmakingTimeoutRef = useRef(null);
  const safeClearMatchmakingTimeout = useCallback(() => {
    if (matchmakingTimeoutRef.current) {
      clearTimeout(matchmakingTimeoutRef.current);
      matchmakingTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => { stateRef.current = multiplayerState; }, [multiplayerState]);
  useEffect(() => { wordIndexRef.current = currentWordIndex; }, [currentWordIndex]);
  useEffect(() => { scoresRef.current = scores; }, [scores]);
  useEffect(() => { opponentRef.current = opponent; }, [opponent]);
  useEffect(() => { matchIdRef.current = matchId; }, [matchId]);

  // TIMER ENGINE: Tracks seconds while searching or waiting
  useEffect(() => {
    let interval;
    if (multiplayerState === 'searching' || multiplayerState === 'waiting') {
      interval = setInterval(async () => {
        setMatchmakingTime(prev => {
          const next = prev + 1;
          // 2.2 DEEP FETCH FALLBACK: If stuck for 12s, force a manual record check
          if (next === 12 && stateRef.current !== 'playing') {
            const mId = matchIdRef.current;
            if (mId) {
              supabase.from('online_matches').select('*').eq('id', mId).maybeSingle().then(({ data }) => {
                if (data && (data.player2_id || data.status === 'playing')) {
                  console.log('[Multiplayer] Deep check found match state change! Force sync.');
                  setActiveMatch(prevMatch => ({ ...prevMatch, ...data }));
                }
              });
            }
          }
          return next;
        });
      }, 1000);
    } else {
      setMatchmakingTime(0);
    }
    return () => clearInterval(interval);
  }, [multiplayerState]);

  const broadcastGuess = (colors, isWin = false) => {
    if (!channelRef.current || !user?.id) return;

    channelRef.current.send({
      type: 'broadcast',
      event: 'GUESS_SUBMITTED',
      payload: { senderId: user.id, colors, isWin }
    });
  };

  const broadcastLiveAction = (statuses, cursorIndex) => {
    if (!channelRef.current || !user?.id) return;
    
    channelRef.current.send({
      type: 'broadcast',
      event: 'LIVE_SYNC',
      payload: { senderId: user.id, statuses, cursorIndex }
    });
  };

  const submitGuess = async (colors, isWin) => {
    if (!matchId || !activeMatch) return;
    broadcastGuess(colors, isWin);

    // Clear live feedback upon submission
    broadcastLiveAction([], 0);

    const isP1 = activeMatch.player1_id === user.id;

    // PERSIST NORMAL GUESS (Ghost Grid Support)
    if (!isWin) {
      const currentColors = isP1 ? (activeMatch.p1_colors || []) : (activeMatch.p2_colors || []);
      const updatedColors = [...currentColors, colors];
      await supabase.from('online_matches')
        .update({ [isP1 ? 'p1_colors' : 'p2_colors']: updatedColors })
        .eq('id', matchId);
    }

    if (isWin) {
      const currentIdx = activeMatch.current_word_index || 0;
      const updates = { [isP1 ? 'p1_score' : 'p2_score']: (isP1 ? activeMatch.p1_score : activeMatch.p2_score) + 1 };

      // Clear colors for next round
      updates.p1_colors = [];
      updates.p2_colors = [];

      if (currentIdx >= 2) {
        updates.status = 'finished';
        
        // --- WINNER RESULT CALCULATION ---
        const myFinalScore = (isP1 ? activeMatch.p1_score : activeMatch.p2_score) + 1;
        const oppFinalScore = isP1 ? activeMatch.p2_score : activeMatch.p1_score;
        
        let result = 'draw';
        if (myFinalScore > oppFinalScore) result = 'victory';
        else if (myFinalScore < oppFinalScore) result = 'defeat';
        
        setLastMatchResult(result);
        setMatchResultTrigger(prev => prev + 1);
        setMultiplayerState('game_over');
      } else {
        updates.current_word_index = currentIdx + 1;
      }

      await supabase.from('online_matches').update(updates).eq('id', matchId);
      triggerHaptic([50, 50, 100]);
    }
  };

  const submitFailure = async () => {
    if (!matchId || !activeMatch) return;
    
    // Clear live feedback upon failure
    broadcastLiveAction([], 0);

    const isP1 = activeMatch.player1_id === user?.id;
    const currentIdx = activeMatch.current_word_index || 0;
    
    // 1. Mark as failed locally (Ghost Grid update)
    const updates = { 
      [isP1 ? 'p1_colors' : 'p2_colors']: [...(isP1 ? activeMatch.p1_colors : activeMatch.p2_colors || []), ["#334155","#334155","#334155","#334155","#334155"]] // Placeholder colors for failure
    };

    // 2. Check if opponent already failed OR if we are the last ones to fail
    const oppColors = isP1 ? activeMatch.p2_colors : activeMatch.p1_colors;
    const oppFailed = oppColors && (oppColors.length >= 3); // MaxRows is 3

    if (oppFailed) {
      // Both failed: 0 points for both, next round
      updates.p1_colors = [];
      updates.p2_colors = [];
      if (currentIdx >= 2) {
        updates.status = 'finished';
        setMultiplayerState('game_over');
      } else {
        updates.current_word_index = currentIdx + 1;
      }
    }

    await supabase.from('online_matches').update(updates).eq('id', matchId);
  };

  const { setFils, addXP, playCoinSound } = useGame();

  const triggerForfeitVictory = async () => {
    const mId = matchId || matchIdRef.current;
    if (!mId) return;

    try {
      setForfeitStatus('confirmed');
      const isP1 = activeMatch?.player1_id === user?.id;
      
      // 1. Update DB immediately
      const updates = { 
        status: 'finished',
        // Award the win to the remaining player by setting score 
        // Or just let the result logic handle it
      };
      // To ensure victory, we make sure current player has more points or we just set result
      if (isP1) updates.p1_score = 3; else updates.p2_score = 3;

      await supabase.from('online_matches').update(updates).eq('id', mId);

      // 2. Award Rewards
      const coinReward = 100;
      const xpReward = 150;
      setFils(prev => prev + coinReward);
      addXP(xpReward);
      // Trigger reward sound
      const { playRewardSound } = useGame();
      try { playRewardSound(); } catch(e) {}

      // 3. UI Update with specific disconnect message
      setLastMatchResult('victory');
      setMatchResultTrigger(prev => prev + 1);
      
      // Cleanup
      if (forfeitTimerRef.current) {
        clearTimeout(forfeitTimerRef.current);
        forfeitTimerRef.current = null;
      }

      // Transition out of playing state
      setMultiplayerState('game_over');
    } catch (err) {
      console.error('[Multiplayer] Forfeit handling failed:', err);
    }
  };

  const resetMatchResultTrigger = () => {
    setMatchResultTrigger(0);
    setLastMatchResult(null);
  };

  const fetchOpponentProfile = useCallback(async (opponentId) => {
    if (!opponentId) return null;
    if (opponentRef.current?.id === opponentId) return opponentRef.current;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, nickname, avatar_url')
      .eq('id', opponentId)
      .maybeSingle();

    if (error) return null;

    if (data) {
      setOpponent(data);
      setActiveMatch(prev => prev ? ({
        ...prev,
        opp_nickname: data.nickname,
        opp_avatar_url: data.avatar_url
      }) : null);
    }
    return data;
  }, []);

  const cancelMatch = useCallback(async () => {
    const idToCancel = matchId || matchIdRef.current;
    try {
      if (idToCancel) {
        if (multiplayerState === 'playing' || multiplayerState === 'game_over') {
          // If in a match, mark as finished/forfeited instead of deleting
          await supabase.from('online_matches').update({ status: 'finished' }).eq('id', idToCancel);
          console.log('[Multiplayer] Match marked as FINISHED in DB via Cancel.');
        } else {
          // If just searching/waiting, delete the record
          await supabase.from('online_matches').delete().eq('id', idToCancel);
          console.log('[Multiplayer] Match DELETED from DB via Cancel.');
        }
      }
    } catch (err) {
      console.warn('[Multiplayer] Cancel/Cleanup failed:', err);
    } finally {
      setMatchId(null);
      setActiveMatch(null);
      setOpponent(null);
      setMultiplayerState('idle');
      setMatchmakingTime(0);
      setOpponentGuesses([]);
      setScores({ p1: 0, p2: 0 });
      setCurrentWordIndex(1);
      setForfeitStatus(null);
      if (forfeitTimerRef.current) {
        clearTimeout(forfeitTimerRef.current);
        forfeitTimerRef.current = null;
      }
      stopSearchingSound(false);
    }
  }, [matchId, multiplayerState, stopSearchingSound]);

  // 1. POLLING FALLBACK: Detect player join automatically
  useEffect(() => {
    if ((multiplayerState !== 'waiting' && multiplayerState !== 'searching') || !matchId) return;

    const pollInterval = setInterval(async () => {
      const { data: match } = await supabase
        .from('online_matches')
        .select('*')
        .eq('id', matchId)
        .maybeSingle();

      if (match && (match.player2_id || match.status === 'playing') && stateRef.current !== 'playing' && stateRef.current !== 'game_over') {
        console.log('[Multiplayer] Polling Fallback found opponent! Syncing.');
        setActiveMatch(prev => ({ ...prev, ...match }));
        clearInterval(pollInterval);
      }
    }, 1500);

    return () => clearInterval(pollInterval);
  }, [multiplayerState, matchId]);

  // 2. REALTIME SUBSCRIPTION
  useEffect(() => {
    if (!matchId) return;

    const channel = supabase
      .channel(`match_room_${matchId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'online_matches', filter: `id=eq.${matchId}` },
        (payload) => {
          const updatedMatch = payload.new;
          setActiveMatch(prev => prev ? { ...prev, ...updatedMatch } : updatedMatch);
        }
      )
      .on(
        'broadcast',
        { event: 'GUESS_SUBMITTED' },
        (payload) => {
          const data = payload.payload || payload;
          if (user?.id && data.senderId !== user.id) {
            setOpponentGuesses(prev => [...prev, data.colors]);
            if (data.isWin) {
              const winnerName = opponentRef.current?.nickname || 'Opponent';
              setWinnerNickname(winnerName);
              triggerHaptic([100, 100, 100]);
              setTimeout(() => setWinnerNickname(''), 3000);
            }
          }
        }
      )
      .on(
        'broadcast',
        { event: 'LIVE_SYNC' },
        (payload) => {
          // Robust payload extraction for broadcast
          const data = payload.payload || payload;
          if (user?.id && data.senderId && data.senderId !== user.id) {
            setOpponentLiveStatuses(data.statuses || []);
            setOpponentLiveCursor(data.cursorIndex || 0);
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const presences = Object.values(newState).flat();
        const opponentId = opponentRef.current?.id;
        
        // 1. RECOVERY CHECK: If opponent was pending forfeit but is now back in sync
        const isOpponentPresent = presences.some(p => p.user_id === opponentId);
        if (isOpponentPresent && forfeitTimerRef.current) {
          console.log('[Multiplayer] Opponent reconnected (via Sync), cancelling forfeit timer.');
          clearTimeout(forfeitTimerRef.current);
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          forfeitTimerRef.current = null;
          countdownIntervalRef.current = null;
          setForfeitStatus(null);
          setForfeitCountdown(10);
        }

        // 2. DISCONNECT DETECTION (Fallback): If we are playing but opponent is missing from sync
        if (stateRef.current === 'playing' && !isOpponentPresent && !forfeitTimerRef.current) {
          console.log('[Multiplayer] Opponent missing from sync, triggering 30s grace period...');
          startGracePeriod();
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const opponentId = opponentRef.current?.id;
        const opponentLeft = leftPresences.some(p => p.user_id === opponentId);
        
        if (opponentLeft && stateRef.current === 'playing' && !forfeitTimerRef.current) {
          console.log('[Multiplayer] Opponent explicitly left, starting 30s grace period...');
          startGracePeriod();
        }
      })
      .subscribe(async (status) => {
        console.log(`[Multiplayer] Realtime Channel (${matchId}):`, status);
        if (status === 'SUBSCRIBED') {
          channelRef.current = channel;
          await channel.track({
            user_id: user?.id,
            online_at: new Date().toISOString(),
          });
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('[Multiplayer] Realtime Connection Failed.');
        }
      });

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      clearForfeitLogic();
    };
  }, [matchId, user?.id]);

  const clearForfeitLogic = useCallback(() => {
    if (forfeitTimerRef.current) {
      clearTimeout(forfeitTimerRef.current);
      forfeitTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const startGracePeriod = useCallback(() => {
    setForfeitStatus('pending');
    setForfeitCountdown(10);
    
    clearForfeitLogic();

    // Start countdown interval
    countdownIntervalRef.current = setInterval(() => {
      setForfeitCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    forfeitTimerRef.current = setTimeout(() => {
      console.log('[Multiplayer] Grace period expired, triggering forfeit.');
      triggerForfeitVictory();
    }, 10000);
  }, [triggerForfeitVictory, clearForfeitLogic]);

  // 2.5 APP STATE VISIBILITY HANDLER (Clinical Recovery)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[Multiplayer] App returned to foreground, forcing re-sync...');
        // Force re-initialize supabase connection if dropped
        if (supabase.realtime && !supabase.realtime.isConnected()) {
          supabase.realtime.connect();
        }
        // Force channel re-subscription if missing
        if (matchIdRef.current && !channelRef.current) {
          console.log('[Multiplayer] Missing channel on return, re-triggering subscription...');
          // This will be caught by the matchId useEffect
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // 3. SYNC EFFECT: Silent Auto-Handshake
  useEffect(() => {
    if (!activeMatch || !user?.id) return;

    const verifyAndStart = async () => {
      if ((multiplayerState === 'waiting' || multiplayerState === 'searching') && activeMatch.player2_id) {
        const oppId = activeMatch.player2_id === user.id ? activeMatch.player1_id : activeMatch.player2_id;
        const oppProfile = await fetchOpponentProfile(oppId);

        if (!oppProfile) {
          console.error('[Multiplayer] Silent Handshake Failed: Invalid Profile.');
          await cancelMatch();
          return;
        }

        // Match found! Stop searching audio immediately and play "Found" SFX
        stopSearchingSound(true);
        playStartGameSound();

        // Snappy Handshake: Reduced from 4s to 1.5s for faster transition
        setTimeout(() => {
          // IMPORTANT: Only proceed if the user hasn't cancelled since then
          setMultiplayerState(prev => {
            if (prev === 'idle') return prev; 
            
            // Trigger Round Intro for the FIRST time
            setRoundMessage('ROUND 1');
            setTimeout(() => setRoundMessage(''), 4000); // 4s for full cinematic
            
            return 'playing';
          });
          triggerHaptic([50, 50, 100]);
        }, 1500);
      }
    };
    verifyAndStart();

    if (activeMatch.current_word_index !== undefined && activeMatch.current_word_index !== wordIndexRef.current) {
      const newIndex = activeMatch.current_word_index || 0;
      setCurrentWordIndex(newIndex);
      setOpponentGuesses([]);
      setIsRoundWinner(false);
      setWinnerNickname('');
      
      // Trigger Round Intro for mid-game transition
      setRoundMessage(`ROUND ${newIndex + 1}`);
      setTimeout(() => setRoundMessage(''), 4000);
    }

    if (activeMatch.status === 'finished' && multiplayerState !== 'idle') {
      // Logic for anyone who didn't trigger the game_over state locally (e.g. the loser)
      if (multiplayerState !== 'game_over' || lastMatchResult === null) {
        const isP1 = activeMatch.player1_id === user.id;
        const myScore = isP1 ? activeMatch.p1_score : activeMatch.p2_score;
        const oppScore = isP1 ? activeMatch.p2_score : activeMatch.p1_score;
        
        let result = 'draw';
        if (myScore > oppScore) result = 'victory';
        else if (myScore < oppScore) result = 'defeat';
        
        console.log(`[Multiplayer] Sync found finished match. Result: ${result}.`);
        setLastMatchResult(result);
        setMatchResultTrigger(prev => prev + 1);
        setMultiplayerState('game_over');
      }
    }

    if (activeMatch.p1_score !== scoresRef.current.p1 || activeMatch.p2_score !== scoresRef.current.p2) {
      setScores({ p1: activeMatch.p1_score, p2: activeMatch.p2_score });
    }

    // NEW: Sync Opponent Colors from DB if missing in local state
    const isP1 = activeMatch.player1_id === user.id;
    const oppColors = isP1 ? activeMatch.p2_colors : activeMatch.p1_colors;
    if (oppColors && Array.isArray(oppColors) && oppColors.length > opponentGuesses.length) {
      setOpponentGuesses(oppColors);
    }
  }, [activeMatch, user?.id, multiplayerState, fetchOpponentProfile, opponentGuesses.length, cancelMatch]);

  // 4. MOUNT-TIME RECOVERY EFFECT
  useEffect(() => {
    if (!user?.id || multiplayerState !== 'idle') return;

    const recoverActiveMatch = async () => {
      console.log('[Multiplayer] Checking for active match sessions to recover...');
      try {
        const { data, error } = await supabase
          .from('online_matches')
          .select('*')
          .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
          .eq('status', 'playing')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          // 4.1 EXPIRATION CHECK: If match is older than 15 minutes, auto-finish it
          const createdAt = new Date(data.created_at);
          const now = new Date();
          const diffInMinutes = (now - createdAt) / (1000 * 60);

          if (diffInMinutes > 15) {
            console.log('[Multiplayer] Found stale match (15m+). Auto-finishing in DB.');
            await supabase.from('online_matches').update({ status: 'finished' }).eq('id', data.id);
            return; // Stay in idle
          }

          console.log('[Multiplayer] Recovering active match:', data.id);
          const oppId = data.player1_id === user.id ? data.player2_id : data.player1_id;
          
          setMatchId(data.id);
          setActiveMatch(data);
          
          if (oppId) {
            await fetchOpponentProfile(oppId);
          }
          
          setMultiplayerState('playing');
          triggerHaptic([100, 50]);
        }
      } catch (err) {
        console.warn('[Multiplayer] Active match recovery failed:', err);
      }
    };

    recoverActiveMatch();
  }, [user?.id]);

  // UNIFIED ONE-CLICK MATCHMAKING
  const startMatchmaking = async () => {
    if (!user?.id) return;

    console.log('[Multiplayer] ONE-CLICK: Searching for rooms...');
    
    // 0. Failsafe Audio Initialization
    try { startSearchingSound(); } catch (e) { console.warn("Searching Sfx fail:", e); }

    // 1. Aggressive Connection Guard (Flush and Re-establish)
    if (supabase.realtime) {
      supabase.realtime.disconnect();
      supabase.realtime.connect();
    }

    setMultiplayerState('searching');
    setMatchmakingTime(0);
    setOpponent(null);
    setOpponentGuesses([]);

    // 2. HARD TIMEOUT FALLBACK (60 Seconds)
    safeClearMatchmakingTimeout();
    matchmakingTimeoutRef.current = setTimeout(() => {
      if (stateRef.current === 'searching' || stateRef.current === 'waiting') {
        setMultiplayerState('idle'); 
        alert("چو یاریزان نەهاتە دیتن ل ڤێ گاڤێ. پشتى دەمەکێ دى تاقی بکە.");
      }
    }, 60000);

    try {
      // PHASE 0: CLEANUP (Ensure no old waiting matches for this user exist)
      await supabase.from('online_matches').delete().eq('player1_id', user.id).eq('status', 'waiting');

      // PHASE 1: SEARCH (DIRECT CLIENT-SIDE JOIN - AUDITED)
      console.log('[Multiplayer] SEARCH: Querying for status=waiting AND player2_id=NULL...');
      const { data: openMatches, error: searchError } = await supabase
        .from('online_matches')
        .select('id, player1_id')
        .eq('status', 'waiting')
        .is('player2_id', null)
        .neq('player1_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1);

      if (searchError) {
        console.error('[Multiplayer] Search Query Error:', searchError);
      }

      if (openMatches && openMatches.length > 0) {
        const targetMatch = openMatches[0];
        console.log('[Multiplayer] JOINER: Found target room:', targetMatch.id, '. Attempting atomic claim...');

        // ATOMIC CLAIM: Update only if it's still waiting with no p2
        const { data: joinedMatch, error: claimError } = await supabase
          .from('online_matches')
          .update({ 
            player2_id: user.id,
            status: 'playing' // Optional: move to playing immediately OR let handshake decide
          })
          .eq('id', targetMatch.id)
          .is('player2_id', null)
          .select()
          .single();

        if (!claimError && joinedMatch) {
          safeClearMatchmakingTimeout();
          console.log('[Multiplayer] JOINER: Claim SUCCESS! Handshaking with Host:', joinedMatch.player1_id);
          
          const hostProfile = await fetchOpponentProfile(joinedMatch.player1_id);
          if (!hostProfile) throw new Error('Identity verification failed');

          setMatchId(joinedMatch.id);
          setActiveMatch(joinedMatch);
          setCurrentWordIndex(joinedMatch.current_word_index || 0);
          return;
        } else {
          console.warn('[Multiplayer] JOINER: Claim failed (someone else got it?). Falling back to Host.');
        }
      }

      // PHASE 2: AUTO-HOST (If no room found)
      console.log('[Multiplayer] HOST: No match found, creating room...');
      let selectedWords = [];
      let selectedRiddles = [];

      try {
        const { data: randomSample, error: wordError } = await supabase.from('words').select('word, definition').limit(20);
        if (!wordError && randomSample?.length >= 3) {
          const shuffled = randomSample.sort(() => 0.5 - Math.random());
          selectedWords = shuffled.slice(0, 3).map(e => e.word);
          selectedRiddles = shuffled.slice(0, 3).map(e => e.definition || 'No riddle');
        } else {
          throw new Error('Fallback');
        }
      } catch {
        const localWords = getUnifiedWords();
        const fallback = [...localWords].sort(() => 0.5 - Math.random()).slice(0, 3);
        selectedWords = fallback.map(w => w.word);
        selectedRiddles = fallback.map(w => w.hint || 'پەیڤێ بدۆزەوە');
      }

      const { data: newMatch, error: createError } = await supabase
        .from('online_matches')
        .insert({
          player1_id: user.id,
          status: 'waiting',
          words: selectedWords,
          riddles: selectedRiddles,
          current_word_index: 0,
          p1_score: 0, p2_score: 0
        })
        .select().single();

      if (createError) throw createError;
      if (newMatch) {
        console.log('[Multiplayer] HOST: Success! Created Match ID:', newMatch.id, 'Words:', newMatch.words?.[0]);
        setMatchId(newMatch.id);
        setActiveMatch(newMatch);
        setMultiplayerState('waiting');
      }

    } catch (error) {
      console.error('[Multiplayer] Matchmaking Failed:', error);
      safeClearMatchmakingTimeout();
      try { stopSearchingSound(false); } catch(e) {}
      setMultiplayerState('idle');
    }
  };



  return (
    <MultiplayerContext.Provider value={{
      multiplayerState,
      matchmakingTime,
      activeMatch,
      opponent,
      setMultiplayerState,
      startMatchmaking,
      cancelMatch: () => {
        // Full clean logic for manually returning to lobby
        setMultiplayerState('idle');
        setMatchId(null);
        setActiveMatch(null);
        setOpponent(null);
        setLastMatchResult(null);
        setMatchResultTrigger(0);
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      },
      submitGuess,
      submitFailure,
      broadcastGuess,
      opponentGuesses,
      scores,
      currentRound: currentWordIndex,
      isRoundWinner,
      matchResultTrigger,
      lastMatchResult,
      resetMatchResultTrigger,
      winnerNickname,
      roundMessage,
      fetchOpponentProfile,
      forfeitStatus,
      forfeitCountdown,
      triggerForfeitVictory,
      broadcastLiveAction,
      opponentLiveStatuses,
      opponentLiveCursor
    }}>
      {children}
    </MultiplayerContext.Provider>
  );
};

export const useMultiplayer = () => {
  const context = useContext(MultiplayerContext);
  if (!context) throw new Error('useMultiplayer must be used within MultiplayerProvider');
  return context;
};
