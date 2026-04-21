import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopAppBar from './components/TopAppBar';
import Avatar from './components/Avatar';
import { triggerHaptic } from './utils/haptics';
import InfoBar from './components/InfoBar';
import Grid from './components/Grid';
import Keyboard from './components/Keyboard';
import CategoryModal from './components/CategoryModal';
import BottomNav from './components/BottomNav';
import LobbyView from './components/LobbyView';
import DictionaryView from './components/DictionaryView';
import { getRandomWordFromCategory, wordList } from './data/wordList';
import { STATUS } from './data/constants';
import { getLocalDateString } from './utils/formatters';

import useMultiplayer from './hooks/useMultiplayer';
import { calculateLevelRewards, calculateDefeatPenalty } from './utils/gameStatus';
import useGameLogic from './hooks/useGameLogic';
import { AVATARS } from './data/avatars';

import { initAudio, startBackgroundMusic, stopBackgroundMusic, forceResumeAudio } from './utils/audio';
import { normalizeKurdishInput } from './utils/textUtils';
import { getRewardForMode } from './utils/progression';

// Resilient Lazy Loading Guard: Automatically reloads the page if a chunk fails to load 
// (common after new deployments where asset hashes change).
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenReloaded = JSON.parse(
      window.sessionStorage.getItem('page-has-been-reloaded') || 'false'
    );
    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-reloaded', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenReloaded) {
        window.sessionStorage.setItem('page-has-been-reloaded', 'true');
        window.location.reload();
      }
      throw error;
    }
  });

const MultiplayerGameView = lazyWithRetry(() => import('./components/MultiplayerGameView'));

import { useGame } from './context/GameContext'; // Global Progression Context
import VictoryOverlay from './components/VictoryOverlay';
import CoinAnimation from './components/CoinAnimation';
import MasteryModal from './components/MasteryModal';
import LevelUpOverlay from './components/LevelUpOverlay';
import SettingsModal from './components/SettingsModal';
import WordFeverResultOverlay from './components/WordFeverResultOverlay';
import DefeatOverlay from './components/DefeatOverlay';
import AuthView from './components/AuthView';
import { supabase } from './lib/supabase';
import PrivacyPolicy from './components/PrivacyPolicy';
import DataDeletion from './components/DataDeletion';
import TermsOfService from './components/TermsOfService';
import ProfileView from './components/ProfileView';
import KurdishSunLoader from './components/KurdishSunLoader';
import DailyRewardModal from './components/DailyRewardModal';
import MultiplayerResultOverlay from './components/MultiplayerResultOverlay';




// Code Splitting for Performance with Guard
const LeaderboardView = lazyWithRetry(() => import('./components/LeaderboardView'));
const SocialHubView = lazyWithRetry(() => import('./components/SocialHubView'));
const ShopView = lazyWithRetry(() => import('./components/ShopView'));

const PEYVCIN_VERSION = '2.0.0';

// Audio logic handled via GameContext useGame()

// --- FAIL-SAFE: GAME ERROR BOUNDARY ---
class GameErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#0f172a] text-white p-8 text-center" style={{ fontFamily: 'Rabar, sans-serif' }}>
          <div className="bg-red-500/10 border-2 border-red-500/30 p-10 rounded-3xl shadow-2xl max-w-lg backdrop-blur-xl animate-in zoom-in-95">
            <h2 className="text-4xl font-black mb-6 text-red-500">ئاریشەیەک چێ بوو!</h2>
            <p className="text-white/70 mb-10 text-lg leading-relaxed">ببورە، ھندەک ئاریشەیێن تەکنیکی د دەستپێکرنا یاریێ دا ھەبوون. تکایە دووبارە پەیجێ نوو بکە یان ڤەگەرە لابیێ.</p>
            <div className="flex flex-col gap-4">
              <button onClick={() => window.location.reload()} className="bg-primary text-white px-10 py-5 rounded-2xl font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all">نووکرنا پەیجێ</button>
              <button onClick={() => window.location.href = '/'} className="bg-white/5 border border-white/10 text-white/60 px-10 py-5 rounded-2xl font-bold hover:bg-white/10 transition-all">ڤەگەر بۆ سەرەکی</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- UI SUB-COMPONENTS (HOISTED FOR PERFORMANCE) ---
