import React, { useEffect, useCallback, useMemo } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import Grid from './Grid';
import Keyboard from './Keyboard';
import { useMultiplayer } from '../context/MultiplayerContext';
import { useUser } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { useGame } from '../context/GameContext';
import useGameLogic from '../hooks/useGameLogic';
import Avatar from './Avatar';
import KurdishSunLoader from './KurdishSunLoader';
import RoundIntro from './RoundIntro';
import { toKuDigits } from '../utils/formatters';

export default function MultiplayerGameView({ opponent: propOpponent, isDark = true, onOpenHowToPlay: _onOpenHowToPlay }) {
  const {
    activeMatch,
    opponent: contextOpponent,
    submitGuess,
    broadcastGuess,
    opponentGuesses,
    scores,
    currentRound,
    isRoundWinner,
    winnerNickname: _winnerNickname,
    roundMessage,
    multiplayerState,
    setMultiplayerState: _setMultiplayerState,
    fetchOpponentProfile,
    resetMatchResultTrigger: _resetMatchResultTrigger,
    forfeitStatus,
    forfeitCountdown,
    triggerForfeitVictory: _triggerForfeitVictory,
    submitFailure,
    cancelMatch: _cancelMatch,
    broadcastLiveAction,
    opponentLiveStatuses,
    opponentLiveCursor,
    setIsGameBoardMounted
  } = useMultiplayer();

  // Prioritize Prop over Context to force re-renders from App.jsx
  const opponent = propOpponent || contextOpponent;
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showCinematicOverlay, setShowCinematicOverlay] = React.useState(true);
  const [countdown, setCountdown] = React.useState(5);

  const { user, userNickname, userAvatar } = useUser();
  const { playPopSound, playVictorySound: _playVictorySound, playStartGameSound: playStartSound } = useAudio();
  const { level: userLevel } = useGame();

  useEffect(() => {
    if (!showCinematicOverlay || multiplayerState !== 'playing') return;

    const tickAudio = new Audio('/Cartoon-timer-ticking-tick-tock-countdown.mp3');
    tickAudio.volume = 0.25;
    tickAudio.play().catch(e => console.warn("Failed to play tick audio:", e));

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowCinematicOverlay(false);
          tickAudio.pause();
          tickAudio.currentTime = 0;
          playStartSound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      tickAudio.pause();
      tickAudio.currentTime = 0;
    };
  }, [showCinematicOverlay, multiplayerState, playStartSound]);

  // 1. TOP-LEVEL DERIVED DATA (DECLARE BEFORE ANY RETURNS)
  const isPlayer1 = useMemo(() => activeMatch?.player1_id === user?.id, [activeMatch, user]);
  const targetWord = useMemo(() => {
    if (!activeMatch?.words?.length) return '';
    // Safe modulo access in case of extreme round counts
    const idx = currentRound % activeMatch.words.length;
    return activeMatch.words[idx] || '';
  }, [activeMatch, currentRound]);

  // Expose Game Board Readiness
  useEffect(() => {
    console.log('[MultiplayerGameView] Readiness Check:', {
      hasOpponent: !!opponent,
      hasTargetWord: !!targetWord,
      hasActiveMatch: !!activeMatch,
      targetWord,
      opponentId: opponent?.id,
      matchId: activeMatch?.id
    });

    if (opponent && targetWord && activeMatch) {
      setIsGameBoardMounted?.(true);
    } else {
      setIsGameBoardMounted?.(false);
    }
  }, [opponent, targetWord, activeMatch, setIsGameBoardMounted]);

  // CORE ENGINE
  const onGuessSubmitted = useCallback(async (colors, isWin) => {
    if (isWin) {
      await submitGuess(colors, true);
      // Only play sound at the very end of the match (handled by Context/Overlay)
      // playVictorySound(); // REMOVED - requested by user
    } else {
      broadcastGuess(colors, false);
      playPopSound(true);
    }
  }, [submitGuess, broadcastGuess, playPopSound]);

  const {
    guesses,
    currentGuess,
    usedKeys,
    onKey,
    onDelete,
    onEnter,
    getLetterStatus,
    resetLocalBoard
  } = useGameLogic({
    targetWord,
    maxRows: 3,
    gameMode: 'multiplayer',
    onGuessSubmitted,
    onLoss: async () => {
      if (multiplayerState !== 'playing') return;
      console.log('[Multiplayer] Round Loss detected locally. Submitting failure.');
      await submitFailure();
    },
    isActive: multiplayerState === 'playing'
  });

  // 1.5 MASKED LIVE SYNC BROADCASTER
  useEffect(() => {
    if (multiplayerState !== 'playing' || !broadcastLiveAction || !targetWord) return;

    // Calculate masked statuses for current guess
    // 0: empty, 1: correct, 2: wrong_place, 3: absent
    const statuses = currentGuess.map((char, i) => {
      if (!char) return 0;
      const status = getLetterStatus(currentGuess, i, targetWord);
      if (status === 'CORRECT') return 1;
      if (status === 'WRONG_POS') return 2;
      if (status === 'INCORRECT') return 3;
      return 0;
    });

    // Find cursor index (first empty cell)
    const cursorIndex = currentGuess.findIndex(c => c === '');
    const finalCursor = cursorIndex === -1 ? targetWord.length - 1 : cursorIndex;

    broadcastLiveAction(statuses, finalCursor);
  }, [currentGuess, multiplayerState, broadcastLiveAction, targetWord, getLetterStatus]);

  // 3. IDENTITY HEALING: Ensure opponent is fetched if missing
  useEffect(() => {
    if (activeMatch && !opponent) {
      const oppId = isPlayer1 ? activeMatch.player2_id : activeMatch.player1_id;
      if (oppId) {
        fetchOpponentProfile(oppId);
      }
    }
  }, [activeMatch, opponent, isPlayer1, fetchOpponentProfile]);

  // Handle board reset when round changes or word loads
  useEffect(() => {
    if (targetWord) {
      resetLocalBoard(targetWord);
    }
  }, [currentRound, targetWord, resetLocalBoard]);


  // --- GUARDS & EARLY RETURNS (Declare AFTER all hooks) ---
  if (!activeMatch) {
    return (
      <div className="h-full bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
        <KurdishSunLoader />
        <p className="mt-8 text-white/40 font-noto-sans-arabic animate-pulse">بەرھەڤکرنا پەیڤان...</p>
      </div>
    );
  }

  if (!opponent) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#020617] text-white">
        <KurdishSunLoader />
        <p className="mt-8 text-primary/40 font-rabar animate-pulse">بەرھەڤکرنا یاریێ...</p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col flex-1 h-full w-full ${isDark ? 'bg-black' : 'bg-mono-white'} overflow-hidden transition-colors duration-500`}
      style={{ display: multiplayerState === 'match_starting' ? 'none' : 'flex' }}
    >
      {showCinematicOverlay && (
        <div className="fixed inset-0 z-9999 bg-[#020617] flex flex-col overflow-hidden text-white">
          {/* Top Half: Opponent */}
          <div className="flex-1 bg-red-700 border-b-4 border-red-900 flex flex-col items-center justify-center relative shadow-[inset_0_-30px_60px_rgba(0,0,0,0.3)]">
            <div className="ring-4 ring-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] rounded-full z-10">
              <Avatar src={activeMatch?.opp_avatar_url || opponent?.avatar_url} size="xl" />
            </div>
            <p className="mt-4 text-2xl font-rabar font-black text-white z-10">{opponent?.nickname || 'Opponent'}</p>
          </div>

          {/* Middle: VS */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-4 z-50 flex items-center justify-center">
            <Motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none"
            />
            <span className="relative font-black text-7xl sm:text-8xl italic bg-linear-to-b from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(245,158,11,0.8)] select-none">
              و
            </span>
          </div>
          {/* Countdown Badge */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-20 z-50 flex flex-col items-center">
            <div className="bg-black/60 px-8 py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-xl">
              <span className="text-4xl font-black text-white">{countdown}</span>
            </div>
          </div>

          {/* Bottom Half: User */}
          <div className="flex-1 bg-blue-700 border-t-4 border-blue-900 flex flex-col items-center justify-center relative shadow-[inset_0_30px_60px_rgba(0,0,0,0.3)]">
            <div className="ring-4 ring-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.4)] rounded-full z-10">
              <Avatar src={userAvatar} size="xl" />
            </div>
            <p className="mt-4 text-2xl font-rabar font-black text-white z-10">{userNickname || 'You'}</p>
          </div>
        </div>
      )}
      <style>
        {`
          .battlefield-container {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0;
            overflow: hidden;
            width: 100%;
          }
          @media (max-height: 700px) {
            .battle-item-padding {
              padding-top: 0.1rem !important;
              padding-bottom: 0.1rem !important;
            }
            .riddle-text {
              font-size: clamp(0.55rem, 3.2vw, 1.1rem) !important;
              line-height: 1.2 !important;
              white-space: normal !important;
              font-weight: 300 !important;
              text-align: center;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
          }
          .riddle-text {
            white-space: normal !important;
            line-height: 1.2 !important;
            font-size: clamp(0.6rem, 3.5vw, 1.25rem) !important;
            text-align: center;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}
      </style>

      {/* 0. ACTION TOP BAR */}
      <div className="absolute top-0 left-0 right-0 z-400 pt-[env(safe-area-inset-top)] px-4 h-14 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto relative">
          <button
            onClick={() => { playPopSound(); setIsMenuOpen(true); }}
            className={`w-10 h-10 flex items-center justify-center rounded-md transition-all ${isDark ? 'bg-black/60 text-white/80 hover:bg-black/80' : 'bg-white/80 text-slate-700 hover:bg-white'} backdrop-blur-md shadow-lg border ${isDark ? 'border-white/10' : 'border-slate-200'}`}
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <>
                <Motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-10"
                  onClick={() => setIsMenuOpen(false)}
                />

                <Motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10, x: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10, x: 20 }}
                  className={`absolute top-12 right-0 w-48 rounded-md shadow-2xl border backdrop-blur-xl z-20 overflow-hidden ${isDark ? 'bg-black/90 border-white/10' : 'bg-white/95 border-slate-200'}`}
                  dir="rtl"
                >
                  <div className="flex flex-col py-1">
                    <button
                      onClick={() => {
                        playPopSound();
                        setIsMenuOpen(false);
                        _onOpenHowToPlay?.();
                      }}
                      className={`flex items-center gap-3 px-4 py-3 text-[13px] font-black font-rabar transition-colors ${isDark ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">help</span>
                      ڕێنمایی
                    </button>

                    <div className={`h-px w-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

                    <button
                      onClick={() => {
                        playPopSound();
                        setIsMenuOpen(false);
                        _cancelMatch?.();
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-[13px] font-black font-rabar text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      دەرکەفتن
                    </button>
                  </div>
                </Motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-1" />
      </div>

      {/* 1. SYMMETRIC BATTLEFIELD */}
      <div className="battlefield-container no-scrollbar pt-[calc(env(safe-area-inset-top)+52px)]" dir="rtl">

        {/* RIDDLE DISPLAY */}
        <div className={`w-full h-12 sm:h-14 flex flex-col items-center justify-center px-4 animate-in fade-in duration-700 shrink-0 ${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-slate-50 border-b border-slate-200'}`}>
          <p className={`text-lg sm:text-2xl font-light ${isDark ? 'text-white' : 'text-slate-800'} font-noto-sans-arabic ${isDark ? 'drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]' : ''} riddle-text w-full`}>
            {activeMatch?.riddles?.[currentRound % (activeMatch?.riddles?.length || 1)] || '...'}
          </p>
        </div>

        {/* TOP HALF: YOUR GRID */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-1 bg-white/2">
          <div className="flex items-center gap-2 opacity-90 mb-1">
            <Avatar src={userAvatar} size="sm" />
            <span className="text-xs sm:text-sm font-black text-blue-400 uppercase">{userNickname}</span>
          </div>
          <div className="w-full flex justify-center items-center overflow-hidden" dir="rtl">
            <Grid
              gridId="player"
              guesses={guesses}
              currentGuess={currentGuess}
              targetWord={targetWord || ''}
              wordLength={targetWord?.length || 5}
              getLetterStatus={getLetterStatus}
              isDark={isDark}
              compact={true}
              maxRows={3}
            />
          </div>
        </div>

        {/* CENTER VS BAR: THE SCORES & ROUND */}
        <div className="shrink-0 flex items-center justify-center h-10 w-full z-20 relative">
          {/* Background Horizontal Line */}
          <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 bg-linear-to-r from-transparent via-${isDark ? 'white/10' : 'slate-300/60'} to-transparent h-px w-full`} />

          {/* Score & Round Pill */}
          <div className={`flex items-center gap-4 ${isDark ? 'bg-black/80 border-mono-800' : 'bg-white/90 border-slate-200 shadow-sm'} backdrop-blur-md px-4 py-1.5 rounded-md border relative z-10`}>
            <div className="flex items-center justify-center min-w-[24px]">
              <span className={`text-sm font-black ${isDark ? 'text-blue-400' : 'text-blue-600'} leading-none tabular-nums`}>
                {toKuDigits(isPlayer1 ? scores?.p1 : scores?.p2)}
              </span>
            </div>

            <div className={`w-px h-4 ${isDark ? 'bg-white/10' : 'bg-slate-300/80'}`} />

            <div className={`text-sm font-black ${isDark ? 'text-white/60' : 'text-slate-600'} uppercase px-1`}>
              گەڕ {toKuDigits((currentRound || 0) + 1)}
            </div>

            <div className={`w-px h-4 ${isDark ? 'bg-white/10' : 'bg-slate-300/80'}`} />

            <div className="flex items-center justify-center min-w-[24px]">
              <span className={`text-sm font-black ${isDark ? 'text-red-400' : 'text-red-600'} leading-none tabular-nums`}>
                {toKuDigits(isPlayer1 ? scores?.p2 : scores?.p1)}
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM HALF: OPPONENT GRID */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-1 bg-black/10">
          <div className="w-full flex justify-center items-center overflow-hidden" dir="rtl">
            <Grid
              gridId="opponent"
              opponentStatuses={opponentGuesses}
              wordLength={targetWord?.length || 5}
              maxRows={3}
              hideLetters={true}
              targetWord={targetWord || ''}
              getLetterStatus={(guess, i) => {
                // For opponent's completed rows, we use the pre-calculated colors
                if (Array.isArray(guess)) return guess[i] || '';
                return '';
              }}
              compact={true}
              activeRowIndex={opponentGuesses.length}
              opponentLiveStatuses={opponentLiveStatuses}
              opponentLiveCursor={opponentLiveCursor}
              isDark={isDark}
            />
          </div>
          <div className="flex items-center gap-2 opacity-90 mt-1">
            <span className="text-xs sm:text-sm font-black text-red-400 uppercase">{opponent?.nickname || 'چاڤەڕێ'}</span>
            <Avatar src={activeMatch?.opp_avatar_url || opponent?.avatar_url} size="sm" />
          </div>
        </div>
      </div>

      {/* 3. KEYBOARD (Pinned to bottom via Flex) */}
      <div className={`shrink-0 w-full z-50 p-2 ${isDark ? 'bg-black/40' : 'bg-mono-50'} pb-[max(env(safe-area-inset-bottom),16px)] m-0 border-t ${isDark ? 'border-white/5' : 'border-mono-200 shadow-lg'} relative`}>
        {/* WAITING FOR OPPONENT OVERLAY */}
        <AnimatePresence>
          {guesses.length >= 3 && multiplayerState === 'playing' && !isRoundWinner && (
            <Motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none"
            >
              <div className={`backdrop-blur-md px-4 py-2 rounded-full text-xs font-noto-sans-arabic flex items-center gap-2 shadow-lg border ${isDark ? 'bg-black/80 border-white/10 text-white/90' : 'bg-white/90 border-slate-200 text-slate-800'}`}>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>چاڤەڕێی یاریزانێ بەرامبەربە...</span>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>

        <Keyboard
          onKey={onKey}
          onDelete={onDelete}
          onEnter={onEnter}
          usedKeys={usedKeys}
          gameState={(multiplayerState === 'game_over' || isRoundWinner) ? 'won' : (guesses.length >= 3 ? 'lost' : 'playing')}
          hidePowerups={true}
          isDark={isDark}
        />
      </div>

      {/* TEKKEN-STYLE CINEMATIC ROUND INTRO */}
      <RoundIntro
        opponent={opponent}
        userAvatar={userAvatar}
        userNickname={userNickname}
        userLevel={userLevel}
        currentRound={currentRound}
        roundMessage={roundMessage}
        previousWord={activeMatch?.current_word_index > 0 ? activeMatch?.words?.[activeMatch.current_word_index - 1] : null}
      />


      {/* 6. FORFEIT PENDING (GRACE PERIOD) OVERLAY */}
      <AnimatePresence>
        {forfeitStatus === 'pending' && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-700 bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 text-center"
          >
            <Motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-amber-500/10 border-2 border-amber-500/30 p-10 rounded-[40px] shadow-2xl max-w-sm w-full"
            >
              <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl text-amber-400 animate-pulse">wifi_off</span>
              </div>
              <h2 className="text-2xl font-black text-white mb-2 leading-tight font-noto-sans-arabic">
                هێل یا هاتییە بڕین...
              </h2>
              <p className="text-amber-100/60 text-lg font-bold mb-6 font-noto-sans-arabic">
                چاڤەڕێبە {forfeitCountdown} چرکەیان
              </p>

              <div className="flex items-center justify-center gap-3">
                <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                {/* English Text Removed */}
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}




