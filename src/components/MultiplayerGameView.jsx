import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Grid from './Grid';
import Keyboard from './Keyboard';
import { useMultiplayer } from '../context/MultiplayerContext';
import { useGame } from '../context/GameContext';
import useGameLogic from '../hooks/useGameLogic';
import Avatar from './Avatar';
import KurdishSunLoader from './KurdishSunLoader';
import RoundIntro from './RoundIntro';
import { triggerHaptic } from '../utils/haptics';
import { toKuDigits } from '../utils/formatters';

export default function MultiplayerGameView({ opponent: propOpponent }) {
  const { 
    activeMatch, 
    opponent: contextOpponent, 
    submitGuess, 
    broadcastGuess,
    opponentGuesses, 
    scores, 
    currentRound,
    isRoundWinner,
    winnerNickname,
    roundMessage,
    multiplayerState,
    setMultiplayerState,
    fetchOpponentProfile,
    resetMatchResultTrigger,
    forfeitStatus,
    forfeitCountdown,
    triggerForfeitVictory,
    submitFailure,
    cancelMatch,
    broadcastLiveAction,
    opponentLiveStatuses,
    opponentLiveCursor
  } = useMultiplayer();

  // Prioritize Prop over Context to force re-renders from App.jsx
  const opponent = propOpponent || contextOpponent;
  
  const [isConfirmingExit, setIsConfirmingExit] = useState(false);
  
  const { user, userNickname, userAvatar, level: userLevel, playPopSound, playVictorySound, playStartSound } = useGame();
  
  // 1. TOP-LEVEL DERIVED DATA (DECLARE BEFORE ANY RETURNS)
  const isPlayer1 = useMemo(() => activeMatch?.player1_id === user?.id, [activeMatch, user]);
  const targetWord = useMemo(() => {
    if (!activeMatch?.words?.length) return '';
    // Safe modulo access in case of extreme round counts
    const idx = currentRound % activeMatch.words.length;
    return activeMatch.words[idx] || '';
  }, [activeMatch, currentRound]);

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
      console.log('[Multiplayer] Round Loss detected locally. Submitting failure.');
      await submitFailure();
    }
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
  }, [currentRound, targetWord, resetLocalBoard, playStartSound]);

  // --- GUARDS & EARLY RETURNS (Declare AFTER all hooks) ---
  if (!activeMatch) {
    return (
      <div className="h-full bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
        <KurdishSunLoader />
        <p className="mt-8 text-white/40 font-noto-sans-arabic animate-pulse">بەرھەڤکرنا پەیڤان...</p>
      </div>
    );
  }

  if (multiplayerState === 'waiting') {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#020617] text-white">
        <KurdishSunLoader />
        <p className="mt-8 text-emerald-100/40 font-rabar animate-pulse">بەرھەڤکرنا یاریێ...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-[#020617] overflow-hidden">
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
              line-height: 1 !important;
              white-space: nowrap !important;
              font-weight: 300 !important;
            }
          }
          .riddle-text {
            white-space: nowrap !important;
            font-size: clamp(0.6rem, 3.5vw, 1.25rem) !important;
          }
        `}
      </style>
      
      {/* 1. SYMMETRIC BATTLEFIELD */}
      <div className="battlefield-container no-scrollbar pt-[calc(env(safe-area-inset-top)+8px)]" dir="rtl">
        
        {/* RIDDLE DISPLAY */}
        <div className="w-full flex flex-col items-center justify-center py-3 px-4 animate-in fade-in duration-700 shrink-0 bg-white/5 border-b border-white/5">
          <p className="text-lg sm:text-2xl font-light text-white leading-none font-noto-sans-arabic drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] riddle-text">
            {activeMatch?.riddles?.[currentRound % (activeMatch?.riddles?.length || 1)] || '...'}
          </p>
        </div>

        {/* TOP HALF: YOUR GRID */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-1 w-full bg-white/[0.01]">
          <div className="flex items-center gap-2 opacity-60 scale-90">
             <Avatar src={userAvatar} size="xs" />
             <span className="text-[10px] font-black text-emerald-400 uppercase">{userNickname}</span>
          </div>
          <div className="w-full flex justify-center overflow-hidden" dir="rtl">
            <Grid 
              guesses={guesses}
              currentGuess={currentGuess}
              wordLength={targetWord.length}
              getLetterStatus={getLetterStatus}
              maxRows={3}
              targetWord={targetWord}
              compact={true}
            />
          </div>
        </div>

        {/* CENTER VS BAR: THE SCORES & ROUND */}
        <div className="shrink-0 flex items-center justify-center gap-4 py-2 z-20 relative">
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent h-[1px] top-1/2 -translate-y-1/2 w-full" />
           
           <div className="flex items-center gap-3 bg-[#020617] px-4 py-1 rounded-full border border-white/10 shadow-2xl relative z-10">
              <div className="flex items-center gap-2">
                 <span className="text-[14px] font-black text-emerald-400 leading-none">{toKuDigits(isPlayer1 ? scores.p1 : scores.p2)}</span>
              </div>
              <div className="w-[1px] h-3 bg-white/10 mx-1" />
              <div className="text-[10px] font-black text-white/40 uppercase tracking-tighter">گەڕ {toKuDigits(currentRound + 1)}</div>
              <div className="w-[1px] h-3 bg-white/10 mx-1" />
              <div className="flex items-center gap-2">
                 <span className="text-[14px] font-black text-amber-400 leading-none">{toKuDigits(isPlayer1 ? scores.p2 : scores.p1)}</span>
              </div>
           </div>
        </div>

        {/* BOTTOM HALF: OPPONENT GRID */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-1 w-full bg-black/10">
          <div className="w-full flex justify-center overflow-hidden" dir="rtl">
            <Grid 
              opponentStatuses={opponentGuesses}
              wordLength={targetWord.length}
              maxRows={3}
              hideLetters={true}
              targetWord={targetWord}
              getLetterStatus={() => ''}
              compact={true}
              activeRowIndex={opponentGuesses.length}
              opponentLiveStatuses={opponentLiveStatuses}
              opponentLiveCursor={opponentLiveCursor}
            />
          </div>
          <div className="flex items-center gap-2 opacity-60 scale-90">
             <span className="text-[10px] font-black text-amber-400 uppercase">{opponent?.nickname || 'چاڤەڕێ'}</span>
             <Avatar src={activeMatch?.opp_avatar_url || opponent?.avatar_url} size="xs" />
          </div>
        </div>
      </div>

      {/* 3. KEYBOARD (Pinned to bottom via Flex) */}
      <div className="shrink-0 w-full z-50 p-2 bg-[#020617]/40 pb-[max(env(safe-area-inset-bottom),16px)] m-0 border-t border-white/5">
        <Keyboard 
          onKey={onKey} 
          onDelete={onDelete} 
          onEnter={onEnter} 
          usedKeys={usedKeys}
          gameState={guesses.length >= 3 ? 'lost' : 'playing'}
          hidePowerups={true}
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
      />

      {/* FLOATING EXIT BUTTON (TOP LEFT - BELOW HEADER) */}
      <div className="fixed top-40 left-4 z-[450]">
        <motion.button 
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { triggerHaptic(10); setIsConfirmingExit(true); }}
          className="w-7 h-7 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-[#ef4444] shadow-2xl transition-colors"
        >
          <span className="material-symbols-outlined text-base font-black rotate-180">logout</span>
        </motion.button>
      </div>

      {/* 5. CONFIRM EXIT OVERLAY */}
      <AnimatePresence>
        {isConfirmingExit && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] bg-[#020617]/95 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="w-full max-w-sm bg-white/5 border border-white/10 rounded-[40px] p-10 text-center"
            >
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl text-red-500">logout</span>
              </div>
              
              <h2 className="text-2xl font-black text-white mb-2 font-noto-sans-arabic">پشتراستی؟</h2>
              <p className="text-white/40 mb-8 font-noto-sans-arabic">دێ دەست ژ یاریێ بەردەی و دەرکەڤی؟</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    triggerHaptic(20);
                    cancelMatch();
                  }}
                  className="h-16 bg-red-500 text-white rounded-2xl font-black text-lg active:scale-95 transition-all shadow-lg shadow-red-500/20"
                >
                  بەلێ، دەرکەفتن
                </button>
                <button 
                  onClick={() => setIsConfirmingExit(false)}
                  className="h-16 bg-white/5 text-white/60 rounded-2xl font-bold active:scale-95 transition-all"
                >
                  نەخێر، مانەوە
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. FORFEIT PENDING (GRACE PERIOD) OVERLAY */}
      <AnimatePresence>
        {forfeitStatus === 'pending' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[700] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 text-center"
          >
            <motion.div 
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


