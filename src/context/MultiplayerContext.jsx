/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useMotionValue, motion as Motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { getUnifiedWords } from '../data/wordList';
import { triggerHaptic } from '../utils/haptics';
import { useGame } from './GameContext';
import { useUser } from './AuthContext';
import { useAudio } from './AudioContext';

const MultiplayerContext = createContext();

export const MultiplayerProvider = ({ children }) => {
  const { user, userNickname } = useUser();
  const { 
    startSearchingSound, 
    stopSearchingSound, 
    playRewardSound 
  } = useAudio();
  const { syncProgressToDatabase, applyPenalty } = useGame();
  const [multiplayerState, setMultiplayerState] = useState('idle');
  const [MatchmakingTime, setMatchmakingTime] = useState(0);
  const [activeMatch, setActiveMatch] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [errorAlert, setErrorAlert] = useState(null);
  const [LastMatchResult, setLastMatchResult] = useState(null);
  const [MatchResultTrigger, setMatchResultTrigger] = useState(0);

  // New Game State
  const [opponentGuesses, setOpponentGuesses] = useState([]);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isRoundWinner, setIsRoundWinner] = useState(false);
  const [winnerNickname, setWinnerNickname] = useState('');
  const [roundMessage, setRoundMessage] = useState('');
  const [forfeitStatus, setForfeitStatus] = useState(null); 
  const [forfeitCountdown, setForfeitCountdown] = useState(10);
  const [isForfeitWin, setIsForfeitWin] = useState(false);
  const [MatchReward, setMatchReward] = useState(null);

  // Dynamic Background Readiness Sync
  const [isGameBoardMounted, setIsGameBoardMounted] = useState(false);
  const [isOpponentBackgroundReady, setIsOpponentBackgroundReady] = useState(false);

  const setMultiplayerStateGuarded = useCallback((next) => {
    setMultiplayerState(prev => prev !== next ? next : prev);
  }, []);

  const setActiveMatchGuarded = useCallback((next) => {
    setActiveMatch(prev => {
       if (!prev && !next) return null;
       if (prev && next && prev.id === next.id && prev.status === next.status && prev.current_word_index === next.current_word_index && prev.p1_score === next.p1_score && prev.p2_score === next.p2_score && prev.p1_failed === next.p1_failed && prev.p2_failed === next.p2_failed) return prev;
       return next;
    });
  }, []);

  const setOpponentGuarded = useCallback((next) => {
    setOpponent(prev => {
       if (!prev && !next) return null;
       if (prev?.id === next?.id) return prev;
       return next;
    });
  }, []);
  const forfeitTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const [opponentLiveStatuses, setOpponentLiveStatuses] = useState([]);
  const opponentLiveCursor = useMotionValue(0);
  const [opponentReaction, setOpponentReaction] = useState(null);
  const reactionTimeoutRef = useRef(null);
  const [myReaction, setMyReaction] = useState(null);
  const myReactionTimeoutRef = useRef(null);

  const stateRef = useRef(multiplayerState);
  const wordIndexRef = useRef(currentWordIndex);
  const scoresRef = useRef(scores);
  const opponentRef = useRef(opponent);
  const matchIdRef = useRef(null);
  const [matchId, setMatchId] = useState(null);
  const channelRef = useRef(null);
  const matchmakingTimeoutRef = useRef(null);
  const _handshakeTimerRef = useRef(null);
  const isFetchingOpponentRef = useRef(false);
  const isPollingRef = useRef(false);
  const _isFetchingMatchRef = useRef(false);
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

  // UNIFIED AUDIO CONTROLLER: Sync searching SFX with state
  useEffect(() => {
    if (multiplayerState === 'playing' || multiplayerState === 'idle' || multiplayerState === 'game_over') {
      try {
        stopSearchingSound();
      } catch (e) {
        console.warn("[Multiplayer] Audio: Failed to stop searching SFX", e);
      }
    } else if (multiplayerState === 'searching' || multiplayerState === 'waiting') {
      try {
        startSearchingSound();
      } catch (e) {
        console.warn("[Multiplayer] Audio: Failed to start searching SFX", e);
      }
    }
  }, [multiplayerState, stopSearchingSound, startSearchingSound]);

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
            if (mId && typeof mId === 'string' && mId !== 'undefined' && mId !== 'null') {
              supabase.from('online_matches').select('*').eq('id', mId).maybeSingle().then(({ data }) => {
                if (data && (data.player2_id || data.status === 'playing')) {
                  console.log('[Multiplayer] Deep check found match state change! Force sync.');
                  setActiveMatchGuarded(data);
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
  }, [multiplayerState, setActiveMatchGuarded]);

  const broadcastGuess = useCallback((colors, isWin = false) => {
    if (!channelRef.current || !user?.id) return;
    if (channelRef.current.state !== 'joined' && channelRef.current.state !== 'SUBSCRIBED') return;

    channelRef.current.send({
      type: 'broadcast',
      event: 'GUESS_SUBMITTED',
      payload: { senderId: user.id, colors, isWin }
    });
  }, [user?.id]);

  const broadcastLiveAction = useCallback((statuses, cursorIndex) => {
    if (!channelRef.current || !user?.id) return;
    if (channelRef.current.state !== 'joined' && channelRef.current.state !== 'SUBSCRIBED') return;
    
    channelRef.current.send({
      type: 'broadcast',
      event: 'LIVE_SYNC',
      payload: { senderId: user.id, statuses, cursorIndex }
    });
  }, [user?.id]);

  const broadcastReaction = useCallback((emoji) => {
    if (!channelRef.current || !user?.id) return;
    
    // Show locally immediately
    setMyReaction(emoji);
    if (myReactionTimeoutRef.current) clearTimeout(myReactionTimeoutRef.current);
    myReactionTimeoutRef.current = setTimeout(() => setMyReaction(null), 2500);

    if (channelRef.current.state !== 'joined' && channelRef.current.state !== 'SUBSCRIBED') return;
    
    channelRef.current.send({
      type: 'broadcast',
      event: 'GAME_REACTION',
      payload: { senderId: user.id, emoji }
    });
  }, [user?.id]);

  const submitGuess = useCallback(async (colors, isWin) => {
    if (!matchId || matchId === 'null' || matchId === 'undefined' || !activeMatch) return;
    broadcastGuess(colors, isWin);

    // Clear live feedback upon submission
    broadcastLiveAction([], 0);

    const action = isWin ? 'WIN' : 'GUESS';
    const currentIdx = activeMatch.current_word_index || 0;

    const payload = {
      p_match_id: String(matchId),
      p_user_id: String(user?.id),
      p_expected_round: Number(currentIdx),
      p_action: String(action),
      p_colors: colors
    };

    const { error } = await supabase.rpc('submit_match_guess', payload);
    
    if (error) {
      console.error('[Multiplayer] submitGuess RPC Error:', error, 'Payload:', payload);
    }

    if (isWin) {
      setWinnerNickname(userNickname);
      triggerHaptic([50, 50, 100]);
    }
  }, [matchId, activeMatch, broadcastGuess, broadcastLiveAction, user?.id, userNickname]);

  const submitFailure = useCallback(async () => {
    if (!matchId || matchId === 'null' || matchId === 'undefined' || !activeMatch) return;
    broadcastLiveAction([], 0);
    
    const currentIdx = activeMatch.current_word_index || 0;
    const failureColors = ["#334155", "#334155", "#334155", "#334155", "#334155"];

    const payload = {
      p_match_id: String(matchId),
      p_user_id: String(user?.id),
      p_expected_round: Number(currentIdx),
      p_action: 'FAIL',
      p_colors: failureColors
    };

    const { error } = await supabase.rpc('submit_match_guess', payload);
    
    if (error) {
      console.error('[Multiplayer] submitFailure RPC Error:', error, 'Payload:', payload);
    }

    triggerHaptic([100, 50, 100]);
  }, [matchId, activeMatch, broadcastLiveAction, user?.id]);

  const submitTimeout = useCallback(async () => {
    if (!matchId || matchId === 'null' || matchId === 'undefined' || !activeMatch) return;
    
    const currentIdx = activeMatch.current_word_index || 0;
    const payload = {
      p_match_id: String(matchId),
      p_user_id: String(user?.id),
      p_expected_round: Number(currentIdx),
      p_action: 'TIMEOUT'
    };

    const { error } = await supabase.rpc('submit_match_guess', payload);
    if (error) {
      console.error('[Multiplayer] submitTimeout RPC Error:', error);
    }
  }, [matchId, activeMatch, user?.id]);

  const triggerForfeitVictory = useCallback(async () => {
    const mId = matchId || matchIdRef.current;
    if (!mId || mId === 'null' || mId === 'undefined') return;

    try {
      setForfeitStatus('confirmed');
      setIsForfeitWin(true);
      const isP1 = activeMatch?.player1_id === user?.id;
      
      // 1. Update DB immediately
      const updates = { 
        status: 'finished',
        // Award the win to the remaining player by setting score 
        // Or just let the result logic handle it
      };
      // To ensure victory, we make sure current player has a 3-0 lead
      if (isP1) {
        updates.p1_score = 3;
        updates.p2_score = 0;
      } else {
        updates.p2_score = 3;
        updates.p1_score = 0;
      }

      await supabase.from('online_matches').update(updates).eq('id', mId);
      
      // Standardized DB Reward Sync (Battle Reward: 1 Dinar, 100 XP)
      const rewardData = await syncProgressToDatabase(5, 'battle', { isWin: true, attempts: 1 });
      if (rewardData) setMatchReward(rewardData);
      // Trigger reward sound
      try { playRewardSound(); } catch(_e) { /* Audio context failure */ }

      // 3. UI Update with specific disconnect message
      setLastMatchResult('victory');
      setMatchResultTrigger(prev => prev + 1);
      
      // Cleanup
      if (forfeitTimerRef.current) {
        clearTimeout(forfeitTimerRef.current);
        forfeitTimerRef.current = null;
      }

      // Transition out of playing state
      setIsGameBoardMounted(false);
      setIsOpponentBackgroundReady(false);
      setMultiplayerStateGuarded('idle');
    } catch (err) {
      console.error('[Multiplayer] Forfeit handling failed:', err);
    }
  }, [matchId, activeMatch?.player1_id, user?.id, syncProgressToDatabase, playRewardSound, setMultiplayerStateGuarded]);
  
  const ResetMatchResultTrigger = useCallback(() => {
    setMatchResultTrigger(0);
    setLastMatchResult(null);
    setIsForfeitWin(false);
  }, []);

  const fetchOpponentProfile = useCallback(async (opponentId, signal = null) => {
    if (!opponentId || opponentId === 'undefined' || isFetchingOpponentRef.current) return null;
    
    try {
      isFetchingOpponentRef.current = true;
      let query = supabase
        .from('profiles')
        .select('id, nickname, avatar_url, updated_at, xp')
        .eq('id', opponentId);
      
      if (signal) query = query.abortSignal(signal);
      
      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      if (data) {
        setOpponentGuarded(data);
        return data;
      }
      return null;
    } catch (err) {
      if (err.name === 'AbortError' || err.message?.includes('Abort')) return null;
      console.warn('[Multiplayer] Failed to fetch opponent profile:', err);
      return null;
    } finally {
      isFetchingOpponentRef.current = false;
    }
  }, [setOpponentGuarded]);

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

  const cancelMatch = useCallback(async () => {
    const idToCancel = matchId || matchIdRef.current;
    const isValidId = idToCancel && idToCancel !== 'null' && idToCancel !== 'undefined';
    
    // Capture state needed for DB queries before clearing
    const wasPlaying = multiplayerState === 'playing';
    const isP1 = activeMatch?.player1_id === user?.id;

    if (forfeitTimerRef.current) {
      clearTimeout(forfeitTimerRef.current);
      forfeitTimerRef.current = null;
    }
    setForfeitStatus(null); // Ensure "Connection Lost" popup is explicitly suppressed

    if (channelRef.current) {
      // Broadcast cancellation to opponent before disconnecting, ONLY if we haven't started playing.
      // If we are playing, the DB update to 'finished' will trigger the Victory card for them.
      if (!wasPlaying) {
        if (channelRef.current.state === 'joined' || channelRef.current.state === 'SUBSCRIBED') {
          channelRef.current.send({
            type: 'broadcast',
            event: 'MATCH_CANCELLED'
          }).catch(err => console.warn('[Multiplayer] Failed to send cancel broadcast:', err));
        }
      }
      
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    try { 
      stopSearchingSound(false); 
    } catch (e) {
      console.warn("Failed to stop searching sound:", e);
    }

    try {
      if (isValidId) {
          if (wasPlaying) {
            const updates = { status: 'finished' };
            // Award the win to the OTHER player and reset the leaver's score
            if (isP1) {
              updates.p2_score = 3;
              updates.p1_score = 0;
            } else {
              updates.p1_score = 3;
              updates.p2_score = 0;
            }
            await supabase.from('online_matches').update(updates).eq('id', idToCancel);
            applyPenalty(10, 25); // Very light penalty for leaving mid-game
            
            // DIRECTLY transition to Results UI without wiping state to prevent black screens/glitches
            setLastMatchResult('defeat');
            setMatchReward({ status: 'defeat', msg: 'تە یاری بجهێلا' });
            setMatchResultTrigger(prev => prev + 1);
            setIsGameBoardMounted(false);
            setIsOpponentBackgroundReady(false);
            setMultiplayerStateGuarded('idle');
          } else {
            // If just searching/waiting/game_over, delete the record
            await supabase.from('online_matches').delete().eq('id', idToCancel);
          }
        }
    } catch (err) {
      console.warn('[Multiplayer] Cancel/Cleanup failed:', err);
    }

    // IMMEDIATELY CLEAR LOCAL STATE TO PREVENT RACE CONDITIONS AND RE-TRIGGERS
    setMatchId(null);
    setActiveMatchGuarded(null);
    setOpponentGuarded(null);
    setMultiplayerStateGuarded('idle');
    setMatchmakingTime(0);
    setOpponentGuesses([]);
    setScores({ p1: 0, p2: 0 });
    setCurrentWordIndex(0);
    setIsRoundWinner(false);
    setMatchResultTrigger(0);
    setLastMatchResult(null);
    setMatchReward(null);
    setIsGameBoardMounted(false);
    setIsOpponentBackgroundReady(false);
  }, [matchId, multiplayerState, stopSearchingSound, setActiveMatchGuarded, setMultiplayerStateGuarded, setOpponentGuarded, activeMatch?.player1_id, applyPenalty, user?.id]);

  // 1. POLLING FALLBACK: Detect player join automatically AND prevent desync during play
  useEffect(() => {
    const isIdle = multiplayerState === 'idle';
    if (isIdle || !matchId) return;

    const controller = new AbortController();

    const pollInterval = setInterval(async () => {
      if (isPollingRef.current) return;
      
      try {
        isPollingRef.current = true;
        const { data: match } = await supabase
          .from('online_matches')
          .select('*')
          .eq('id', matchId)
          .abortSignal(controller.signal)
          .maybeSingle();

        if (match) {
          const isSearching = stateRef.current === 'waiting' || stateRef.current === 'searching' || stateRef.current === 'private_lobby';
          
          if (isSearching && (match.player2_id || match.status === 'playing') && stateRef.current !== 'playing' && stateRef.current !== 'game_over') {
            console.log('[Multiplayer] Polling Fallback found opponent! Syncing.');
            setActiveMatchGuarded(match);
            clearInterval(pollInterval);
          } else if (stateRef.current === 'playing') {
            // Desync protection: Check if server state has advanced beyond our local state
            const hasDesynced = 
              match.current_word_index !== wordIndexRef.current || 
              match.status !== activeMatch?.status || 
              (match.p1_failed && !activeMatch?.p1_failed) || 
              (match.p2_failed && !activeMatch?.p2_failed);

            if (hasDesynced) {
              console.log('[Multiplayer] Polling Fallback detected desync! Resolving...');
              setActiveMatchGuarded(match);
            }
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.warn('[Multiplayer] Polling error:', err);
      } finally {
        isPollingRef.current = false;
      }
    }, 3000);

    return () => {
      clearInterval(pollInterval);
      controller.abort();
    };
  }, [multiplayerState, matchId, setActiveMatchGuarded, activeMatch?.status, activeMatch?.p1_failed, activeMatch?.p2_failed]);

  // 2. REALTIME SUBSCRIPTION
  useEffect(() => {
    if (!matchId || matchId === 'undefined' || matchId === 'null') return;
    console.log('[Multiplayer] Constructing subscription filter for:', matchId);

    const channel = supabase
      .channel(`match_room_${matchId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'online_matches', filter: `id=eq.${matchId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            console.log('[Multiplayer] Match record deleted (cancelled by opponent).');
            // Match was deleted before it could finish (or was aborted). Kick immediately.
            setMultiplayerStateGuarded('idle');
            setActiveMatchGuarded(null);
            setOpponentGuarded(null);
            return;
          }

          const updatedMatch = payload.new;
          if (!updatedMatch) return;

          // Fetch full match data to ensure columns like 'words' and 'player1_id' are not missing due to REPLICA IDENTITY DEFAULT
          supabase.from('online_matches').select('*').eq('id', updatedMatch.id).maybeSingle()
            .then(({ data: fullMatch, error }) => {
              if (error || !fullMatch) {
                console.error("[Multiplayer] Full match fetch failed or blocked by RLS:", error);
                return;
              }
              
              if (fullMatch) {
                setActiveMatchGuarded(fullMatch);

                // 2.1 DIRECT HANDSHAKE RESOLUTION: If we are Host and a Joiner just claimed the room
                const isP1 = fullMatch.player1_id === user?.id;
                if (isP1 && fullMatch.player2_id && stateRef.current !== 'playing' && stateRef.current !== 'game_over') {
                  console.log('[Multiplayer] Realtime found Joiner! Resolving handshake...');
                  fetchOpponentProfile(fullMatch.player2_id).then(prof => {
                    if (prof) {
                      triggerHaptic([50, 50, 100]);
                    }
                  });
                }
              }
            });
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
            opponentLiveCursor.set(data.cursorIndex || 0);
          }
        }
      )
      .on(
        'broadcast',
        { event: 'GAME_REACTION' },
        (payload) => {
          const data = payload.payload || payload;
          if (user?.id && data.senderId && data.senderId !== user.id && data.emoji) {
            setOpponentReaction(data.emoji);
            if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
            reactionTimeoutRef.current = setTimeout(() => {
              setOpponentReaction(null);
            }, 2500);
          }
        }
      )
      .on(
        'broadcast',
        { event: 'I_AM_READY' },
        () => {
          // Rely strictly on stateRef to avoid stale closures. Host is in private_lobby.
          const isHost = stateRef.current === 'private_lobby';
          if (isHost) {
            console.log('[Multiplayer] Receiver is fully ready. Syncing match start...');
            if (channel.state === 'joined' || channel.state === 'SUBSCRIBED') {
              channel.send({ type: 'broadcast', event: 'START_MATCH_TIMER' });
            }
            setMultiplayerStateGuarded('match_starting');
          }
        }
      )
      .on(
        'broadcast',
        { event: 'START_MATCH_TIMER' },
        () => {
          console.log('[Multiplayer] Received sync timer broadcast!');
          if (stateRef.current === 'joining' || stateRef.current === 'syncing') {
            setMultiplayerStateGuarded('match_starting');
          }
        }
      )
      .on(
        'broadcast',
        { event: 'CLIENT_BACKGROUND_READY' },
        (payload) => {
          console.log('[Multiplayer] Received Opponent Background Ready!', payload);
          setIsOpponentBackgroundReady(true);
        }
      )
      .on(
        'broadcast',
        { event: 'MATCH_CANCELLED' },
        () => {
          console.log('[Multiplayer] Received MATCH_CANCELLED broadcast. Kicking to lobby.');
          setMultiplayerStateGuarded('idle');
          setActiveMatchGuarded(null);
          setOpponentGuarded(null);
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
          console.log(`[Multiplayer] Channel match_room_${matchId} active.`);
          
          // Rely strictly on stateRef to avoid stale closures. Joiner is in joining/syncing.
          const isJoiner = stateRef.current === 'joining' || stateRef.current === 'syncing';
          if (isJoiner) {
            console.log('[Multiplayer] Joiner fully subscribed. Sending I_AM_READY broadcast...');
            if (channel.state === 'joined' || channel.state === 'SUBSCRIBED') {
              channel.send({ type: 'broadcast', event: 'I_AM_READY' });
            }
          }

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
  }, [matchId, user?.id, clearForfeitLogic, fetchOpponentProfile, opponentLiveCursor, setActiveMatchGuarded, setMultiplayerStateGuarded, startGracePeriod, setOpponentGuarded]);

  // 2.5 APP STATE VISIBILITY HANDLER (Clinical Recovery)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (!user?.id) return; // Guard against unauthenticated syncs
        console.log('[Multiplayer] App returned to foreground, checking sync...');
        // Force re-initialize supabase connection if dropped
        if (supabase.realtime && !supabase.realtime.isConnected()) {
          supabase.realtime.connect();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user?.id]);

  useEffect(() => {
    if (!activeMatch || !user?.id) return;

    const verifyAndStart = async () => {
      try {
        if (activeMatch.player1_id && activeMatch.player2_id) {
          const handleTransition = () => {
            const currentState = stateRef.current;
            if (currentState === 'private_lobby' || currentState === 'joining' || currentState === 'syncing') {
              // Direct invite transition: Wait for explicit broadcast handshake!
              // Do NOT automatically set 'match_starting' here, otherwise desync occurs.
              if (currentState === 'joining') {
                setMultiplayerStateGuarded('syncing');
              }
            } else if (currentState !== 'playing' && currentState !== 'game_over' && currentState !== 'found' && currentState !== 'match_starting') {
              // Random matchmaking transition: 2-second delay
              setMultiplayerStateGuarded('found');
              setTimeout(async () => {
                if (stateRef.current === 'found') {
                  // Final Safety Check: Did the host cancel/delete the room while we were waiting?
                  const { data } = await supabase.from('online_matches').select('id').eq('id', activeMatch.id).maybeSingle();
                  if (!data) {
                    console.log('[Multiplayer] Safety Check: Room was deleted before we could start. Aborting.');
                    setMultiplayerStateGuarded('idle');
                    setActiveMatchGuarded(null);
                    setOpponentGuarded(null);
                    return;
                  }
                  setMultiplayerStateGuarded('playing');
                }
              }, 2000);
            }
          };

          if (opponent) {
            handleTransition();
          } else {
            console.warn("[Multiplayer] Handshake: Waiting for opponent profile...");
            const isP1 = activeMatch.player1_id === user.id;
            const oppId = isP1 ? activeMatch.player2_id : activeMatch.player1_id;
            
            const { data: opponentProfile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', oppId)
              .maybeSingle();

            if (error || !opponentProfile) {
              setMultiplayerStateGuarded('syncing'); 
            } else {
              setOpponent(opponentProfile);
              setOpponentGuarded(opponentProfile);
              handleTransition();
            }
          }
        } else {
          if (stateRef.current !== 'waiting' && stateRef.current !== 'searching' && stateRef.current !== 'private_lobby') {
            setMultiplayerStateGuarded('waiting');
          }
        }
      } catch (err) {
        console.error("[Multiplayer] Handshake verification failed:", err);
        setMultiplayerStateGuarded('syncing');
      }
    };

    verifyAndStart();
  }, [activeMatch, opponent, user?.id, setMultiplayerStateGuarded, setOpponentGuarded, setActiveMatchGuarded]);

  useEffect(() => {
    if (isGameBoardMounted) {
      console.log('[Multiplayer] Local background is 100% ready. Broadcasting to opponent...');
      if (channelRef.current && (channelRef.current.state === 'joined' || channelRef.current.state === 'SUBSCRIBED')) {
        channelRef.current.send({ type: 'broadcast', event: 'CLIENT_BACKGROUND_READY' });
      }
    }
  }, [isGameBoardMounted, multiplayerState]);

  // 3.5 MATCH STARTING BUFFER EFFECT (DYNAMIC SYNC & SAFETY FALLBACK)
  useEffect(() => {
    let timeoutId;
    let cancelFallbackId;

    if (multiplayerState === 'match_starting') {
      // If both ready, lift curtain immediately
      if (isGameBoardMounted && isOpponentBackgroundReady) {
        console.log('[Multiplayer] Transitioning instantly!');
        setMultiplayerStateGuarded('playing');
      } else {
        // Safety Fallback Timeout: 3 seconds to guarantee match starts
        timeoutId = setTimeout(() => {
          if (stateRef.current === 'match_starting') {
            console.warn('[Multiplayer] Safety timeout expired during match_starting. Forcing transition to playing. Readiness:', { isGameBoardMounted, isOpponentBackgroundReady });
            setMultiplayerStateGuarded('playing');
          }
        }, 3000);

        // 10-Second Critical Fallback: If opponent never readies up, cancel the frozen match
        cancelFallbackId = setTimeout(() => {
          if (!isOpponentBackgroundReady) {
            console.warn('[Multiplayer] 10-second critical failure. Opponent never connected. Cancelling match.');
            if (cancelMatch) cancelMatch();
          }
        }, 10000);
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (cancelFallbackId) clearTimeout(cancelFallbackId);
    };
  }, [multiplayerState, isGameBoardMounted, isOpponentBackgroundReady, setMultiplayerStateGuarded, cancelMatch]);
  
  // 4. GAME SYNC EFFECT: Handle round transitions and match results
  useEffect(() => {
    if (!activeMatch || !user?.id) return;
    
    const isP1 = activeMatch.player1_id === user.id;

    // --- 4.1 DETECT ROUND TRANSITION ---
    if (activeMatch.current_word_index !== undefined && activeMatch.current_word_index !== wordIndexRef.current) {
      const newIndex = activeMatch.current_word_index || 0;
      const wasTie = (activeMatch.p1_score === scoresRef.current.p1 && activeMatch.p2_score === scoresRef.current.p2);

      setCurrentWordIndex(newIndex);
      setOpponentGuesses([]);
      setIsRoundWinner(false);
      setWinnerNickname('');
      
      if (wasTie && newIndex > 0) {
        setRoundMessage('ROUND_DRAW');
      } else {
        setRoundMessage(`ROUND ${newIndex + 1}`);
      }
      setTimeout(() => setRoundMessage(''), 4000);
    }

    // --- 4.3 UPDATE LOCAL REFS (DO THIS LAST) ---
    wordIndexRef.current = activeMatch.current_word_index || 0;
    scoresRef.current = { p1: activeMatch.p1_score || 0, p2: activeMatch.p2_score || 0 };
    setScores(scoresRef.current);

    if (activeMatch.status === 'finished' && multiplayerState !== 'idle') {
      // Logic for anyone who didn't trigger the game_over state locally (e.g. the loser)
      if (multiplayerState !== 'game_over' || LastMatchResult === null) {
        const myScore = isP1 ? activeMatch.p1_score : activeMatch.p2_score;
        const oppScore = isP1 ? activeMatch.p2_score : activeMatch.p1_score;
        
        let result = 'draw';
        if (myScore - oppScore >= 2) result = 'victory';
        else if (oppScore - myScore >= 2) result = 'defeat';
        else result = 'draw';
        
        console.log(`[Multiplayer] Sync found finished match. Scores: ${myScore}-${oppScore}. Result: ${result}.`);
        setLastMatchResult(result);
        setMatchResultTrigger(prev => prev + 1);
        setIsGameBoardMounted(false);
        setIsOpponentBackgroundReady(false);
        setMultiplayerStateGuarded('idle');

        // SYNC REWARDS TO DATABASE
        if (result === 'victory') {
          const isFlawless = myScore === 3 && oppScore === 0;
          const attemptsVal = isFlawless ? 1 : (oppScore === 1 ? 2 : 3);
          syncProgressToDatabase(5, 'battle', { 
            isPvPFlawless: isFlawless,
            isWin: true,
            attempts: attemptsVal,
            wordsFound: myScore
          }).then(rewardData => {
            if (rewardData) setMatchReward(rewardData);
          });
        } else if (result === 'draw') {
          syncProgressToDatabase(5, 'battle_draw', { isWin: false, wordsFound: myScore }).then(rewardData => {
            if (rewardData) setMatchReward(rewardData);
          });
        } else if (result === 'defeat') {
          syncProgressToDatabase(5, 'battle_loss', { isWin: false, wordsFound: myScore }).then(rewardData => {
            if (rewardData) setMatchReward(rewardData);
          });
        }
      }
    }

    if (activeMatch.p1_score !== scoresRef.current.p1 || activeMatch.p2_score !== scoresRef.current.p2) {
      setScores({ p1: activeMatch.p1_score, p2: activeMatch.p2_score });
    }

    // NEW: Sync Opponent Colors from DB if missing in local state
    const oppColors = isP1 ? activeMatch.p2_colors : activeMatch.p1_colors;
    if (oppColors && Array.isArray(oppColors) && oppColors.length > opponentGuesses.length) {
      setOpponentGuesses(oppColors);
    }
  }, [activeMatch, user?.id, multiplayerState, opponentGuesses.length, LastMatchResult, setMultiplayerStateGuarded, syncProgressToDatabase]);

  // 4.5 HOST TIE-BREAK FALLBACK (Resolves Race Conditions when both fail simultaneously)
  useEffect(() => {
    if (!activeMatch || !user?.id) return;
    const isP1 = activeMatch.player1_id === user.id;
    
    if (isP1 && activeMatch.p1_failed && activeMatch.p2_failed) {
      console.log('[Multiplayer] Host Tie-Break: Both players failed. Forcing round advance.');
      const currentIdx = activeMatch.current_word_index || 0;
      const scoreDiff = Math.abs((activeMatch.p1_score || 0) - (activeMatch.p2_score || 0));
      const totalWords = activeMatch.words?.length || 5;
      const isMatchEnd = scoreDiff >= 2 || (currentIdx + 1 >= totalWords);
      
      const nextRoundData = {
        current_word_index: currentIdx + 1,
        p1_failed: false,
        p2_failed: false,
        p1_colors: [],
        p2_colors: []
      };
      if (isMatchEnd) nextRoundData.status = 'finished';

      supabase.from('online_matches').update(nextRoundData).eq('id', activeMatch.id);
    }
  }, [activeMatch, user?.id]);

  // 5. MOUNT-TIME RECOVERY EFFECT
  useEffect(() => {
    if (!user?.id || multiplayerState !== 'idle') return;
    const controller = new AbortController();

    const recoverActiveMatch = async () => {
      console.log('[Multiplayer] Checking for active match sessions to recover...');
      try {
        const { data, error } = await supabase
          .from('online_matches')
          .select('*')
          .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
          .eq('status', 'playing')
          .order('created_at', { ascending: false })
          .abortSignal(controller.signal)
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
          setActiveMatchGuarded(data);
          
          if (oppId) {
            await fetchOpponentProfile(oppId);
          }
          
          setMultiplayerStateGuarded('playing');
          triggerHaptic([100, 50]);
        }
      } catch (err) {
        console.warn('[Multiplayer] Active match recovery failed:', err);
      }
    };

    recoverActiveMatch();
    return () => controller.abort();
  }, [user?.id, fetchOpponentProfile, multiplayerState, setActiveMatchGuarded, setMultiplayerStateGuarded]);

  // UNIFIED ONE-CLICK MATCHMAKING
  const startMatchmaking = useCallback(async () => {
    if (!user?.id) return;

    console.log('[Multiplayer] ONE-CLICK: Searching for rooms...');
    
    // 0. Failsafe Audio Initialization
    try { startSearchingSound(); } catch (e) { console.warn("Searching Sfx fail:", e); }

    // 1. Aggressive Connection Guard (Flush and Re-establish)
    if (supabase.realtime) {
      supabase.realtime.disconnect();
      supabase.realtime.connect();
    }
    
    setMultiplayerStateGuarded('searching');
    setMatchmakingTime(0);
    setOpponent(null);
    setOpponentGuarded(null);
    setActiveMatchGuarded(null);
    setMatchId(null);
    setOpponentGuesses([]);
    setMatchReward(null);

    // 2. HARD TIMEOUT FALLBACK (60 Seconds)
    safeClearMatchmakingTimeout();
    matchmakingTimeoutRef.current = setTimeout(() => {
      if (stateRef.current === 'searching' || stateRef.current === 'waiting') {
        setMultiplayerState('idle'); 
        setErrorAlert("چ یاریزان نەهاتە دیتن ل ڤێ گاڤێ. پشتى دەمەکێ دى تاقی بکە.");
      }
    }, 60000);

    try {
      // PHASE 0: CLEANUP (Ensure no old waiting matches for this user exist)
      await supabase.from('online_matches').delete().eq('player1_id', user.id).eq('status', 'global_waiting');

      // PHASE 1: SEARCH (DIRECT CLIENT-SIDE JOIN - AUDITED)
      console.log('[Multiplayer] SEARCH: Querying for status=global_waiting AND player2_id=NULL...');
      const { data: openMatches, error: searchError } = await supabase
        .from('online_matches')
        .select('id, player1_id')
        .eq('status', 'global_waiting')
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
          
          setMatchId(joinedMatch.id);
          setActiveMatch(joinedMatch);
          setCurrentWordIndex(joinedMatch.current_word_index || 0);

          // DIRECT JOINER RESOLUTION: Fetch Host profile and transition immediately
          const hostProfile = await fetchOpponentProfile(joinedMatch.player1_id);
          if (hostProfile) {
            triggerHaptic([50, 50, 100]);
          } else {
            // Fallback to syncing if profile fetch is slow
            setMultiplayerStateGuarded('syncing');
          }
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
        const { data: sequencedWords, error: wordError } = await supabase
          .rpc('get_multiplayer_words_sequenced');
          
        if (!wordError && sequencedWords?.length > 0) {
          selectedWords = sequencedWords.map(e => e.word);
          selectedRiddles = sequencedWords.map(e => e.hint || 'No riddle');
        } else {
          throw new Error('DB Sequenced Fetch Error or Empty');
        }
      } catch (_) {
        console.log('[Multiplayer] Using local fallback for sequenced words.');
        const localWords = getUnifiedWords();
        const fiveLetterLocal = localWords.filter(w => w.word && w.word.length === 5);
        // Shuffle local words randomly instead of sorting alphabetically to prevent repetition
        const fallback = [...fiveLetterLocal].sort(() => Math.random() - 0.5).slice(0, 5);
        selectedWords = fallback.map(w => w.word);
        selectedRiddles = fallback.map(w => w.hint || 'پەیڤێ بدۆزەوە');
      }

      const { data: newMatch, error: createError } = await supabase
        .from('online_matches')
        .insert({
          player1_id: user.id,
          status: 'global_waiting',
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
        setActiveMatchGuarded(newMatch);
        setMultiplayerStateGuarded('waiting');
      }

    } catch (error) {
      console.error('[Multiplayer] Matchmaking Failed:', error);
      setErrorAlert("هەڵەیەک ڕوویدا: " + (error.message || "نەتوانرا یاری دروست بکرێت"));
      safeClearMatchmakingTimeout();
      try { stopSearchingSound(false); } catch(_e) { /* Ignore audio stop failures */ }
      setMultiplayerStateGuarded('idle');
    }
  }, [user?.id, startSearchingSound, stopSearchingSound, safeClearMatchmakingTimeout, fetchOpponentProfile, setActiveMatchGuarded, setMultiplayerStateGuarded, setOpponentGuarded]);



  // --- PRIVATE MATCH SYSTEM ---
  const createPrivateMatch = useCallback(async () => {
    if (!user?.id) return null;
    
    // Cleanup any old private waiting rooms for this user
    await supabase.from('online_matches').delete().eq('player1_id', user.id).eq('status', 'private_waiting');
    
    setMultiplayerStateGuarded('private_lobby'); // Show waiting lobby instead of triggering 'searching' navigation
    setOpponent(null);
    setOpponentGuesses([]);
    setMatchReward(null);

    let selectedWords = [];
    let selectedRiddles = [];

    try {
      const { data: sequencedWords, error: wordError } = await supabase.rpc('get_multiplayer_words_sequenced');
      if (!wordError && sequencedWords?.length > 0) {
        selectedWords = sequencedWords.map(e => e.word);
        selectedRiddles = sequencedWords.map(e => e.hint || 'No riddle');
      } else {
        throw new Error('DB Sequenced Fetch Error');
      }
    } catch (_) {
      const localWords = getUnifiedWords();
      const fiveLetterLocal = localWords.filter(w => w.word && w.word.length === 5);
      const fallback = [...fiveLetterLocal].sort(() => Math.random() - 0.5).slice(0, 5);
      selectedWords = fallback.map(w => w.word);
      selectedRiddles = fallback.map(w => w.hint || 'پەیڤێ بدۆزەوە');
    }

    const { data: newMatch, error: createError } = await supabase
      .from('online_matches')
      .insert({
        player1_id: user.id,
        status: 'private_waiting', // Isolates from random matchmaking
        words: selectedWords,
        riddles: selectedRiddles,
        current_word_index: 0,
        p1_score: 0, p2_score: 0
      })
      .select().single();

    if (createError) {
      console.error('[Multiplayer] Private Match Create Failed:', createError);
      setMultiplayerStateGuarded('idle');
      return null;
    }
    
    if (newMatch) {
      setMatchId(newMatch.id);
      setActiveMatchGuarded(newMatch);
      // Ensure real-time connect
      if (supabase.realtime && !supabase.realtime.isConnected()) supabase.realtime.connect();
      setMultiplayerStateGuarded('private_lobby'); // Custom state for host waiting
      return newMatch.id;
    }
    return null;
  }, [user?.id, setMultiplayerStateGuarded, setActiveMatchGuarded]);

  const hostAcceptJoiner = useCallback(async (joinerId) => {
    if (!matchId || !joinerId) return;
    const prof = await fetchOpponentProfile(joinerId);
    if (prof) {
      // Optimistically update local activeMatch to avoid waiting for polling
      setActiveMatchGuarded(prev => prev ? { ...prev, player2_id: joinerId, status: 'playing' } : prev);
      triggerHaptic([50, 50, 100]);
    }
  }, [matchId, fetchOpponentProfile, setActiveMatchGuarded]);

  const joinPrivateMatch = useCallback(async (roomIdOrCode) => {
    if (!user?.id || !roomIdOrCode) return false;
    
    // Use joining state to avoid flashing the random matchmaking Search UI
    setMultiplayerStateGuarded('joining');
    setOpponent(null);
    setOpponentGuesses([]);
    setMatchReward(null);

    try {
      if (supabase.realtime && !supabase.realtime.isConnected()) supabase.realtime.connect();

      // Find the room securely
      const { data: targetMatch, error: searchError } = await supabase
        .from('online_matches')
        .select('*')
        .eq('id', roomIdOrCode)
        .maybeSingle();
      
      if (searchError || !targetMatch) {
        console.error("[Multiplayer] Match not found or access denied:", searchError);
        setErrorAlert("ببورە، ئەڤ ژوورە نەهاتە دیتن یان یا ب دوماهی هاتی.");
        setMultiplayerStateGuarded('idle');
        return false;
      }

      // Atomic claim
      const { data: joinedMatch, error: claimError } = await supabase
        .from('online_matches')
        .update({ 
          player2_id: user.id,
          status: 'playing' 
        })
        .eq('id', targetMatch.id)
        .is('player2_id', null)
        .select()
        .maybeSingle();

      if (claimError || !joinedMatch) {
        console.error("[Multiplayer] Match not found or access denied:", claimError);
        setErrorAlert("ببورە، ئەڤ ژوورە نەهاتە دیتن یان یا ب دوماهی هاتی.");
        setMultiplayerStateGuarded('idle');
        return false;
      }

      if (!claimError && joinedMatch) {
        setMatchId(joinedMatch.id);
        setActiveMatchGuarded(joinedMatch);
        setCurrentWordIndex(joinedMatch.current_word_index || 0);

        const hostProfile = await fetchOpponentProfile(joinedMatch.player1_id);
        if (hostProfile) {
          triggerHaptic([50, 50, 100]);
        } else {
          setMultiplayerStateGuarded('syncing');
        }
        return true;
      }
      setMultiplayerStateGuarded('idle');
      return false;
    } catch (error) {
      console.error('[Multiplayer] Join Private Failed:', error);
      setMultiplayerStateGuarded('idle');
      return false;
    }
  }, [user?.id, setMultiplayerStateGuarded, setActiveMatchGuarded, fetchOpponentProfile]);

  const value = useMemo(() => ({
    multiplayerState,
    MatchmakingTime,
    activeMatch,
    opponent,
    setMultiplayerState,
    startMatchmaking,
    createPrivateMatch,
    joinPrivateMatch,
    cancelMatch,
    submitGuess,
    submitFailure,
    submitTimeout,
    broadcastGuess,
    opponentGuesses,
    scores,
    currentRound: currentWordIndex,
    isRoundWinner,
    MatchResultTrigger,
    LastMatchResult,
    MatchReward,
    ResetMatchResultTrigger,
    winnerNickname,
    roundMessage,
    fetchOpponentProfile,
    forfeitStatus,
    forfeitCountdown,
    triggerForfeitVictory,
    broadcastLiveAction,
    opponentLiveStatuses,
    opponentLiveCursor,
    isForfeitWin,
    opponentReaction,
    myReaction,
    broadcastReaction,
    hostAcceptJoiner,
    isGameBoardMounted,
    setIsGameBoardMounted,
    isOpponentBackgroundReady
  }), [
    multiplayerState, MatchmakingTime, activeMatch, opponent, setMultiplayerState,
    startMatchmaking, createPrivateMatch, joinPrivateMatch, cancelMatch, submitGuess, submitFailure, submitTimeout, broadcastGuess,
    opponentGuesses, scores, currentWordIndex, isRoundWinner, MatchResultTrigger,
    LastMatchResult, MatchReward, ResetMatchResultTrigger, winnerNickname,
    roundMessage, fetchOpponentProfile, forfeitStatus, forfeitCountdown,
    triggerForfeitVictory, broadcastLiveAction, opponentLiveStatuses,
    opponentLiveCursor, isForfeitWin, hostAcceptJoiner,
    isGameBoardMounted, isOpponentBackgroundReady,
    opponentReaction, myReaction, broadcastReaction
  ]);

  return (
    <MultiplayerContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {errorAlert && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <Motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-mono-100 dark:bg-[#141414] border border-mono-200 dark:border-white/10 rounded-md shadow-2xl p-6 flex flex-col gap-4 text-center items-center"
              dir="rtl"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[28px]">error</span>
              </div>
              <p className="text-sm font-bold text-mono-900 dark:text-white leading-relaxed">
                {errorAlert}
              </p>
              <button
                onClick={() => setErrorAlert(null)}
                className="mt-4 w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-md transition-colors"
              >
                باشە
              </button>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </MultiplayerContext.Provider>
  );
};

export const useMultiplayer = () => {
  const context = useContext(MultiplayerContext);
  if (!context) throw new Error('useMultiplayer must be used within MultiplayerProvider');
  return context;
};
