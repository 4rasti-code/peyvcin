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
import NotificationsView from './components/NotificationsView';
import { getRandomWordFromCategory, wordList } from './data/wordList';
import { STATUS } from './data/constants';

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
        // Force a one-time reload from the server to get fresh assets
        window.sessionStorage.setItem('page-has-been-reloaded', 'true');
        return window.location.reload();
      }
      throw error;
    }
  });

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
            <p className="text-white/70 mb-10 text-lg leading-relaxed">ببورە، هندەک ئاریشەیێن تەکنیکی د دەستپێکرنا یاریێ دا هەبوون. تکایە دووبارە پەیجێ نوو بکە یان ڤەگەرە لابیێ.</p>
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

export default function App() {
  const [currentView, setCurrentView] = useState('lobby');
  const [_isDarkMode, _setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('peyvchin_theme');
    return saved ? saved === 'dark' : true;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [_isMobile, setIsMobile] = useState(window.innerWidth < 1024);


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [targetWord, setTargetWord] = useState('');
  const [targetHint, setTargetHint] = useState('');
  const [category, setCategory] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState([]);
  const [_message, setMessage] = useState('');
  const [usedKeys, setUsedKeys] = useState({});
  const [_isModalOpen, setIsModalOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState([]);
  const [isShaking, setIsShaking] = useState(false);
  const [hintTaps, setHintTaps] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [isDefeat, setIsDefeat] = useState(false);
  const [victoryBreakdown, setVictoryBreakdown] = useState({ base: 0, streak: 0, hints: 0, total: 0 });
  const [startTime, setStartTime] = useState(0);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [rewardAmountXp, setRewardAmountXp] = useState(0);
  const [defeatBreakdown, setDefeatBreakdown] = useState({ base: 0, mistakes: 0, total: 0 });
  const [magnetUsedInRound, setMagnetUsedInRound] = useState(false);
  const [magnetDisabledKeys, setMagnetDisabledKeys] = useState([]);

  const [gameMode, setGameMode] = useState('classic'); // 'classic', 'word_fever', 'secret_word', 'mamak', 'hard_words'
  const [timeLeft, setTimeLeft] = useState(60);
  const [isDailyActive, setIsDailyActive] = useState(false);
  const [isSuccessSplash, setIsSuccessSplash] = useState(false);

  const {
    level, mamakLevel, hardWordsLevel, wordFeverLevel, secretWordLevel,
    winsTowardsSecret, incrementSecretWordProgress, resetSecretWordProgress,
    currentXP, maxXP, minXPForLevel, fils, derhem, zer, _addXP,
    dailyStreak, setDailyStreak,
    magnetCount, hintCount, skipCount,
    setMagnetCount, setHintCount, setSkipCount,
    ownedAvatars, equippedAvatar, unlockedThemes, currentTheme,
    solvedWords, playerStats,
    userNickname, userAvatar, city, isInKurdistan, countryCode,
    inventory,
    updateInventory,
    updateProfile,
    processLevelCompletion,
    syncProgressToDatabase,
    setLevel, setCurrentXP,
    appSoundsEnabled, setAppSoundsEnabled,
    hapticEnabled, setHapticEnabled,
    playPopSound, playNotifSound, playMessageSound,
    playStartSound, playVictorySound, playRewardSound,
    user, setUser,
    userRank, refreshRank,
    loading: isGameLoading
  } = useGame();

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

  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const prevLevelRef = useRef(level);

  const [showFreshPulse, setShowFreshPulse] = useState(false);
  const [lastSolvedWord, setLastSolvedWord] = useState('');
  const [isForfeitConfirmOpen, setIsForfeitConfirmOpen] = useState(false);
  const [isWordFeverResultVisible, setIsWordFeverResultVisible] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [wordFeverResultType, setWordFeverResultType] = useState('win');
  const [isAppReady, setIsAppReady] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // TRIGGER LEVEL UP UI (Standardized)
  useEffect(() => {
    if (level > prevLevelRef.current && prevLevelRef.current !== 0) {
      setIsLevelingUp(true);
      triggerHaptic([40, 60, 40, 60, 80]);
    }
    prevLevelRef.current = level;
  }, [level]);

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
        { event: 'INSERT', schema: 'public', table: 'private_messages', filter: `recipient_id=eq.${user.id}` },
        (_payload) => {
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
        (_payload) => {
          setSocialNotifications(prev => ({
            ...prev,
            pendingRequests: prev.pendingRequests + 1
          }));
          setNotificationsList(prev => [{
            id: Date.now(),
            type: 'friend_request',
            title: 'داخوازییا هەڤالینیێ',
            message: 'کەسەکی داخوازیا هەڤالینیێ بۆ تە هنارتییە',
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
  const [activeChatPartner, setActiveChatPartner] = useState(null);
  const [initialSocialTab, setInitialSocialTab] = useState(null);

  const isSubmittingRef = useRef(false);
  const isSyncingRef = useRef(false);
  const hasCheckedRewardRef = useRef(false);
  const supportedColumns = useRef(['level', 'xp', 'fils', 'derhem', 'zer', 'daily_streak', 'nickname', 'avatar_url', 'city', 'is_kurdistan', 'country_code', 'magnet_count', 'hint_count', 'skip_count', 'owned_avatars', 'equipped_avatar']);

  // Shared Logic (Haptic, Audio, Normalized, etc.)
  const analyzeTileStats = (target, guesses) => {
    let green = 0;
    let yellow = 0;
    let gray = 0;
    const allUniqueGrays = new Set();

    guesses.forEach(guess => {
      const targetArr = target.split('');
      const guessArr = guess.split('');
      const statuses = new Array(guessArr.length).fill(STATUS.INCORRECT);
      const targetCounts = {};

      for (const char of targetArr) targetCounts[char] = (targetCounts[char] || 0) + 1;

      // Pass 1: Greens
      for (let i = 0; i < guessArr.length; i++) {
        if (guessArr[i] === targetArr[i]) {
          statuses[i] = STATUS.CORRECT;
          targetCounts[guessArr[i]]--;
          green++;
        }
      }

      // Pass 2: Yellows/Grays
      for (let i = 0; i < guessArr.length; i++) {
        if (statuses[i] !== STATUS.CORRECT) {
          const char = guessArr[i];
          if (targetCounts[char] > 0) {
            statuses[i] = STATUS.WRONG_POS;
            targetCounts[char]--;
            yellow++;
          } else {
            statuses[i] = STATUS.INCORRECT;
            gray++;
            allUniqueGrays.add(char);
          }
        }
      }
    });

    return { green, yellow, gray, uniqueGrays: allUniqueGrays.size };
  };

  const calculateLevelRewards = (word, allGuesses, mode = 'classic') => {
    const stats = analyzeTileStats(word, allGuesses);

    const greenTotal = stats.green * 10;
    const yellowTotal = stats.yellow * 5;
    const efficiencyBonus = (6 - allGuesses.length) * 20;
    const victoryBase = 150; // Base to hit ~350 for classic

    let total = victoryBase + greenTotal + yellowTotal + efficiencyBonus;
    total = Math.ceil(total);

    // Multipliers aligned with handle_level_completion RPC
    const multipliers = {
      'hard_words': 1.33,
      'secret_word': 4.0,
      'mamak': 2.0,
      'word_fever': 2.0,
      'classic': 1.0
    };

    const multiplier = multipliers[mode] || 1.0;
    total *= multiplier;

    const finalTotal = Math.ceil(Math.max(50, total));

    const grayPenalty = stats.gray * 5;

    return {
      green: greenTotal,
      yellow: yellowTotal,
      gray: grayPenalty,
      total: finalTotal,
      mode
    };
  };

  const calculateDefeatPenalty = (word, allGuesses, mode = 'classic') => {
    const stats = analyzeTileStats(word, allGuesses);

    // Scale penalties based on mode multipliers to match reward weights
    const multipliers = {
      'hard_words': 1.33,
      'secret_word': 4.0,
      'mamak': 2.0,
      'word_fever': 2.0,
      'classic': 1.0
    };
    const multiplier = multipliers[mode] || 1.0;

    const basePenalty = 150 * multiplier;
    const mistakeTax = (stats.uniqueGrays * 10) * multiplier;
    const totalPenalty = Math.ceil(basePenalty + mistakeTax);

    return {
      base: basePenalty,
      mistakes: mistakeTax,
      total: totalPenalty
    };
  };

  const normalizeKurdishInput = (input) => { if (!input) return ''; let clean = input.trim().replace(/ك/g, 'ک').replace(/[يى]/g, 'ی').replace(/ه/g, 'ھ'); return clean; };
  const handleViewMessages = useCallback(() => {
    setSocialNotifications(prev => prev.unreadMessages > 0 ? { ...prev, unreadMessages: 0 } : prev);
  }, []);

  const handleViewFriends = useCallback(() => {
    setSocialNotifications(prev => prev.pendingRequests > 0 ? { ...prev, pendingRequests: 0 } : prev);
  }, []);

  const getHintLimit = (length) => { if (length <= 2) return 0; if (length <= 5) return 1; if (length <= 8) return 2; if (length <= 10) return 3; if (length <= 13) return 4; return 5; };

  const getLetterStatus = (guess, index, targetOverride = null) => {
    const target = targetOverride || targetWord;
    if (!target || !guess) return STATUS.NONE;
    const guessString = Array.isArray(guess) ? guess.join('') : guess;
    if (guessString.length === 0) return STATUS.NONE;
    const targetArr = target.split('');
    const guessArr = guessString.split('');
    const statuses = new Array(guessArr.length).fill(STATUS.INCORRECT);
    const targetCounts = {};
    for (const char of targetArr) targetCounts[char] = (targetCounts[char] || 0) + 1;
    for (let i = 0; i < Math.min(guessArr.length, targetArr.length); i++) {
      if (guessArr[i] === targetArr[i]) { statuses[i] = STATUS.CORRECT; targetCounts[guessArr[i]]--; }
    }
    for (let i = 0; i < Math.min(guessArr.length, targetArr.length); i++) {
      if (statuses[i] !== STATUS.CORRECT) {
        const char = guessArr[i];
        if (targetCounts[char] > 0) { statuses[i] = STATUS.WRONG_POS; targetCounts[char]--; }
      }
    }
    return statuses[index] || STATUS.INCORRECT;
  };

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

        // Success Sound & Vibration
        playVictorySound();
        if (window.navigator?.vibrate) window.navigator.vibrate(50);

        // Safe call for refreshRank (ensuring it exists)
        try {
          if (typeof refreshRank === 'function') refreshRank();
        } catch (e) { console.warn("Rank refresh failed but profile is saved", e); }

        alert('پڕۆفایل ب سەرکەفتی هاتە پاراستن!');
      } else {
        const errCode = result.error?.code;
        const errMsg = result.error?.message || 'Update failed';
        if (errCode === '23505') {
          alert('ئەڤ ناڤە یێ هاتییە بکارئینان، تاقی بکە ناڤەکێ دی بنڤیسی');
        } else {
          alert(`خەلەتی: ${errMsg}`);
        }
      }
    } catch (err) {
      console.error("Critical handleProfileSave error:", err);
      alert("ئاریشەیەک د گەهشتنا داتابەیسێ دا هەبوو");
    }
  };

  // Safe Audio Trigger for Game Start
  useEffect(() => {
    if (currentView === 'game') {
      try {
        playStartSound();
      } catch (e) {
        console.warn("Start sound trigger failed", e);
      }
    }
  }, [currentView, playStartSound]);

  const handleOpenChat = (player) => {
    setActiveChatPartner(player);
    setCurrentView('social_hub');
  };

  const onKey = useCallback((key) => {
    if (!targetWord || isLevelingUp || isSubmittingRef.current) return;
    let cleanKey = normalizeKurdishInput(key);
    const newGuess = [...currentGuess];
    let placed = false;
    for (let i = 0; i < newGuess.length; i++) {
      if (newGuess[i] === '' && !revealedIndices.includes(i)) {
        newGuess[i] = cleanKey;
        placed = true;
        break;
      }
    }
    if (placed) setCurrentGuess(newGuess);
  }, [currentGuess, targetWord, isLevelingUp, revealedIndices]);

  const onDelete = useCallback(() => {
    if (!targetWord || isLevelingUp) return;
    const newGuess = [...currentGuess];
    for (let i = newGuess.length - 1; i >= 0; i--) {
      if (newGuess[i] !== '' && !revealedIndices.includes(i)) {
        newGuess[i] = '';
        break;
      }
    }
    setCurrentGuess(newGuess);
  }, [currentGuess, targetWord, isLevelingUp, revealedIndices]);

  const onEnter = useCallback((forcedGuess = null, isSkip = false) => {
    if (!targetWord || isSubmittingRef.current || isLevelingUp) return;
    const guessString = forcedGuess || normalizeKurdishInput(currentGuess.join(''));

    if (guessString.length < targetWord.length) {
      triggerHaptic([50, 30, 50]);
      setMessage('پەیڤ کێمە!'); setIsShaking(true);
      setTimeout(() => { setIsShaking(false); setMessage(''); }, 1000);
      return;
    }

    isSubmittingRef.current = true;
    const newGuesses = [...guesses, guessString];
    setGuesses(newGuesses);

    // Update Keys
    setUsedKeys(prev => {
      const next = { ...prev };
      guessString.split('').forEach((char, i) => {
        const status = getLetterStatus(guessString, i);
        if (!next[char] || status === STATUS.CORRECT) next[char] = status;
      });
      return next;
    });
    playPopSound(true); // Row flip sound

    // COMPREHENSIVE VICTORY CHECK (Unicode & Tile Failsafe)
    let isMatch = false;

    if (gameMode === 'word_fever') {
      const feverNormalize = (str) => {
        if (!str) return '';
        return str.normalize('NFC')
          .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '')
          .trim()
          .replace(/ه/g, 'ھ')
          .replace(/ک/g, 'ك')
          .replace(/ی/g, 'ي');
      };

      const nGuess = feverNormalize(guessString);
      const nTarget = feverNormalize(targetWord);

      // Failsafe: check status of every single tile
      const statuses = guessString.split('').map((_, i) => getLetterStatus(guessString, i));
      const allGreen = statuses.length > 0 && statuses.every(s => s === STATUS.CORRECT);
      const sameLength = nGuess.length === nTarget.length;

      isMatch = (nGuess === nTarget) || (allGreen && sameLength);
    } else {
      isMatch = guessString === targetWord;
    }

    if (isMatch) {
      if (gameMode === 'word_fever') {
        setIsWordFeverResultVisible(true);
        setWordFeverResultType('win');
        playRewardSound();
        setIsSuccessSplash(true);
        setTimeout(() => setIsSuccessSplash(false), 1000);
      } else {
        setIsVictory(true);
        setLastSolvedWord(targetWord);
        playVictorySound();
        if (hapticEnabled) triggerHaptic(25);
      }

      const nextSolved = [...solvedWords, targetWord];
      updateProfile({ solvedWords: nextSolved });
      if (!isSkip) {
        const breakdown = calculateLevelRewards(targetWord, newGuesses, gameMode);
        setVictoryBreakdown(breakdown);
        setRewardAmount(breakdown.total);

        const handleVictorySync = async () => {
          const syncData = await syncProgressToDatabase(targetWord.length, gameMode);
          if (syncData) {
            setRewardAmountXp(syncData.xpAdded);
            console.log(`تە ${syncData.xpAdded} XP وەرگرتن! ${syncData.bahdiniMsg}`);
          }
        };
        handleVictorySync();

        if (gameMode !== 'secret_word') {
          incrementSecretWordProgress();
        } else {
          resetSecretWordProgress();
        }

        const baseReward = breakdown.green + breakdown.yellow - breakdown.gray;
        processLevelCompletion(baseReward, 0, gameMode, null);
      }
    } else if (newGuesses.length >= (gameMode === 'secret_word' ? 1 : (gameMode === 'word_fever' ? 3 : 6))) {
      const penaltyBreakdown = calculateDefeatPenalty(targetWord, newGuesses, gameMode);
      setDefeatBreakdown(penaltyBreakdown);

      const nextFils = Math.max(0, Math.ceil(fils - penaltyBreakdown.total));
      updateInventory({ fils: nextFils }, false);

      setIsDefeat(true);

      if (gameMode === 'secret_word') {
        resetSecretWordProgress();
      }
    } else {
      const freshGuess = new Array(targetWord.length).fill('');
      revealedIndices.forEach(idx => freshGuess[idx] = targetWord[idx]);
      setCurrentGuess(freshGuess);
    }
    setTimeout(() => { isSubmittingRef.current = false; }, 300);
  }, [currentGuess, targetWord, guesses, isLevelingUp, gameMode, revealedIndices]);

  const handleHint = () => {
    if (hintCount <= 0 || isVictory) return;
    const available = [];
    targetWord.split('').forEach((char, i) => {
      if (!revealedIndices.includes(i) && currentGuess[i] === '') available.push(i);
    });
    if (available.length === 0) return;

    triggerHaptic(20);
    const randomIndex = available[Math.floor(Math.random() * available.length)];
    setRevealedIndices(prev => [...prev, randomIndex]);
    setCurrentGuess(prev => {
      const next = [...prev];
      next[randomIndex] = targetWord[randomIndex];
      return next;
    });

    updateInventory({
      hintCount: -1
    });
    setHintTaps(prev => prev + 1);
  };

  const handleMagnet = () => {
    if (magnetCount <= 0 || isVictory) return;
    triggerHaptic(30);
    // Logic to disable 5 incorrect keys
    const alphabet = 'ئابپت جچحخد ڕزژسشعغفقکگ لڵمنوۆهەیێ'.replace(/\s/g, '').split('');
    const targetSet = new Set(targetWord.split(''));
    const incorrect = alphabet.filter(char => !targetSet.has(char) && !magnetDisabledKeys.includes(char));
    const toDisable = incorrect.sort(() => 0.5 - Math.random()).slice(0, 5);

    setMagnetDisabledKeys(prev => [...prev, ...toDisable]);
    setMagnetUsedInRound(true);
    updateInventory({
      magnetCount: -1
    });
  };

  const handleSkip = () => {
    if (skipCount <= 0 || isVictory) return;
    triggerHaptic(25);
    onEnter(targetWord, true); // Use targetWord as forced guess
    updateInventory({
      skipCount: -1
    });
  };

  const resetBoard = (wordObj) => {
    const cleanWord = normalizeKurdishInput(wordObj.word);
    setTargetWord(cleanWord);
    setTargetHint(wordObj.hint || '');
    setGuesses([]);
    setRevealedIndices([]);
    setCurrentGuess(new Array(cleanWord.length).fill(''));
    setUsedKeys({});
    setIsVictory(false);
    setStartTime(Date.now());
    setHintTaps(0);
    setMagnetUsedInRound(false);
    setMagnetDisabledKeys([]);
    if (gameMode === 'word_fever') setTimeLeft(60);
    playPopSound(true); // Fast pop for board reveal
    playStartSound();
    if (hapticEnabled) triggerHaptic(25);
  };

  const selectCategory = (cat, forcedMode = null) => {
    // For Mamak mode, we pass the current mamakLevel to get the linear word
    const getModeLevel = () => {
      switch (forcedMode || gameMode) {
        case 'mamak': return mamakLevel;
        case 'hard_words': return hardWordsLevel;
        case 'word_fever': return wordFeverLevel;
        case 'secret_word': return secretWordLevel;
        default: return level;
      }
    };
    const targetDifficultyLevel = getModeLevel();
    const wordObj = getRandomWordFromCategory(cat, targetDifficultyLevel, solvedWords, forcedMode || gameMode);

    if (wordObj) {
      if (forcedMode) setGameMode(forcedMode);
      resetBoard(wordObj);
      setCategory(cat);
      setCurrentView('game');
      setIsModalOpen(false);
    }
  };

  const handleEarlyExit = () => {
    setIsVictory(false);
    setCurrentView('lobby');
    setCategory('');
    setTargetWord('');
    setIsDailyActive(false);
  };
  const handleNextGame = () => {
    // Determine which level index to use based on game mode
    const getModeLevel = () => {
      switch (gameMode) {
        case 'mamak': return mamakLevel;
        case 'hard_words': return hardWordsLevel;
        case 'word_fever': return wordFeverLevel;
        case 'secret_word': return secretWordLevel;
        default: return level;
      }
    };
    const targetDifficultyLevel = getModeLevel();
    const wordObj = getRandomWordFromCategory(category, targetDifficultyLevel, solvedWords, gameMode);

    if (wordObj) {
      resetBoard(wordObj);
    } else {
      setCurrentView('lobby');
    }
  };
  const handleForfeit = () => {
    playPopSound();
    setIsForfeitConfirmOpen(true);
  };
  const executeForfeitConfirmed = () => { setIsForfeitConfirmOpen(false); setCurrentView('lobby'); setCategory(''); setTargetWord(''); };

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
  }, [isWordFeverResultVisible, wordFeverResultType, gameMode]);
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
  }, []);


  const handleLogout = async () => {
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
      // 1. Fetch unread messages with sender info
      const { data: rawMsgs } = await supabase
        .from('private_messages')
        .select('*, sender:sender_id(nickname, avatar_url)')
        .eq('recipient_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      // 2. Fetch pending requests with sender info
      const { data: rawReqs } = await supabase
        .from('friendships')
        .select('*, sender:user_id(nickname, avatar_url)')
        .eq('friend_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      const msgList = (rawMsgs || []).map(m => ({
        id: `msg_${m.id}`,
        dbId: m.id,
        type: 'message',
        sender_id: m.sender_id,
        user_nickname: m.sender?.nickname || 'یاریکەر',
        user_avatar: m.sender?.avatar_url || 'default',
        created_at: m.created_at
      }));

      const reqList = (rawReqs || []).map(r => ({
        id: `req_${r.id}`,
        dbId: r.id,
        type: 'friend',
        sender_id: r.user_id,
        user_nickname: r.sender?.nickname || 'یاریکەر',
        user_avatar: r.sender?.avatar_url || 'default',
        created_at: r.created_at
      }));

      const combined = [...msgList, ...reqList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setNotificationsList(combined);
      setSocialNotifications({ unreadMessages: msgList.length, pendingRequests: reqList.length });
    };

    fetchCounts();

    const socialChannel = supabase
      .channel(`social_notifs:${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'private_messages', filter: `recipient_id=eq.${user.id}` }, () => fetchCounts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships', filter: `friend_id=eq.${user.id}` }, () => fetchCounts())
      .subscribe();

    return () => { supabase.removeChannel(socialChannel); };
  }, [user?.id]);

  const handleNotificationAction = async (item) => {
    // Optimistically remove from list so it disappears instantly as requested
    setNotificationsList(prev => prev.filter(n => n.id !== item.id));

    // Persist to DB if it's a message
    if (item.type === 'message' && item.dbId) {
      try {
        await supabase
          .from('private_messages')
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
      setCurrentView('social_hub');
    } else if (item.type === 'friend') {
      setInitialSocialTab('friends');
      setCurrentView('social_hub');
    } else {
      setInitialSocialTab('global');
      setCurrentView('social_hub');
    }
  };


  if (!isAppReady || !isAuthChecked) return <div className="h-screen flex items-center justify-center bg-slate-950"><KurdishSunLoader /></div>;

  return (
    <div className={`flex flex-col h-[100dvh] w-full max-w-[100vw] overflow-hidden bg-slate-950 text-white font-noto-sans-arabic ${currentTheme === 'zakho_nights' ? 'zakho-theme' : ''}`} dir="rtl">
      {/* Panic Overlay for Word Fever Mode Critical Time */}
      {gameMode === 'word_fever' && currentView === 'game' && timeLeft <= 10 && !isVictory && (
        <div className="panic-overlay" />
      )}

      {/* 1. STATE-BASED NAVIGATION HEADER */}
      {currentView !== 'auth' && currentView !== 'leaderboard' && currentView !== 'social_hub' && (
        <TopAppBar
          user={user} fils={fils} derhem={derhem} zer={zer}
          level={level} dailyStreak={dailyStreak}
          currentView={currentView} onEarlyExit={handleEarlyExit}
          onOpenSettings={() => setIsSettingsOpen(true)}
          notifications={notificationsList}
          onNotificationAction={handleNotificationAction}
          onOpenSocial={() => {
            setCurrentView('social_hub');
          }}
          onForfeit={handleForfeit}
          category={category}
          equippedAvatar={equippedAvatar}
          gameMode={gameMode}
          timeLeft={timeLeft}
          notificationCount={socialNotifications.unreadMessages + socialNotifications.pendingRequests}
        />
      )}

      {/* 2. MAIN CONTENT AREA (STATE DRIVEN) */}
      <main className={`flex-1 ${currentView === 'game' ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'} w-full relative ${currentView === 'game' || currentView === 'auth' || currentView === 'social_hub' ? 'p-0' : 'px-4 pt-4 pb-0'}`}>
        {currentView === 'auth' && <AuthView onAuthSuccess={async (u, nicknameHint) => {
          setUser(u);
          if (nicknameHint) {
            await updateProfile({ nickname: nicknameHint });
          }
          // Small delay to allow state sync before navigating to lobby
          setTimeout(() => setCurrentView('lobby'), 300);
        }} />}

        {currentView === 'lobby' && (
          <LobbyView
            onStartClassic={() => {
              playPopSound();
              triggerHaptic(10);
              setIsDailyActive(false);
              selectCategory('generalWordPool', 'classic'); // Direct start with Unified Pool
            }}
            onStartHardWords={() => {
              playPopSound();
              triggerHaptic(10);
              setIsDailyActive(true);
              selectCategory('generalWordPool', 'hard_words'); // Filtered by length internally
            }}
            onStartWordFever={() => {
              playPopSound();
              triggerHaptic(10);
              setIsDailyActive(false);
              selectCategory('generalWordPool', 'word_fever');
            }}
            onStartSecretWord={() => {
              playPopSound();
              triggerHaptic(10);
              setIsDailyActive(false);
              selectCategory('generalWordPool', 'secret_word');
              resetSecretWordProgress();
            }}
            onSocialClick={() => {
              setCurrentView('social_hub');
            }}
            onStartMamak={() => {
              playPopSound();
              triggerHaptic(10);
              setIsDailyActive(false);
              selectCategory('مامک', 'mamak');
            }}
            level={level}
            mamakLevel={mamakLevel}
            hardWordsLevel={hardWordsLevel}
            wordFeverLevel={wordFeverLevel}
            secretWordLevel={secretWordLevel}
            winsTowardsSecret={winsTowardsSecret}
            dailyStreak={dailyStreak}
            equippedAvatar={equippedAvatar}
            onViewChange={setCurrentView}
            notificationCount={socialNotifications.unreadMessages + socialNotifications.pendingRequests}
          />
        )}

        {currentView === 'game' && (
          <div className="flex-1 flex flex-col overflow-hidden relative h-full">
            {/* Tier 1 & 2: Info & Grid (Flex Grow) */}
            <div className="flex-1 flex flex-col items-center min-h-0">
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
                <div className="game-grid-core">
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

                  {/* SECRET MODE SUBMIT BUTTON */}
                  {gameMode === 'secret_word' && !isVictory && !isDefeat && (
                    <div className="w-full max-w-sm mx-auto px-6 mt-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                      <button
                        onClick={() => onEnter()}
                        className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-5 rounded-[2.5rem] font-black text-2xl shadow-[0_20px_40px_rgba(16,185,129,0.3)] active:scale-95 transition-all flex items-center justify-center gap-4 border-b-4 border-[#047857]"
                      >
                        <span className="material-symbols-outlined text-3xl">check_circle</span>
                        تەمام (Submit)
                      </button>
                      <p className="text-[10px] text-white/20 text-center mt-4 font-bold uppercase tracking-[0.2em]">
                        بتنێ ئێک هەول یا تە هەی
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tier 3: Keyboard (Pinned to bottom) */}
            <div className="keyboard-safety-area">
              <Keyboard
                onKey={onKey}
                onDelete={onDelete}
                onEnter={onEnter}
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
                hintLimit={3}
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
              zer={zer}
              magnetCount={magnetCount}
              hintCount={hintCount}
              skipCount={skipCount}
              onPurchase={(item) => {
                if (item.type === 'currency') {
                  updateInventory({ fils: item.amount });
                } else if (item.type === 'package') {
                  updateInventory({
                    fils: 1000,
                    magnetCount: 3,
                    skipCount: 2,
                    hintCount: 1
                  });
                } else {
                  // Standard item purchase logic
                  const updates = {};
                  const price = -item.price;
                  if (item.currency === 'fils') updates.fils = price;
                  else if (item.currency === 'derhem') updates.derhem = price;
                  else if (item.currency === 'zer') updates.zer = price;

                  if (item.id === 'attractor_field') updates.magnetCount = 1;
                  if (item.id === 'hint_pack') updates.hintCount = 1;
                  if (item.id === 'full_skip') updates.skipCount = 1;

                  updateInventory(updates);
                  playRewardSound();
                }
              }}
              onEquipTheme={(id) => updateProfile({ currentTheme: id })}
              onPurchaseAvatar={(id, price, currency) => {
                updateInventory({ [currency]: -price });
                playRewardSound();
                updateProfile({ ownedAvatars: [...ownedAvatars, id] });
              }}
              onEquipAvatar={(id) => updateProfile({ avatar_url: id })}
              onPurchaseTheme={(theme) => {
                updateInventory({ [theme.currency]: -theme.price });
                playRewardSound();
                updateProfile({ unlockedThemes: [...unlockedThemes, theme.id] });
              }}
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
              zer={zer}
              playerStats={playerStats}
              userRank={userRank}
              dailyStreak={dailyStreak}
              onViewChange={setCurrentView}
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

      {/* 3. CONDITIONAL BOTTOM NAV */}
      {currentView !== 'game' && currentView !== 'auth' && !isKeyboardOpen && (
        <BottomNav currentView={currentView} setCurrentView={setCurrentView} onSettingsToggle={() => { setIsSettingsOpen(true); }} />
      )}

      {/* 4. GLOBAL OVERLAYS */}
      <VictoryOverlay
        isVisible={isVictory}
        breakdown={victoryBreakdown}
        solvedWord={targetWord}
        xp={rewardAmountXp}
        onNext={handleNextGame}
        onHome={() => {
          setIsVictory(false);
          setIsDailyActive(false);
          setCurrentView('lobby');
          setCategory('');
        }}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => { setIsSettingsOpen(false); }}
        currentTheme={currentTheme}
        onThemeChange={(id) => updateProfile({ currentTheme: id })}
        appSoundsEnabled={appSoundsEnabled}
        onAppSoundsToggle={() => {
          const next = !appSoundsEnabled;
          setAppSoundsEnabled(next);
          localStorage.setItem('peyvchin_app_sounds', next.toString());
          updateProfile({ app_sounds_enabled: next });
        }}
        hapticEnabled={hapticEnabled}
        onHapticToggle={() => {
          const next = !hapticEnabled;
          setHapticEnabled(next);
          localStorage.setItem('peyvchin_haptic_enabled', next.toString());
          updateProfile({ haptic_enabled: next });
        }}
        user={user}
        onLogout={handleLogout}
      />

      <AnimatePresence>
        {isForfeitConfirmOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
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



      <DefeatOverlay
        isVisible={isDefeat}
        solvedWord={targetWord}
        breakdown={defeatBreakdown}
        gameMode={gameMode}
        onRetry={() => {
          setIsDefeat(false);
          // Fixed: passing gameMode correctly to maintain difficulty/length rules on retry
          const wordObj = getRandomWordFromCategory(category, gameMode === 'mamak' ? mamakLevel : level, solvedWords, gameMode);
          if (wordObj) resetBoard(wordObj);
        }}
        onHome={() => {
          setIsDefeat(false);
          setCurrentView('lobby');
          setCategory('');
        }}
      />

      <WordFeverResultOverlay
        isVisible={isWordFeverResultVisible}
        type={wordFeverResultType}
        onContinue={() => {
          setIsWordFeverResultVisible(false);
          handleNextGame();
        }}
        onRepeat={() => {
          setIsWordFeverResultVisible(false);
          // For Word Fever mode retry, we pick a new word but keep the mode
          handleNextGame();
        }}
        onHome={() => {
          setIsWordFeverResultVisible(false);
          setCurrentView('lobby');
          setCategory('');
        }}
      />

      <LevelUpOverlay 
        isVisible={isLevelingUp} 
        newLevel={level} 
        onClose={() => setIsLevelingUp(false)} 
      />

    </div>
  );
}