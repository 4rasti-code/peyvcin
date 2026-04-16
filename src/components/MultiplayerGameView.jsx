import React, { useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Grid from './Grid';
import Keyboard from './Keyboard';
import { useMultiplayer } from '../context/MultiplayerContext';
import { useGame } from '../context/GameContext';
import useGameLogic from '../hooks/useGameLogic';
import Avatar from './Avatar';
import KurdishSunLoader from './KurdishSunLoader';

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
    fetchOpponentProfile
  } = useMultiplayer();

  // Prioritize Prop over Context to force re-renders from App.jsx
  const opponent = propOpponent || contextOpponent;
  
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
      playStartSound();
    }
  }, [currentRound, targetWord, resetLocalBoard, playStartSound]);

  // --- GUARDS & EARLY RETURNS (Declare AFTER all hooks) ---
  if (!activeMatch) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
        <KurdishSunLoader />
        <p className="mt-8 text-white/40 font-noto-sans-arabic animate-pulse">بەرهەڤکرنا پەیڤان...</p>
      </div>
    );
  }

  if (multiplayerState === 'game_over') {
    return (
      <GameOverView 
        scores={scores} 
        user={user} 
        opponent={opponent} 
        isPlayer1={isPlayer1}
        onReturn={() => setMultiplayerState('idle')} 
      />
    );
  }

  if (multiplayerState === 'waiting') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020617] text-white">
        <KurdishSunLoader />
        <p className="mt-8 text-emerald-100/40 font-rabar animate-pulse">بەرهەڤکرنا یاریێ...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[#020617] overflow-hidden">
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
        <div className="flex flex-col items-center">
            <div className="text-[10px] bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-black mb-1">BATTLE</div>
            <div className="text-xs font-black text-white/30 truncate">گەڕ {currentRound}/3</div>
        </div>

        {/* LEFT (Last child in RTL): YOU */}
        <div className="flex items-center gap-3 text-left">
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
          <span className="text-[10px] font-black text-white/20 mb-2 uppercase tracking-widest px-4">پەیڤا {opponent?.nickname || 'هەڤڕکی'}</span>
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

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {roundMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[400] bg-white/10 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-white font-black tracking-wide text-sm">{roundMessage}</span>
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
    </div>
  );
}

// PREMIUM RESULTS SCREEN COMPONENT
function GameOverView({ scores, user, opponent, isPlayer1, onReturn }) {
  const myScore = isPlayer1 ? scores.p1 : scores.p2;
  const oppScore = isPlayer1 ? scores.p2 : scores.p1;
  const won = myScore > oppScore;
  const draw = myScore === oppScore;

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-500/20 blur-[80px] rounded-full" />
        
        <h1 className="text-4xl font-black text-white mb-2 font-noto-sans-arabic">یاری ب دوماهیک هات</h1>
        <p className="text-white/40 mb-12 font-noto-sans-arabic">ئەنجامێن دوماهیێ</p>

        <div className="flex items-center justify-around mb-12">
          {/* YOU */}
          <div className="flex flex-col items-center gap-3">
             <div className="relative">
                <Avatar src={user?.avatar_url} size="md" />
                {myScore >= oppScore && <span className="absolute -top-2 -right-2 text-2xl">👑</span>}
             </div>
             <span className="text-white text-2xl font-black">{myScore}</span>
             <span className="text-xs text-white/40 uppercase font-black">تۆ (YOU)</span>
          </div>

          <div className="text-white/10 text-4xl font-black italic">VS</div>

          {/* FOE */}
          <div className="flex flex-col items-center gap-3">
             <div className="relative">
                <Avatar src={opponent?.avatar_url} size="md" />
                {oppScore >= myScore && <span className="absolute -top-2 -right-2 text-2xl">👑</span>}
             </div>
             <span className="text-white text-2xl font-black">{oppScore}</span>
             <span className="text-xs text-white/40 uppercase font-black">هەڤڕک (FOE)</span>
          </div>
        </div>

        <div className="bg-white/5 rounded-3xl p-6 mb-8 border border-white/5">
           <h2 className="text-2xl font-black text-emerald-400 font-noto-sans-arabic">
             {won ? 'تە سەرکەفتن ئینا! 🎉' : draw ? 'هەردووک وەکهەڤ! 🤝' : 'تو دۆڕاندی، جەرباندنەکا دی بکە!'}
           </h2>
        </div>

        <button 
          onClick={onReturn}
          className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-white/5"
        >
          ڤەگەڕیا سەرەکی (Main Menu)
        </button>
      </div>
    </div>
  );
}
