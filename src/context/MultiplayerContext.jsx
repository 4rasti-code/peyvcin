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

  const stateRef = useRef(multiplayerState);
  const wordIndexRef = useRef(currentWordIndex);
  const scoresRef = useRef(scores);
  const opponentRef = useRef(opponent);
  const matchIdRef = useRef(matchId);
  const channelRef = useRef(null);

  useEffect(() => { stateRef.current = multiplayerState; }, [multiplayerState]);
  useEffect(() => { wordIndexRef.current = currentWordIndex; }, [currentWordIndex]);
  useEffect(() => { scoresRef.current = scores; }, [scores]);
  useEffect(() => { opponentRef.current = opponent; }, [opponent]);
  useEffect(() => { matchIdRef.current = matchId; }, [matchId]);

  // TIMER ENGINE: Tracks seconds while searching or waiting
  useEffect(() => {
    let interval;
    if (multiplayerState === 'searching' || multiplayerState === 'waiting') {
      interval = setInterval(() => {
        setMatchmakingTime(prev => prev + 1);
      }, 1000);
    } else {
      setMatchmakingTime(0);
    }
    return () => clearInterval(interval);
  }, [multiplayerState]);

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
      if (idToCancel && multiplayerState !== 'playing' && multiplayerState !== 'game_over') {
        await supabase.from('online_matches').delete().eq('id', idToCancel);
      }
    } catch (err) {
      console.warn('[Multiplayer] Cancel deletion failed:', err);
    } finally {
      setMatchId(null);
      setActiveMatch(null);
      setOpponent(null);
      setMultiplayerState('idle');
      setMatchmakingTime(0);
      setOpponentGuesses([]);
      setScores({ p1: 0, p2: 0 });
      setCurrentWordIndex(1);
      stopSearchingSound(false);
    }
  }, [matchId, multiplayerState, stopSearchingSound]);

  // 1. POLLING FALLBACK: Detect player join automatically
  useEffect(() => {
    if (multiplayerState !== 'waiting' || !matchId) return;

    const pollInterval = setInterval(async () => {
      const { data: match } = await supabase
        .from('online_matches')
        .select('*')
        .eq('id', matchId)
        .maybeSingle();

      if (match && match.player2_id && stateRef.current !== 'playing' && stateRef.current !== 'game_over') {
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
          console.log('[Multiplayer] Realtime Update:', updatedMatch.id, 'State:', updatedMatch.status);
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
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channelRef.current = channel;
        }
      });

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [matchId, user?.id]);

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

        // Match found! Wait 4 seconds to let the player see the opponent's profile
        setTimeout(() => {
          // IMPORTANT: Only proceed if the user hasn't cancelled since then
          setMultiplayerState(prev => {
            if (prev === 'idle') return prev; 
            stopSearchingSound(true);
            setTimeout(() => playStartGameSound(), 400);
            return 'playing';
          });
          triggerHaptic([50, 50, 100]);
        }, 4000);
      }
    };
    verifyAndStart();

    if (activeMatch.current_word_index !== undefined && activeMatch.current_word_index !== wordIndexRef.current) {
      const newIndex = activeMatch.current_word_index || 0;
      setRoundMessage('ئامادەکارن بۆ گەڕێ');
      setCurrentWordIndex(newIndex);
      setOpponentGuesses([]);
      setIsRoundWinner(false);
      setWinnerNickname('');
      setTimeout(() => setRoundMessage(''), 3000);
    }

    if (activeMatch.status === 'finished' && multiplayerState !== 'idle' && multiplayerState !== 'game_over') {
      const isP1 = activeMatch.player1_id === user.id;
      const myScore = isP1 ? activeMatch.p1_score : activeMatch.p2_score;
      const oppScore = isP1 ? activeMatch.p2_score : activeMatch.p1_score;
      
      let result = 'draw';
      if (myScore > oppScore) result = 'victory';
      else if (myScore < oppScore) result = 'defeat';
      
      setLastMatchResult(result);
      setMatchResultTrigger(prev => prev + 1);
      
      // Redirect to lobby state immediately to sync with App.jsx
      setMultiplayerState('idle');
      setMatchId(null);
      setActiveMatch(null);
      setOpponent(null);
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

  // UNIFIED ONE-CLICK MATCHMAKING
  const startMatchmaking = async () => {
    if (!user?.id) return;

    console.log('[Multiplayer] ONE-CLICK: Searching for rooms...');
    startSearchingSound();
    setMultiplayerState('searching');
    setMatchmakingTime(0);
    setOpponent(null);
    setOpponentGuesses([]);

    try {
      // PHASE 0: CLEANUP (Ensure no old waiting matches for this user exist)
      await supabase.from('online_matches').delete().eq('player1_id', user.id).eq('status', 'waiting');

      // PHASE 1: SEARCH (ATOMIC QUEUE VIA RPC)
      const { data: grabbedMatchId, error: queueError } = await supabase.rpc('join_matchmaking', {
        p_user_id: user.id
      });

      if (queueError) {
        console.error('[Multiplayer] RPC Queue Error:', queueError);
      }

      if (grabbedMatchId) {
        console.log('[Multiplayer] JOINER: Grabbed room via Queue! Fetching match data...', grabbedMatchId);
        
        // Fetch the full room details since the RPC only returns the ID
        const { data: joinedMatch, error: fetchMatchError } = await supabase
          .from('online_matches')
          .select('*')
          .eq('id', grabbedMatchId)
          .single();

        if (!fetchMatchError && joinedMatch) {
          console.log('[Multiplayer] JOINER: Success! Words:', joinedMatch.words?.[0]);
          const hostProfile = await fetchOpponentProfile(joinedMatch.player1_id);
          if (!hostProfile) throw new Error('Identity verification failed');

          setMatchId(joinedMatch.id);
          setActiveMatch(joinedMatch);
          setCurrentWordIndex(joinedMatch.current_word_index || 0);
          return;
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
      stopSearchingSound(false);
      setMultiplayerState('idle');
    }
  };



  const broadcastGuess = (colors, isWin = false) => {
    if (!channelRef.current || !user?.id) return;

    channelRef.current.send({
      type: 'broadcast',
      event: 'GUESS_SUBMITTED',
      payload: { senderId: user.id, colors, isWin }
    });
  };

  const submitGuess = async (colors, isWin) => {
    if (!matchId || !activeMatch) return;
    broadcastGuess(colors, isWin);

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
        setMultiplayerState('game_over');
      } else {
        updates.current_word_index = currentIdx + 1;
      }

      await supabase.from('online_matches').update(updates).eq('id', matchId);
      setIsRoundWinner(true);
      triggerHaptic([50, 50, 100]);
      setTimeout(() => setIsRoundWinner(false), 3000);
    }
  };

  const resetMatchResultTrigger = () => {
    setMatchResultTrigger(0);
    setLastMatchResult(null);
  };

  return (
    <MultiplayerContext.Provider value={{
      multiplayerState,
      matchmakingTime,
      activeMatch,
      opponent,
      setMultiplayerState,
      startMatchmaking,
      cancelMatch,
      submitGuess,
      broadcastGuess,
      opponentGuesses,
      scores,
      currentRound: currentWordIndex,
      isRoundWinner,
      winnerNickname,
      roundMessage,
      fetchOpponentProfile,
      lastMatchResult,
      matchResultTrigger,
      resetMatchResultTrigger
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