const ScrollingMatchFinder = ({ opponent }) => {
  const [randomPool] = useState(() =>
    [...AVATARS, ...AVATARS].sort(() => 0.5 - Math.random())
  );

  return (
    <div className="relative w-32 h-32 rounded-full border-4 border-emerald-500/30 overflow-hidden bg-black/40 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
      <AnimatePresence mode="wait">
        {!opponent ? (
          <motion.div
            key="scrolling"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
            className="absolute inset-0"
          >
            <motion.div
              animate={{ y: [0, -1200] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="flex flex-col items-center"
            >
              {randomPool.map((av, i) => (
                <div key={i} className="w-32 h-32 flex items-center justify-center shrink-0">
                  <Avatar src={av.id} size="full" border={false} />
                </div>
              ))}
            </motion.div>
            {/* Vertical Blur & Fade Overlay */}
            <div className="absolute inset-0 bg-linear-to-b from-[#020617] via-transparent to-[#020617] opacity-60" />
          </motion.div>
        ) : (
          <motion.div
            key="found"
            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="absolute inset-0 flex items-center justify-center bg-emerald-500/10"
          >
            <Avatar src={opponent.avatar_url} size="full" border={false} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState('lobby');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDailyRewardOpen, setIsDailyRewardOpen] = useState(false);
  const [activeChatPartner, setActiveChatPartner] = useState(null);
  const [initialSocialTab, setInitialSocialTab] = useState(null);


  const [targetWord, setTargetWord] = useState('');
  const [targetHint, setTargetHint] = useState('');
  const [category, setCategory] = useState('');

  const [isShaking, setIsShaking] = useState(false);
  const [, setStartTime] = useState(0);
  const [, setRewardAmount] = useState(0);
  const [rewardAmountXp, setRewardAmountXp] = useState(0);
  const [defeatBreakdown, setDefeatBreakdown] = useState({ base: 0, mistakes: 0, total: 0 });
  const [magnetUsedInRound, setMagnetUsedInRound] = useState(false);
  const [magnetDisabledKeys, setMagnetDisabledKeys] = useState([]);

  const [gameMode, setGameMode] = useState('classic'); // 'classic', 'word_fever', 'secret_word', 'mamak', 'hard_words'
  const [timeLeft, setTimeLeft] = useState(60);
  const [, setIsDailyActive] = useState(false);
  const [isSuccessSplash, setIsSuccessSplash] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState([]);
  const [hintTaps, setHintTaps] = useState(0);

  // Results & UI State
  const [victoryBreakdown, setVictoryBreakdown] = useState({
    awardAmount: 0,
    xpAdded: 0,
    greenCount: 0,
    yellowCount: 0,
    grayCount: 0
  });
  const [victoryCustomText, setVictoryCustomText] = useState(null);
  const [lastSolvedWord, setLastSolvedWord] = useState('');
  const [isForfeitConfirmOpen, setIsForfeitConfirmOpen] = useState(false);
  const [isWordFeverResultVisible, setIsWordFeverResultVisible] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [wordFeverResultType, setWordFeverResultType] = useState('win');
  const [isAppReady, setIsAppReady] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [hintLimitToast, setHintLimitToast] = useState({ visible: false, message: '' });
  const [isLevelingUp, setIsLevelingUp] = useState(false);

  const {
    level,
    winsTowardsSecret, resetSecretWordProgress,
    currentXP, maxXP, minXPForLevel, lastNotifiedLevel,
    fils, derhem, dinar,
    dailyStreak,
    lastRewardClaimedAt,
    magnetCount, hintCount, skipCount,

    ownedAvatars, equippedAvatar, unlockedThemes, currentTheme,
    solvedWords, playerStats,
    userNickname, userAvatar, city, isInKurdistan, countryCode,

    updateInventory,
    updateProfile,

    syncProgressToDatabase,

    appSoundsEnabled, setAppSoundsEnabled,
    hapticEnabled, setHapticEnabled,
    appSfxVolume, updateSfxVolume,
    bgMusicVolume, updateMusicVolume,
    playPopSound, playNotifSound, playMessageSound,
    playStartGameSound, playVictorySound, playRewardSound, playPurchaseSound, playBoosterSound, playBubblePopSound,
    playSettingsOpenSound, playSettingsCloseSound,
    playTabSound, startBGM, stopBGM,
    user, setUser,
    userRank, refreshRank,
    loading: isGameLoading
  } = useGame();

  const {
    matchId,
    multiplayerState,
    matchmakingTime,
    opponent,
    cancelMatch,
    startMatchmaking,
    lastMatchResult,
    matchReward,
    scores,
    matchResultTrigger,
    resetMatchResultTrigger,
    submitFailure,
    forfeitStatus,
    isForfeitWin
  } = useMultiplayer();

  // TRANSITION: Return to Lobby when Match ends (Multiplayer High-Speed Flow)
  useEffect(() => {
    if (multiplayerState === 'game_over') {
      setCurrentView('lobby');
    }
  }, [multiplayerState]);

  const [notificationsList, setNotificationsList] = useState([]);
  const [socialNotifications, setSocialNotifications] = useState({ unreadMessages: 0, pendingRequests: 0 });



  // 5. Notification Sound Trigger (Distinguishing between messages and others)
  const prevNotifCount = useRef(0);
  useEffect(() => {
    if (notificationsList.length > prevNotifCount.current) {
      // Find the newest notification to check its type
      const latest = notificationsList[0];
      if (latest && latest.type === 'message') {
        playMessageSound();
      } else {
        playNotifSound();
      }
    }
    prevNotifCount.current = notificationsList.length;
  }, [notificationsList, playNotifSound, playMessageSound]);


  // --- CORE GAME ENGINE (Unified) ---
  const handleGameCompletion = useCallback(async (finalGuesses, isWin, forcedMode = null, forcedTarget = null, precalcBreakdown = null, precalcPenalty = null) => {
    const { targetWord: refTWord, solvedWords: sWords, gameMode: refGMode, winsTowardsSecret: wts, fils: currFils } = gameRefs.current;
    
    // Prioritize passed arguments over refs to avoid race conditions
    const tWord = forcedTarget || refTWord;
    const gMode = forcedMode || refGMode;
    
    if (isWin) {
      const nextSolved = [...sWords, tWord];
      const breakdown = precalcBreakdown || calculateLevelRewards(tWord, finalGuesses, gMode);
      
      // Ensure local state is current (redundant safety)
      setVictoryBreakdown(breakdown);
      setRewardAmount(breakdown.awardAmount);
      setRewardAmountXp(breakdown.xpAdded);

      // Synced database call
      let nextWinsTowardsSecret = wts;
      let resetSecretProgress = false;
      if (gMode !== 'secret_word') {
        nextWinsTowardsSecret = Math.min(3, wts + 1);
      } else {
        resetSecretProgress = true;
      }

      const syncData = await syncProgressToDatabase(
        tWord.length,
        gMode,
        {
          solvedWords: nextSolved,
          winsTowardsSecret: nextWinsTowardsSecret,
          resetSecretProgress,
          filsBonus: breakdown.awardAmount
        }
      );
      // Extra verification from server if needed (Optional: syncData.xpAdded can overwrite if different)
      if (syncData?.xpAdded !== undefined) {
        setRewardAmountXp(syncData.xpAdded);
      }
    } else {
      const penaltyBreakdown = precalcPenalty || calculateDefeatPenalty(tWord, finalGuesses, gMode);
      setDefeatBreakdown(penaltyBreakdown);
      const nextFils = Math.max(0, Math.ceil(currFils - penaltyBreakdown.total));
      updateInventory({ fils: nextFils }, false);
    }
  }, [syncProgressToDatabase, updateInventory]); // Stable dependencies

  const onWinHandler = useCallback((finalGuesses, winWord, winMode) => {
    const { hapticEnabled: hEnabled } = gameRefs.current;
    
    // 1. Calculate Rewards IMMEDIATELY from snapshots
    const breakdown = calculateLevelRewards(winWord, finalGuesses, winMode);
    
    // 2. Population states BEFORE showing overlay
    setVictoryBreakdown(breakdown);
    setRewardAmount(breakdown.awardAmount);
    setRewardAmountXp(breakdown.xpAdded);
    setLastSolvedWord(winWord);

    if (winMode === 'word_fever') {
      setIsWordFeverResultVisible(true);
      setWordFeverResultType('win');
      playRewardSound();
      setIsSuccessSplash(true);
      setTimeout(() => setIsSuccessSplash(false), 1000);
    } else {
      if (hEnabled) triggerHaptic(25);
    }
    
    // 3. Trigger completion (Async DB sync)
    handleGameCompletion(finalGuesses, true, winMode, winWord, breakdown);
  }, [handleGameCompletion, playRewardSound]);

  const onLossHandler = useCallback((finalGuesses, lossWord, lossMode) => {
    const { hapticEnabled: hEnabled, multiplayerState: mState } = gameRefs.current;
    
    setLastSolvedWord(lossWord);
    
    // Calculate penalty snap
    const penalty = calculateDefeatPenalty(lossWord, finalGuesses, lossMode);
    setDefeatBreakdown(penalty);

    // If in multiplayer, trigger the failure scoring logic (Round based)
    if (mState === 'playing') {
      submitFailure();
      return;
    }

    if (lossMode === 'word_fever') {
      setWordFeverResultType('fail');
      setIsWordFeverResultVisible(true);
    } else {
      handleGameCompletion(finalGuesses, false, lossMode, lossWord, null, penalty);
      if (lossMode === 'secret_word') resetSecretWordProgress();
    }
  }, [handleGameCompletion, resetSecretWordProgress, submitFailure]);

  const {
    guesses,
    currentGuess, setCurrentGuess,
    usedKeys,
    isVictory, setIsVictory,
    isDefeat, setIsDefeat,
    onKey, onDelete, onEnter,
    getLetterStatus,
    resetLocalBoard
  } = useGameLogic({
    targetWord,
    maxRows: gameMode === 'secret_word' ? 1 : (gameMode === 'word_fever' ? 3 : 6),
    gameMode,
    revealedIndices,
    isLevelingUp,
    onWin: onWinHandler,
    onLoss: onLossHandler
  });

  // --- UNIFIED AUTOMATIC BACKGROUND MUSIC (BGM) CONTROLLER ---
  // Ensures BGM is only active in main menu views and stops in all gameplay/matchmaking/auth states.
  useEffect(() => {
    if (!startBGM || !stopBGM || currentView === undefined) return;

    // Define where BGM SHOULD be active (Menu/Static Views)
    const menuViews = ['lobby', 'social_hub', 'store', 'leaderboard', 'stats', 'dictionary'];

    // Define where BGM SHOULD be suppressed (Gameplay/Transition/Auth)
    const isGameplayActive = currentView === 'game' ||
      multiplayerState === 'searching' ||
      multiplayerState === 'waiting' ||
      multiplayerState === 'playing' ||
      isVictory ||
      isDefeat ||
      isWordFeverResultVisible;

    const isAuth = currentView === 'auth';

    // Policy: Play music ONLY in menu views, and ONLY if gameplay is not active
    const shouldPlay = menuViews.includes(currentView) && !isGameplayActive && !isAuth && bgMusicVolume > 0;

    if (shouldPlay) {
      // Small safety delay for engine context initialization on first load
      const timer = setTimeout(() => {
        startBGM();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      stopBGM();
    }
  }, [currentView, multiplayerState, isVictory, isDefeat, isWordFeverResultVisible, bgMusicVolume, startBGM, stopBGM]);


  // Centralized Navigation (Fixes Ghost Overlays)
  const handleGoHome = useCallback(() => {
    setIsVictory(false);
    setIsDefeat(false);
    setVictoryBreakdown({ 
      awardAmount: 0, 
      xpAdded: 0, 
      greenCount: 0, 
      yellowCount: 0, 
      grayCount: 0 
    });
    setRewardAmountXp(0);
    setVictoryCustomText(null);
    setIsWordFeverResultVisible(false);
    setIsDailyActive(false);
    setCategory('');
    setTargetWord('');
    // Ensure full multiplayer reset when returning from any result screen
    if (cancelMatch) cancelMatch();
    setCurrentView('lobby');
  }, [setIsVictory, setIsDefeat, setIsWordFeverResultVisible, setIsDailyActive, setCategory, setTargetWord, cancelMatch, setCurrentView]);

  // Dynamic Hint Limit Logic
  const getMaxHintsForWord = useCallback((length) => {
    if (length <= 2) return 0;
    if (length <= 5) return 1;
    if (length <= 8) return 2;
    if (length <= 10) return 3;
    if (length <= 13) return 4;
    return 5;
  }, []);

  const showHintLimitToast = useCallback(() => {
    setHintLimitToast({ visible: true, message: 'هاریکاریێن تە ب دوماهیک هاتن' });
    triggerHaptic([50, 100, 50]); // Error haptic
    setTimeout(() => setHintLimitToast(prev => ({ ...prev, visible: false })), 3000);
  }, []);

  // --- NUCLEAR INP OPTIMIZATION: Ref-Synchronized Pattern ---
  // These refs mirror volatile state to keep handlers stable ([])
  const gameRefs = useRef({
    targetWord,
    category,
    hintCount,
    magnetCount,
    skipCount,
    isVictory,
    revealedIndices,
    currentGuess,
    magnetDisabledKeys,
    gameMode,
    hapticEnabled,
    solvedWords,
    level,
    lastSolvedWord,
    winsTowardsSecret,
    fils,
    targetHint,
    hintTaps
  });

  // Sync refs every time state changes
  useEffect(() => {
    gameRefs.current = {
      targetWord,
      category,
      hintCount,
      magnetCount,
      skipCount,
      isVictory,
      revealedIndices,
      currentGuess,
      magnetDisabledKeys,
      gameMode,
      hapticEnabled,
      solvedWords,
      level,
      lastSolvedWord,
      winsTowardsSecret,
      fils,
      targetHint,
      hintTaps
    };
  }, [targetWord, category, hintCount, magnetCount, skipCount, isVictory, revealedIndices, currentGuess, magnetDisabledKeys, gameMode, hapticEnabled, solvedWords, level, lastSolvedWord, winsTowardsSecret, fils, targetHint, hintTaps]);

  // Wrapped handlers to manage UI feedback (shaking, messages)
  // IDENTITY STABLE: These never change, preventing Keyboard re-renders
  const handleOnEnter = useCallback(async () => {
    const result = await onEnter();
    if (result?.error) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  }, [onEnter]);

  const handleHint = useCallback(() => {
    const { hintCount: hCount, isVictory: isV, targetWord: tWord, revealedIndices: rIdx, currentGuess: cGuess, hintTaps: hTaps } = gameRefs.current;

    // Dynamic Limit Check
    const dynamicLimit = getMaxHintsForWord(tWord.length);
    if (hTaps >= dynamicLimit && !isV) {
      showHintLimitToast();
      return;
    }

    if (hCount <= 0 || isV) return;
    const available = [];
    tWord.split('').forEach((char, i) => {
      if (!rIdx.includes(i) && cGuess[i] === '') available.push(i);
    });
    if (available.length === 0) return;

    triggerHaptic(20);
    playBoosterSound();
    const randomIndex = available[Math.floor(Math.random() * available.length)];
    setRevealedIndices(prev => [...prev, randomIndex]);
    setCurrentGuess(prev => {
      const next = [...prev];
      next[randomIndex] = tWord[randomIndex];
      return next;
    });

    updateInventory({
      hintCount: -1
    });
    setHintTaps(prev => prev + 1);
  }, [updateInventory]); // updateInventory is stable from GameContext

  const handleMagnet = useCallback(() => {
    const { magnetCount: mCount, isVictory: isV, targetWord: tWord, magnetDisabledKeys: mDisabled } = gameRefs.current;

    if (mCount <= 0 || isV) return;
    triggerHaptic(30);
    playBoosterSound();

    const alphabet = 'ئابپت جچحخد ڕزژسشعغفقکگ لڵمنوۆھەیێ'.replace(/\s/g, '').split('');
    const targetSet = new Set(tWord.split(''));
    const incorrect = alphabet.filter(char => !targetSet.has(char) && !mDisabled.includes(char));
    const toDisable = incorrect.sort(() => 0.5 - Math.random()).slice(0, 5);

    setMagnetDisabledKeys(prev => [...prev, ...toDisable]);
    setMagnetUsedInRound(true);
    updateInventory({
      magnetCount: -1
    });
  }, [updateInventory]); // updateInventory is stable from GameContext

  const handleSkip = useCallback(() => {
    const { skipCount: sCount, isVictory: isV, targetWord: tWord } = gameRefs.current;

    if (sCount <= 0 || isV) return;
    triggerHaptic(25);
    playBoosterSound();
    onEnter(tWord, true); // Use targetWord as forced guess
    updateInventory({
      skipCount: -1
    });
  }, [onEnter, updateInventory]); // onEnter and updateInventory are stable


  // TRIGGER LEVEL UP UI (Standardized)
  useEffect(() => {
    // Only trigger if authenticated, not on auth screen, and we haven't notified for this level yet
    if (user && currentView !== 'auth' && level > lastNotifiedLevel) {
      setIsLevelingUp(true);
      triggerHaptic([40, 60, 40, 60, 80]);
    }
  }, [level, user, currentView, lastNotifiedLevel]);

  // MANDATORY AUTHENTICATION ENFORCEMENT & HEARTBEAT (Online Status)
  useEffect(() => {
    if (!isGameLoading) {
      if (!user) {
        setCurrentView('auth');
      } else if (currentView === 'auth') {
        setCurrentView('lobby');
      }
    }
  }, [user?.id, isGameLoading, currentView]);

  // REAL-TIME NOTIFICATIONS (Messages & Friend Requests)
  useEffect(() => {
    if (!user?.id) return;

    const socialChannel = supabase
      .channel(`social-updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        () => {
          setSocialNotifications(prev => ({
            ...prev,
            unreadMessages: prev.unreadMessages + 1
          }));
          setNotificationsList(prev => [{
            id: Date.now(),
            type: 'message',
            title: 'نامەیەکا نوی',
            message: 'تە نامەیەکا تایبەت وەرگرت',
            created_at: new Date().toISOString()
          }, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'friendships', filter: `friend_id=eq.${user.id}` },
        () => {
          setSocialNotifications(prev => ({
            ...prev,
            pendingRequests: prev.pendingRequests + 1
          }));
          setNotificationsList(prev => [{
            id: Date.now(),
            type: 'friend_request',
            title: 'داخوازییا ھەڤالینیێ',
            message: 'کەسەکی داخوازیا ھەڤالینیێ بۆ تە ھنارتییە',
            created_at: new Date().toISOString()
          }, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(socialChannel);
    };
  }, [user?.id]);

  const [lastProfileUpdate, setLastProfileUpdate] = useState(Date.now());

  // Shared Logic (Haptic, Audio, Normalized, etc.) now handled in src/utils/gameStatus.js






  // Core logic is now handled by useGameLogic hook



  const handleProfileSave = async (profileData) => {
    if (!user || !user.id) {
      console.error("Save attempted without user session");
      alert('تکایە پێشێ وەرە ژوور (Login)');
      return;
    }

    try {
      const result = await updateProfile({
        nickname: profileData.nickname,
        avatar_url: profileData.avatar_url,
        country_code: profileData.countryCode,
        is_kurdistan: profileData.isInKurdistan
      });

      if (result?.success) {
        setLastProfileUpdate(Date.now());

        // Safe call for refreshRank (ensuring it exists)
        try {
          if (typeof refreshRank === 'function') refreshRank();
        } catch (e) { console.warn("Rank refresh failed but profile is saved", e); }
      } else {
        const errCode = result.error?.code;
        const errMsg = result.error?.message || 'Update failed';
        if (errCode === '23505') {
          alert('ئەڤ ناڤە یێ ھاتییە بکارئینان، تاقی بکە ناڤەکێ دی بنڤیسی');
        } else {
          alert(`خەلەتی: ${errMsg}`);
        }
      }
    } catch (err) {
      console.error("Critical handleProfileSave error:", err);
      alert("ئاریشەیەک د گەھشتنا داتابەیسێ دا ھەبوو");
    }
  };

  // 7. MULTIPLAYER RESULT REDIRECTION & AUTO-HIDE TIMER
  useEffect(() => {
    if (matchResultTrigger > 0 && lastMatchResult) {
      console.log(`[Multiplayer] Redirecting result: ${lastMatchResult}`);

      // 1. Set result breakdown for overlays
      if (lastMatchResult === 'victory') {
        const isForfeit = multiplayerState === 'game_over' && forfeitStatus;

        setIsVictory(true);
        playRewardSound();
        setVictoryBreakdown({ base: 50, mistakes: 0, total: 50, mode: 'Multiplayer' });
        setRewardAmountXp(100);

        if (forfeitStatus === 'confirmed') {
          setVictoryCustomText({
            title: "هەڤڕکێ تە دەرکەفت",
            description: "هەڤڕکێ تە یێ پچڕای، تو ب سەرکەفتی!"
          });
        } else {
          setVictoryCustomText(null);
        }
      } else if (lastMatchResult === 'defeat') {
        setIsDefeat(true);
        setDefeatBreakdown({ base: 0, mistakes: 0, total: 0, mode: 'Multiplayer' });
      }

      // 2. Transition back to Lobby (if not already there)
      setCurrentView('lobby');

      // 3. Delegation: The VictoryOverlay and DefeatOverlay components
      // now handle their own 10-second auto-dismissal logic by calling
      // onNext or onHome, which triggers the necessary state cleanups.
    }
  }, [matchResultTrigger, lastMatchResult, setCurrentView, setIsDefeat, setIsVictory]);

  // Safe Audio Trigger for Game Start
  useEffect(() => {
    if (currentView === 'game') {
      try {
        playStartGameSound();
      } catch (e) {
        console.warn("Start sound trigger failed", e);
      }
    }
  }, [currentView, playStartGameSound]);


  // Handlers now provided by useGameLogic

  // handleGameCompletion is now defined above to ensure initialization order

  const resetBoard = useCallback((wordObj) => {
    const { hapticEnabled: hEnabled, gameMode: gMode } = gameRefs.current;
    const cleanWord = normalizeKurdishInput(wordObj.word);

    setTargetWord(cleanWord);
    setTargetHint(wordObj.hint || '');
    setRevealedIndices([]);
    setStartTime(Date.now());
    setHintTaps(0);
    setMagnetUsedInRound(false);
    setMagnetDisabledKeys([]);

    if (gMode === 'word_fever') setTimeLeft(60);
    resetLocalBoard(cleanWord);
    if (hEnabled) triggerHaptic(25);
  }, [resetLocalBoard]);

  const selectCategory = useCallback((cat, forcedMode = null) => {
    const { level: currLevel, solvedWords: sWords, gameMode: gMode } = gameRefs.current;
    const targetDifficultyLevel = currLevel;
    const modeToUse = forcedMode || gMode;
    const wordObj = getRandomWordFromCategory(cat, targetDifficultyLevel, sWords, modeToUse);

    if (wordObj) {
      if (forcedMode) setGameMode(forcedMode);
      resetBoard(wordObj);
      setCategory(cat);
      setCurrentView('game');
    }
  }, [resetBoard]);

  const handleEarlyExit = useCallback(() => {
    setIsVictory(false);
    setCurrentView('lobby');
    setCategory('');
    setTargetWord('');
    setIsDailyActive(false);
  }, [setIsVictory, setCurrentView, setCategory, setTargetWord, setIsDailyActive]);

  const handleNextGame = useCallback(() => {
    const { level: currLevel, solvedWords: sWords, gameMode: gMode, category: currCat } = gameRefs.current;
    const targetDifficultyLevel = currLevel;
    const wordObj = getRandomWordFromCategory(currCat, targetDifficultyLevel, sWords, gMode);

    if (wordObj) {
      resetBoard(wordObj);
    } else {
      setCurrentView('lobby');
    }
  }, [resetBoard]);

  const handleForfeit = useCallback(() => {
    playPopSound();
    setIsForfeitConfirmOpen(true);
  }, [playPopSound]);

  const executeForfeitConfirmed = useCallback(() => {
    setIsForfeitConfirmOpen(false);
    setCurrentView('lobby');
    setCategory('');
    setTargetWord('');
  }, []);

  // --- WORD FEVER MODE TIMER ENGINE ---
  useEffect(() => {
    let timer;
    if (currentView === 'game' && gameMode === 'word_fever' && !isVictory && !isWordFeverResultVisible) {
      if (timeLeft > 0) {
        timer = setInterval(() => {
          setTimeLeft(prev => prev - 1);
        }, 1000);
      } else {
        // Time has expired
        setWordFeverResultType('fail');
        setIsWordFeverResultVisible(true);
      }
    }
    return () => clearInterval(timer);
  }, [currentView, gameMode, isVictory, isWordFeverResultVisible, timeLeft]);

  // Word Fever Reward & Penalty Effect
  useEffect(() => {
    if (gameMode === 'word_fever' && isWordFeverResultVisible) {
      const t = setTimeout(() => {
        if (wordFeverResultType === 'win') {
          // Note: handleVictorySync in onEnter already handles the database sync and local state XP increment
          // So we don't need addXP(50) here anymore to avoid double-dipping, 
          // but we might want the extra 50 Fils.
          updateInventory({ fils: 50 });
        } else if (wordFeverResultType === 'fail') {

          // Penalty for losing in Word Fever
          updateInventory({ fils: -50 });
        }
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isWordFeverResultVisible, wordFeverResultType, gameMode, updateInventory]);
  useEffect(() => {
    const tid = setTimeout(() => setIsAppReady(true), 1000);

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthChecked(true);
      if (!session) setCurrentView('auth');
    });

    // Listen for auth changes (Sign In / Sign Out)
    // Listen for auth changes solely for UI routing
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setCurrentView('auth');
        setIsSettingsOpen(false);
      } else {
        // If we found a session (e.g. after Google redirect), ensure we go to lobby
        // But ONLY if we were on the auth screen to avoid disrupting state
        if (currentView === 'auth') {
          setCurrentView('lobby');
        }
      }
    });

    return () => {
      clearTimeout(tid);
      subscription.unsubscribe();
    };
  }, [currentView, setCurrentView, setUser]);


  const handleLogout = async () => {
    setIsLevelingUp(false); // Clear level-up state immediately
    setIsSettingsOpen(false);
    const { error } = await supabase.auth.signOut();
    if (!error) {
      // Force a clean state refresh - most reliable way to handle logouts
      window.location.href = '/';
    }
  };

  // --- SOCIAL NOTIFICATION ENGINE ---
  useEffect(() => {
    if (!user?.id) return;

    const fetchCounts = async () => {
      // 1. Fetch unread messages
      const { data: rawMsgs } = await supabase
        .from('messages')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      // 2. Fetch pending requests
      const { data: rawReqs } = await supabase
        .from('friendships')
        .select('*')
        .eq('friend_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      // 3. Collect unique profile IDs
      const uniqueIds = new Set([
        ...(rawMsgs || []).map(m => m.user_id),
        ...(rawReqs || []).map(r => r.user_id)
      ].filter(Boolean));

      // 4. Batch fetch profiles if IDs exist
      let profileMap = {};
      if (uniqueIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, nickname, avatar_url')
          .in('id', Array.from(uniqueIds));

        if (profiles) {
          profileMap = profiles.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
        }
      }

      // 5. Map notifications with profile data
      const msgList = (rawMsgs || []).map(m => {
        const sender = profileMap[m.user_id];
        return {
          id: `msg_${m.id}`,
          dbId: m.id,
          type: 'message',
          sender_id: m.user_id,
          user_nickname: sender?.nickname || m.user_nickname || 'یاریکەر',
          user_avatar: sender?.avatar_url || 'default',
          created_at: m.created_at
        };
      });

      const reqList = (rawReqs || []).map(r => {
        const sender = profileMap[r.user_id];
        return {
          id: `req_${r.id}`,
          dbId: r.id,
          type: 'friend',
          sender_id: r.user_id,
          user_nickname: sender?.nickname || 'یاریکەر',
          user_avatar: sender?.avatar_url || 'default',
          created_at: r.created_at
        };
      });

      const combined = [...msgList, ...reqList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setNotificationsList(combined);
      setSocialNotifications({ unreadMessages: msgList.length, pendingRequests: reqList.length });
    };

    fetchCounts();

    const socialChannel = supabase
      .channel(`social_notifs:${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, () => fetchCounts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships', filter: `friend_id=eq.${user.id}` }, () => fetchCounts())
      .subscribe();

    return () => { supabase.removeChannel(socialChannel); };
  }, [user?.id]);


  // WRAPPED NAVIGATION: Unified state transition
  const navigateTo = useCallback((view) => {
    // We no longer call stopBGM() here for Hub->Hub transitions.
    // The global effect handles Hub->Game boundary crossing.
    setCurrentView(view);
  }, []);

  const handleNotificationAction = async (item) => {
    // Optimistically remove from list so it disappears instantly as requested
    setNotificationsList(prev => prev.filter(n => n.id !== item.id));

    // Persist to DB if it's a message
    if (item.type === 'message' && item.dbId) {
      try {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('id', item.dbId);

        // Refresh counts
        setSocialNotifications(prev => ({
          ...prev,
          unreadMessages: Math.max(0, prev.unreadMessages - 1)
        }));
      } catch (e) {
        console.warn("Failed to mark message as read:", e);
      }
    }

    if (item.type === 'message') {
      setActiveChatPartner({ id: item.sender_id, nickname: item.user_nickname, avatar_url: item.user_avatar });
      setInitialSocialTab('private');
      navigateTo('social_hub');
    } else if (item.type === 'friend') {
      setInitialSocialTab('friends');
      navigateTo('social_hub');
    } else {
      setInitialSocialTab('global');
      navigateTo('social_hub');
    }
  };

  const handleOpenChat = useCallback((partner) => {
    setActiveChatPartner(partner);
    setInitialSocialTab('private');
    navigateTo('social_hub');
  }, [navigateTo]);


  const handleViewMessages = useCallback(() => {
    setInitialSocialTab('private');
    navigateTo('social_hub');
  }, [navigateTo]);

  const handleViewFriends = useCallback(() => {
    setInitialSocialTab('friends');
    navigateTo('social_hub');
  }, [navigateTo]);


  if (!isAppReady || !isAuthChecked) return <div className="h-[100dvh] flex items-center justify-center bg-slate-950"><KurdishSunLoader /></div>;

  return (
    <div className={`flex flex-col h-[100dvh] max-h-[100dvh] w-full items-center bg-[#000000] font-noto-sans-arabic ${currentTheme === 'zakho_nights' ? 'zakho-theme' : ''}`} dir="rtl">
      <div className="flex-1 flex flex-col w-full max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl mx-auto bg-[#020617] text-white relative overflow-hidden shadow-2xl">
      {/* Panic Overlay for Word Fever Mode Critical Time */}
      {gameMode === 'word_fever' && currentView === 'game' && timeLeft <= 10 && !isVictory && (
        <div className="panic-overlay" />
      )}

      {/* 1. STATE-BASED NAVIGATION HEADER */}
      {currentView !== 'auth' && currentView !== 'leaderboard' && currentView !== 'social_hub' && multiplayerState !== 'playing' && (
        <TopAppBar
          user={user} fils={fils} derhem={derhem} dinar={dinar}
          level={level} dailyStreak={dailyStreak}
          currentView={currentView} onEarlyExit={handleEarlyExit}
          onOpenSettings={() => { playSettingsOpenSound(); setIsSettingsOpen(true); }}
          notifications={notificationsList}
          onNotificationAction={handleNotificationAction}
          onOpenSocial={() => {
            playBubblePopSound();
            setCurrentView('social_hub');
          }}
          onForfeit={handleForfeit}
          category={category}
          equippedAvatar={equippedAvatar}
          gameMode={gameMode}
          timeLeft={timeLeft}
          notificationCount={socialNotifications.unreadMessages + socialNotifications.pendingRequests}
          onPlaySound={playBubblePopSound}
          onDailyRewardClick={() => {
            playBubblePopSound();
            setIsDailyRewardOpen(true);
          }}
          isDailyAvailable={
            !lastRewardClaimedAt ||
            (lastRewardClaimedAt.includes('T') ? lastRewardClaimedAt.split('T')[0] : lastRewardClaimedAt) !== getLocalDateString()
          }
        />
      )}

      {/* 2. MAIN CONTENT AREA (STATE DRIVEN) */}
      <main className={`flex-1 ${(currentView === 'game' || currentView === 'social_hub' || multiplayerState === 'playing') ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'} w-full relative ${(currentView === 'game' || currentView === 'auth' || currentView === 'social_hub' || multiplayerState === 'playing') ? 'p-0' : 'px-4 pt-4 pb-0'}`}>
        {currentView === 'auth' && <AuthView onAuthSuccess={async (u, nicknameHint) => {
          setUser(u);
          if (nicknameHint) {
            await updateProfile({ nickname: nicknameHint });
          }
          // Small delay to allow state sync before navigating to lobby
          setTimeout(() => setCurrentView('lobby'), 300);
        }} />}

        {(multiplayerState === 'playing' || multiplayerState === 'game_over') && (
          <Suspense fallback={<KurdishSunLoader />}>
            <MultiplayerGameView opponent={opponent} />
          </Suspense>
        )}

        {/* 2. MAIN VIEWS (LOBBY / GAME / SOCIAL) */}
        {currentView === 'lobby' && multiplayerState === 'idle' && (
          <LobbyView
            onStartClassic={() => {
              forceResumeAudio();
              playTabSound();
              stopBGM();
              triggerHaptic(10);
              setIsDailyActive(false);
              selectCategory('generalWordPool', 'classic'); // Direct start with Unified Pool
            }}
            onStartHardWords={() => {
              playTabSound();
              stopBGM();
              triggerHaptic(10);
              setIsDailyActive(true);
              selectCategory('generalWordPool', 'hard_words'); // Filtered by length internally
            }}
            onStartWordFever={() => {
              playTabSound();
              stopBGM();
              triggerHaptic(10);
              setIsDailyActive(false);
              selectCategory('generalWordPool', 'word_fever');
            }}
            onStartSecretWord={() => {
              playTabSound();
              stopBGM();
              triggerHaptic(10);
              setIsDailyActive(false);
              selectCategory('generalWordPool', 'secret_word');
              resetSecretWordProgress();
            }}
            onSocialClick={() => {
              navigateTo('social_hub');
            }}
            onDailyRewardClick={() => {
              playBubblePopSound();
              setIsDailyRewardOpen(true);
            }}
            onStartMamak={() => {
              playTabSound();
              stopBGM();
              triggerHaptic(10);
              setIsDailyActive(false);
              selectCategory('مامک', 'mamak');
            }}
            winsTowardsSecret={winsTowardsSecret}
            dailyStreak={dailyStreak}
            onViewChange={setCurrentView}
            notificationCount={socialNotifications.unreadMessages + socialNotifications.pendingRequests}
            onStartMultiplayer={() => {
              forceResumeAudio(); // iOS Unlock on User Gesture
              playTabSound();
              stopBGM();
              startMatchmaking();
            }}
          />
        )}

        {currentView === 'game' && (
          <div className="flex-1 flex flex-col overflow-hidden relative h-full">
            {/* Tier 1 & 2: Info & Grid (Flex Grow) */}
            <div className="flex-1 flex flex-col items-center min-h-0 overflow-y-auto pb-56 no-scrollbar">
              {/* Question Section */}
              <div className={`w-full flex flex-col items-center ${gameMode === 'classic' ? 'justify-center py-2' : 'mt-4 mb-2'}`}>
                <InfoBar
                  targetHint={targetHint}
                  category={category}
                  gameMode={gameMode}
                  guessesCount={guesses.length}
                  maxGuesses={gameMode === 'word_fever' ? 3 : 6}
                  fils={fils}
                  currentXP={currentXP}
                  minXP={minXPForLevel}
                  maxXP={maxXP}
                  level={level}
                  timeLeft={timeLeft}
                  showSuccessSplash={isSuccessSplash}
                />
              </div>

              {/* Grid Section (Centers content in remaining space) */}
              <div className="grid-protection-wrapper flex-1">
                <div className="game-grid-core -mt-40 sm:-mt-64">
                  <Grid
                    guesses={guesses}
                    currentGuess={currentGuess}
                    wordLength={targetWord.length}
                    getLetterStatus={getLetterStatus}
                    revealedIndices={revealedIndices}
                    lastHintIndex={-1}
                    targetWord={targetWord}
                    maxRows={gameMode === 'secret_word' ? 1 : (gameMode === 'word_fever' ? 3 : 6)}
                    isSecretMode={gameMode === 'secret_word'}
                    isShaking={isShaking}
                  />

                </div>
              </div>
            </div>

            {/* Tier 3: Keyboard (Pinned to bottom) */}
            <div className="fixed bottom-0 left-0 w-full z-50 p-2 bg-[#020617]/40 pb-[12%] m-0">
              <Keyboard
                onKey={onKey}
                onDelete={onDelete}
                onEnter={handleOnEnter}
                usedKeys={usedKeys}
                gameState={isVictory ? 'won' : isDefeat ? 'lost' : 'playing'}
                magnetDisabledKeys={magnetDisabledKeys}
                onHint={handleHint}
                onMagnet={handleMagnet}
                onSkip={handleSkip}
                hintCount={hintCount}
                magnetCount={magnetCount}
                skipCount={skipCount}
                fils={fils}
                gameMode={gameMode}
                hintTaps={hintTaps}
                hintLimit={getMaxHintsForWord(targetWord.length)}
                magnetUsedInRound={magnetUsedInRound}
                keyboardSoundEnabled={appSoundsEnabled}
                hapticEnabled={hapticEnabled}
              />
            </div>
          </div>
        )}

        <Suspense fallback={<KurdishSunLoader />}>

          {currentView === 'social_hub' && (
            <SocialHubView
              user={user}
              initialChatPartner={activeChatPartner}
              initialTab={initialSocialTab}
              onBack={() => {
                setActiveChatPartner(null);
                setInitialSocialTab(null);
                setCurrentView('lobby');
              }}
              onViewMessages={handleViewMessages}
              onViewFriends={handleViewFriends}
              onKeyboardToggle={setIsKeyboardOpen}
            />
          )}
          {currentView === 'leaderboard' && (
            <LeaderboardView
              userId={user?.id}
              userLevel={level}
              userXP={currentXP}
              userFils={fils}
              userNickname={userNickname}
              userAvatar={userAvatar}
              isInKurdistan={isInKurdistan}
              countryCode={countryCode}
              lastProfileUpdate={lastProfileUpdate}
              onOpenChat={handleOpenChat}
            />
          )}
          {currentView === 'store' && (
            <ShopView
              fils={fils}
              derhem={derhem}
              dinar={dinar}
              magnetCount={magnetCount}
              hintCount={hintCount}
              skipCount={skipCount}
              onPurchase={(item) => {
                if (item.type === 'currency') {
                  updateInventory({ fils: item.amount });
                  playPurchaseSound();
                } else if (item.type === 'package') {
                  updateInventory({
                    fils: 1000,
                    magnetCount: 3,
                    skipCount: 2,
                    hintCount: 1
                  });
                  playPurchaseSound();
                } else {
                  // Standard item purchase logic
                  const updates = {};
                  const price = -item.price;
                  if (item.currency === 'fils') updates.fils = price;
                  else if (item.currency === 'derhem') updates.derhem = price;
                  else if (item.currency === 'dinar') updates.dinar = price;

                  if (item.id === 'attractor_field') updates.magnetCount = 1;
                  if (item.id === 'hint_pack') updates.hintCount = 1;
                  if (item.id === 'full_skip') updates.skipCount = 1;

                  updateInventory(updates);
                  playPurchaseSound();
                }
              }}
              onEquipTheme={(id) => updateProfile({ currentTheme: id })}
              onPurchaseAvatar={(id, price, currency) => {
                updateInventory({ [currency]: -price });
                playPurchaseSound();
                updateProfile({ ownedAvatars: [...ownedAvatars, id] });
              }}
              onEquipAvatar={(id) => updateProfile({ avatar_url: id })}
              onPurchaseTheme={(theme) => {
                updateInventory({ [theme.currency]: -theme.price });
                playPurchaseSound();
                updateProfile({ unlockedThemes: [...unlockedThemes, theme.id] });
              }}
              playPurchaseSound={playPurchaseSound}
              ownedAvatars={ownedAvatars}
              equippedAvatar={equippedAvatar}
              unlockedThemes={unlockedThemes}
              currentTheme={currentTheme}
            />
          )}
          {currentView === 'stats' && (
            <ProfileView
              user={user}
              userNickname={userNickname}
              onProfileSave={handleProfileSave}
              userAvatar={userAvatar}
              userCity={city}
              isInKurdistan={isInKurdistan}
              countryCode={countryCode}
              level={level}
              currentXP={currentXP}
              maxXP={maxXP}
              fils={fils}
              derhem={derhem}
              dinar={dinar}
              playerStats={playerStats}
              userRank={userRank}
              dailyStreak={dailyStreak}
              onViewChange={navigateTo}
            />
          )}
          {currentView === 'dictionary' && (
            <DictionaryView
              solvedWords={solvedWords}
              wordList={wordList}
              onBack={() => setCurrentView('lobby')}
            />
          )}
        </Suspense>
      </main>

      {/* 3. CONDITIONAL BOTTOM NAV (Hide during ANY gameplay or multiplayer) */}
      {currentView !== 'game' &&
        currentView !== 'auth' &&
        (multiplayerState === 'idle' || multiplayerState === 'game_over') &&
        !isKeyboardOpen && (
          <BottomNav
            currentView={currentView}
            setCurrentView={navigateTo}
            onSettingsToggle={() => { setIsSettingsOpen(true); }}
            onTabClickSound={playBubblePopSound}
          />
        )}

      {/* 4. GLOBAL OVERLAYS */}
      <VictoryOverlay
        isVisible={isVictory && gameMode !== 'word_fever'}
        breakdown={victoryBreakdown}
        solvedWord={lastSolvedWord}
        xp={rewardAmountXp}
        customTitle={victoryCustomText?.title}
        customDescription={victoryCustomText?.description}
        onNext={() => {
          setIsVictory(false);
          handleNextGame();
        }}
        onHome={handleGoHome}
        playStartSound={playStartGameSound}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => { playSettingsCloseSound(); setIsSettingsOpen(false); }}
        currentTheme={currentTheme}
        onThemeChange={(id) => updateProfile({ currentTheme: id })}
        appSfxVolume={appSfxVolume}
        onAppSfxVolumeChange={updateSfxVolume}
        bgMusicVolume={bgMusicVolume}
        onBgMusicVolumeChange={updateMusicVolume}
        hapticEnabled={hapticEnabled}
        onHapticToggle={() => {
          updateProfile({ haptic_enabled: !hapticEnabled });
        }}
        user={user}
        onLogout={handleLogout}
        onPlaySound={playBubblePopSound}
      />

      <AnimatePresence>
        {isForfeitConfirmOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-100 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-[40px] p-10 text-center">
              <h2 className="text-2xl font-black mb-4">پشتراستی؟</h2>
              <div className="flex flex-col gap-3">
                <button onClick={executeForfeitConfirmed} className="h-16 bg-red-500 rounded-2xl font-black">بەلێ، دەستژێبەردان</button>
                <button onClick={() => setIsForfeitConfirmOpen(false)} className="h-16 bg-white/5 rounded-2xl font-bold">نەخێر</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hintLimitToast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-32 left-1/2 -track-x-1/2 z-1000 -translate-x-1/2"
          >
            <div className="bg-[#0f172a]/90 backdrop-blur-2xl border border-red-500/30 px-8 py-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                <span className="material-symbols-outlined text-[24px]">info</span>
              </div>
              <span className="text-white font-black text-lg font-rabar">{hintLimitToast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DefeatOverlay
        isVisible={isDefeat && gameMode !== 'word_fever'}
        solvedWord={lastSolvedWord}
        breakdown={defeatBreakdown}
        gameMode={gameMode}
        playStartSound={playStartGameSound}
        onRetry={() => {
          setIsDefeat(false);
          // Fixed: passing gameMode correctly to maintain difficulty/length rules on retry
          const wordObj = getRandomWordFromCategory(category, level, solvedWords, gameMode);
          if (wordObj) resetBoard(wordObj);
        }}
        onHome={handleGoHome}
      />

      <WordFeverResultOverlay
        isVisible={isWordFeverResultVisible}
        type={wordFeverResultType}
        solvedWord={lastSolvedWord}
        breakdown={wordFeverResultType === 'win' ? victoryBreakdown : defeatBreakdown}
        xp={rewardAmountXp}
        playStartSound={playStartGameSound}
        onContinue={() => {
          setIsWordFeverResultVisible(false);
          handleNextGame();
        }}
        onRepeat={() => {
          setIsWordFeverResultVisible(false);
          // For Word Fever mode retry, we pick a new word but keep the mode
          handleNextGame();
        }}
        onHome={handleGoHome}
      />

      {user && currentView !== 'auth' && isLevelingUp && level > lastNotifiedLevel && (
        <LevelUpOverlay
          isVisible={isLevelingUp}
          newLevel={level}
          onClose={async () => {
            // 1. Update Database FIRST (Ensure persistence before UI close)
            await updateProfile({ lastNotifiedLevel: level });
            // 2. Then Close Modal Locally
            setIsLevelingUp(false);
          }}
        />
      )}

      <DailyRewardModal
        isOpen={isDailyRewardOpen}
        onClose={() => setIsDailyRewardOpen(false)}
      />

      {/* 5. MULTIPLAYER MATCHMAKING OVERLAY */}
      <AnimatePresence>
        {(multiplayerState === 'searching' || multiplayerState === 'waiting') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-200 flex flex-col items-center justify-center bg-[#020617]/95 backdrop-blur-xl p-8 text-center"
          >
            {/* Pulsing Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] animate-pulse" />

            <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm">
              <div className="relative">
                <ScrollingMatchFinder opponent={opponent} />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -inset-4 border-2 border-emerald-500/30 rounded-full"
                />
              </div>

              <div className="space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <h2 className="text-3xl font-black font-heading text-white">لێگەڕیان لدویڤ ھەڤڕکەکێ...</h2>
                  {/* LIVE TIMER UI */}
                  <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <span className="text-emerald-400 font-black font-mono text-xl tracking-widest tabular-nums">
                      {Math.floor(matchmakingTime / 60).toString().padStart(2, '0')}:
                      {(matchmakingTime % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={cancelMatch}
                  className="h-16 bg-white/5 border border-white/10 rounded-2xl font-black text-white/50 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                >
                  پەشێمان بووم (Cancel)
                </button>
              </div>
            </div>

            <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-4 opacity-20">
              {['پ', 'ە', 'ی', 'ڤ', 'چ', 'ن'].map((char, i) => (
                <motion.span
                  key={i}
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                  className="text-4xl font-black font-rabar"
                >
                  {char}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MultiplayerResultOverlay
        isVisible={multiplayerState === 'game_over' && lastMatchResult !== null}
        result={lastMatchResult}
        scores={scores}
        opponent={opponent}
        userAvatar={userAvatar}
        userNickname={userNickname}
        onPlayAgain={() => {
          resetMatchResultTrigger();
          startMatchmaking();
        }}
        onClose={() => {
          resetMatchResultTrigger();
          cancelMatch(); // Reset state to idle
        }}
        isForfeitWin={isForfeitWin}
        rewards={matchReward}
      />
      </div>
    </div>
  );
}