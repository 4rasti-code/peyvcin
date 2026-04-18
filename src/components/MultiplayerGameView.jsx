import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Grid from './Grid';
import Keyboard from './Keyboard';
import { useMultiplayer } from '../context/MultiplayerContext';
import { useGame } from '../context/GameContext';
import useGameLogic from '../hooks/useGameLogic';
import Avatar from './Avatar';
import KurdishSunLoader from './KurdishSunLoader';
import { triggerHaptic } from '../utils/haptics';

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
    cancelMatch
  } = useMultiplayer();

  // Prioritize Prop over Context to force re-renders from App.jsx
  const opponent = propOpponent || contextOpponent;
  
  const [isConfirmingExit, setIsConfirmingExit] = useState(false);
  
  const { user, userNickname, userAvatar, playPopSound, playVictorySound, playStartSound } = useGame();
  
  // 1. TOP-LEVEL DERIVED DATA (DECLARE BEFORE ANY RETURNS)
  const isPlayer1 = useMemo(() => activeMatch?.player1_id === user?.id, [activeMatch, user]);
  const targetWord = useMemo(() => {
    if (!activeMatch?.words) return '';
    return (activeMatch.words[currentRound]) || (activeMatch.words[0]) || '';
  }, [activeMatch, currentRound]);

  // CORE ENGINE
  const onGuessSubmitted = useCallback(async (colors, isWin) => {
    if (isWin) {
        await submitGuess(colors, true);
        playVictorySound();
    } else {
        broadcastGuess(colors, false);
        playPopSound(true);
    }
  }, [submitGuess, broadcastGuess, playVictorySound, playPopSound]);

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
    onGuessSubmitted
  });

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
    <div className="flex flex-col h-dvh bg-[#020617] overflow-">
      <style>
        {`
          .battle-grid-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 8px 0;
            flex: 1;
            min-height: 0;
          }
        `}
      </style>
      
      {/* 1. SCOREBOARD (Dedicated Header) */}
      <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
        {/* RIGHT (First child in RTL): OPPONENT */}
        <div className="flex items-center gap-3 text-right">
          <motion.div
            animate={{ opacity: (activeMatch?.opp_avatar_url || opponent?.avatar_url) ? 1 : 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <Avatar src={activeMatch?.opp_avatar_url || opponent?.avatar_url} size="sm" />
          </motion.div>
          <div className="flex flex-col text-right">
            <span className="text-sm font-black text-amber-400 truncate max-w-[100px]">
              {(activeMatch?.opp_nickname || opponent?.nickname || 'چاڤەڕێ...').toUpperCase()}
            </span>
            <span className="text-xl font-black text-white">{isPlayer1 ? scores.p2 : scores.p1}</span>
          </div>
        </div>

        {/* CENTER: ROUND & VS */}
        <div className="flex flex-col items-center relative">
            <div className="text-[10px] bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-black mb-1">BATTLE</div>
            <div className="text-xs font-black text-white/30 truncate">گەڕ {currentRound}/3</div>
        </div>

        {/* LEFT (Last child in RTL): YOU */}
        <div className="flex items-center gap-4 text-left">
          <div className="flex flex-col text-left">
            <span className="text-sm font-black text-emerald-400 truncate max-w-[100px]">{(userNickname || 'یاریزان').toUpperCase()}</span>
            <span className="text-xl font-black text-white">{isPlayer1 ? scores.p1 : scores.p2}</span>
          </div>
          <Avatar src={userAvatar} size="sm" />
        </div>
      </div>


      {/* 2. SYMMETRIC BATTLEFIELD */}
      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar" dir="rtl">
        
        {/* RIDDLE DISPLAY (Classic Mode Style) */}
        <div className="w-full flex flex-col items-center justify-center py-4 px-2 animate-in fade-in duration-700">
          <div className="w-full max-w-2xl flex items-center justify-center text-center relative z-10">
            <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed font-noto-sans-arabic drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              {activeMatch?.riddles?.[currentRound] || '...'}
            </p>
          </div>
          <div className="w-[65%] h-[0.5px] bg-white/10 rounded-full mt-2" />
        </div>

        {/* TOP HALF: YOUR GUESSES */}
        <div className="flex flex-col items-center justify-center py-4 border-b border-white/5 w-full">
          <span className="text-[10px] font-black text-white/20 mb-2 uppercase tracking-widest px-4">پەیڤا {userNickname}</span>
          <div className="w-full flex justify-center" dir="rtl">
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

        {/* BOTTOM HALF: OPPONENT PROGRESS */}
        <div className="flex flex-col items-center justify-center py-4 w-full">
          <span className="text-[10px] font-black text-white/20 mb-2 uppercase tracking-widest px-4">پەیڤا {opponent?.nickname || 'ھەڤڕکی'}</span>
          <div className="w-full flex justify-center" dir="rtl">
            <Grid 
              opponentStatuses={opponentGuesses}
              wordLength={targetWord.length}
              maxRows={3}
              hideLetters={true}
              targetWord={targetWord}
              getLetterStatus={() => ''}
              compact={true}
              activeRowIndex={opponentGuesses.length}
            />
          </div>
        </div>
      </div>

      {/* 3. KEYBOARD (With hidePowerups=true) */}
      <div className="p-2 bg-black/20 pb-8">
        <Keyboard 
          onKey={onKey} 
          onDelete={onDelete} 
          onEnter={onEnter} 
          usedKeys={usedKeys}
          gameState={guesses.length >= 3 ? 'lost' : 'playing'}
          hidePowerups={true}
        />
      </div>

      {/* AGGRESSIVE VERSUS CLASH OVERLAY */}
      <AnimatePresence>
        {roundMessage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-500 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-8 overflow-"
          >
            {/* Background Clash Elements */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.2 }}
              transition={{ duration: 0.5 }}
              className="absolute w-full h-40 bg-red-600 blur-[120px]"
            />
            
            <div className="relative z-10 w-full flex flex-col items-center gap-12">
              <div className="flex items-center justify-center gap-4 sm:gap-12 w-full max-w-2xl px-4">
                {/* YOU (Left) */}
                <motion.div 
                  initial={{ x: -200, opacity: 0, rotate: -15 }}
                  animate={{ x: 0, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="relative">
                    <div className="absolute -inset-2 bg-emerald-500/20 blur-xl rounded-full" />
                    <Avatar src={userAvatar} size="2xl" className="relative border-4 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.3)]" border={false} />
                  </div>
                  <span className="text-emerald-400 font-black text-lg tracking-wider uppercase drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">{userNickname}</span>
                </motion.div>

                {/* VS Center */}
                <motion.div 
                   initial={{ scale: 3, opacity: 0, rotate: 45 }}
                   animate={{ scale: 1, opacity: 1, rotate: 0 }}
                   transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.3 }}
                   className="flex flex-col items-center"
                >
                   <div className="text-7xl sm:text-9xl font-black text-red-600 italic tracking-tighter drop-shadow-[0_0_30px_rgba(220,38,38,0.8)]">VS</div>
                    <motion.div 
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-white/60 font-black text-base uppercase tracking-[0.4em] mt-3 whitespace-nowrap font-noto-sans-arabic"
                    >
                      دەستپێکر
                    </motion.div>
                </motion.div>

                {/* FOE (Right) */}
                <motion.div 
                  initial={{ x: 200, opacity: 0, rotate: 15 }}
                  animate={{ x: 0, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="relative">
                    <div className="absolute -inset-2 bg-red-600/20 blur-xl rounded-full" />
                    <Avatar src={opponent?.avatar_url} size="2xl" className="relative border-4 border-red-600/50 shadow-[0_0_40px_rgba(220,38,38,0.3)]" border={false} />
                  </div>
                  <span className="text-red-500 font-black text-lg tracking-wider uppercase drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">{opponent?.nickname || 'هەڤڕک'}</span>
                </motion.div>
              </div>

              {/* ACTION TEXT */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-full py-8"
              >
                <h1 className="text-6xl sm:text-8xl font-black text-white font-noto-sans-arabic drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  گەڕ {currentRound + 1}
                </h1>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ROUND WINNER OVERLAY */}
      <AnimatePresence>
        {(isRoundWinner || winnerNickname) && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
          >
             <motion.div 
               initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }}
               className="bg-emerald-500/10 border-2 border-emerald-500/30 p-12 rounded-[40px] shadow-2xl"
             >
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                   <span className="material-symbols-outlined text-4xl text-emerald-400">celebration</span>
                </div>
                <h2 className="text-4xl font-black text-white mb-2 leading-tight">
                  {isRoundWinner ? 'تە پەیڤ دۆزییەوە!' : `${winnerNickname} پەیڤ دۆزییەوە!`}
                </h2>
                <p className="text-emerald-100/60 text-xl font-medium">خۆڕاگر بە، ڕاوندێن دی ل ڕێینە...</p>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
    </div>
  );
}


