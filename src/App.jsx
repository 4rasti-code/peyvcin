// Deployment Trigger: Ensuring timer removal is live
import React, { useState, useEffect, useRef, useCallback, Suspense, lazy, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import OneSignal from 'react-onesignal';
import TopAppBar from './components/TopAppBar';
import RoundIntro from './components/RoundIntro';
import BattleResultOverlay from './components/BattleResultOverlay';
import AdminPanelView from './components/AdminPanelView';
import UpdateNotesModal from './components/UpdateNotesModal';
import Avatar from './components/Avatar';
import { triggerHaptic } from './utils/haptics';
import InfoBar from './components/InfoBar';
import Grid from './components/Grid';
import Keyboard from './components/Keyboard';
import CategoryModal from './components/CategoryModal';
import BottomNav from './components/BottomNav';
import LobbyView from './components/LobbyView';
import { gameWordLists, allWordsWithCategories } from './data/wordList';
import { STATUS } from './data/constants';
import { getLocalDateString as _getLocalDateString } from './utils/formatters';
import KurdishSunLoader from './components/KurdishSunLoader';

import useMultiplayer from './hooks/useMultiplayer';
import { calculateLevelRewards, calculateDefeatPenalty } from './utils/gameStatus';
import { getRewardForMode, getTotalXPForLevel } from './utils/progression';
import useGameLogic from './hooks/useGameLogic';
import { FilsIcon, DerhemIcon, DinarIcon } from './components/CurrencyIcon';
import { AVATARS } from './data/avatars';
import { safeJSONParse } from './utils/safeParse';

import { forceResumeAudio } from './utils/audio';
import { normalizeKurdishInput } from './utils/textUtils';

import useThemeDetector from './hooks/useThemeDetector';

// Resilient Lazy Loading Guard: Automatically reloads the page if a chunk fails to load 
// (common after new deployments where asset hashes change).
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenReloaded = safeJSONParse(
      window.sessionStorage.getItem('page-has-been-reloaded'),
      false
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
const LeaderboardView = lazyWithRetry(() => import('./components/LeaderboardView'));
const SocialHubView = lazyWithRetry(() => import('./components/SocialHubView'));
const ShopView = lazyWithRetry(() => import('./components/ShopView'));
const ProfileView = lazyWithRetry(() => import('./components/ProfileView'));
const AuthView = lazyWithRetry(() => import('./components/AuthView'));
const OnboardingView = lazyWithRetry(() => import('./components/OnboardingView'));
const DictionaryView = lazyWithRetry(() => import('./components/DictionaryView'));
const AchievementToastManager = lazyWithRetry(() => import('./components/AchievementToastManager'));
const SettingsModal = lazyWithRetry(() => import('./components/SettingsModal'));
const HowToPlayModal = lazyWithRetry(() => import('./components/HowToPlayModal'));
const DailyRewardModal = lazyWithRetry(() => import('./components/DailyRewardModal'));
const MasteryModal = lazyWithRetry(() => import('./components/MasteryModal'));
const KeyboardLanguageModal = lazyWithRetry(() => import('./components/KeyboardLanguageModal'));
const StatsView = lazyWithRetry(() => import('./components/StatsView'));
const AchievementsView = lazyWithRetry(() => import('./components/AchievementsView'));
const MedalsView = lazyWithRetry(() => import('./components/MedalsView'));


import { useGame } from './context/GameContext';
import { useUser } from './context/AuthContext';
import { useAudio } from './context/AudioContext';
import VictoryOverlay from './components/VictoryOverlay';
import CoinAnimation from './components/CoinAnimation';
import LevelUpOverlay from './components/LevelUpOverlay';
import WordFeverResultOverlay from './components/WordFeverResultOverlay';
import DefeatOverlay from './components/DefeatOverlay';
import { supabase } from './lib/supabase';
import PrivacyPolicy from './components/PrivacyPolicy';
import DataDeletion from './components/DataDeletion';
import TermsOfService from './components/TermsOfService';
import GlobalInviteToast from './components/GlobalInviteToast';
import UpgradeAccountModal from './components/UpgradeAccountModal';

const PEYVOK_VERSION = '2.3.0';

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
        <div className="flex flex-col items-center justify-center h-screen bg-mono-white text-mono-900 dark:bg-black dark:text-mono-50 p-8 text-center" style={{ fontFamily: 'Rabar, sans-serif' }}>
          <div className="bg-red-500/10 border-2 border-red-500/30 p-10 rounded-3xl shadow-2xl max-w-lg backdrop-blur-xl animate-in zoom-in-95">
            <h2 className="text-4xl font-black mb-6 text-red-500">ئاریشەیەک چێ بوو!</h2>
            <p className="text-white/70 mb-10 text-lg leading-relaxed">ببورە، ھندەک ئاریشەیێن تەکنیکی د دەستپێکرنا یاریێ دا ھەبوون. هێڤییە دووبارە پەیجێ نوی بکە یان ڤەگەڕە لابیێ.</p>
            <div className="flex flex-col gap-4">
              <button onClick={() => window.location.reload()} className="bg-primary text-white px-10 py-5 rounded-2xl font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all">نویکرنا پەیجێ</button>
              <button onClick={() => window.location.href = '/'} className="bg-white/5 border border-white/10 text-white/60 px-10 py-5 rounded-2xl font-bold hover:bg-white/10 transition-all">ڤەگەڕ بۆ سەرەکی</button>
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
    <div className="relative w-24 h-24 rounded-[100%] overflow-hidden bg-mono-100 dark:bg-black/40 shadow-[0_0_15px_rgba(239,68,68,0.3)] border-2 border-red-500">
      <AnimatePresence mode="wait">
        {!opponent ? (
          <Motion.div
            key="scrolling"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
            className="absolute inset-0"
          >
            <Motion.div
              animate={{ y: [0, -1200] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="flex flex-col items-center"
            >
              {randomPool.map((av, i) => (
                <div key={i} className="w-24 h-24 flex items-center justify-center shrink-0">
                  <Avatar src={av.id} size="full" border={false} />
                </div>
              ))}
            </Motion.div>
            {/* Vertical Blur & Fade Overlay */}
            <div className="absolute inset-0 bg-linear-to-b from-mono-white dark:from-mono-950 via-transparent to-mono-white dark:to-mono-950 opacity-60" />
          </Motion.div>
        ) : (
          <Motion.div
            key="found"
            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="absolute inset-0 flex items-center justify-center bg-emerald-500/10"
          >
            <Avatar src={opponent.avatar_url} size="full" border={false} />
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};



export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // 0. CORE CONTEXT HOOKS: Must be at the top to avoid ReferenceErrors
  const {
    user, setUser, hapticEnabled, loadingAuth, authProgress,
    userNickname, userAvatar, userAvatar: equippedAvatar, city, isInKurdistan, countryCode,
    ownedAvatars, unlockedThemes: _unlockedThemes, currentTheme,
    updateProfile, profileData
  } = useUser();

  const {
    appSoundsEnabled,
    appSfxVolume, updateSfxVolume,
    bgMusicVolume, updateMusicVolume,
    playPopSound, playNotifSound, playMessageSound, playHeartbeatSound,
    playStartGameSound, playRewardSound, playPurchaseSound, playBoosterSound, playBubblePopSound,
    playSettingsOpenSound, playSettingsCloseSound,
    playTabSound, startBGM, stopBGM
  } = useAudio();

  const {
    currentXP, level, maxXP, minXPForLevel, lastNotifiedLevel,
    fils, derhem, dinar,
    dailyStreak, lastRewardClaimedAt,
    magnetCount, hintCount, skipCount,
    solvedWords, playerStats,
    syncProgressToDatabase,
    processPurchase,
    getFreshWord,
    userRank, refreshRank,
    setNotifiedLevelDB,
    claimDailyReward: _claimDailyReward,
    updateInventory,
    applyPenalty,
    initializeStatsInDB,
    loading: isGameLoading,
    resetBoard: _resetContextBoard,
    hasUnclaimedMedals
  } = useGame();

  // --- ONESIGNAL NOTIFICATION ENGINE ---
  useEffect(() => {
    // 1. DEVELOPMENT GUARD: Skip OneSignal on localhost to avoid "Domain Mismatch" errors
    if (window.location.hostname === 'localhost') {
      console.log("🔔 [OneSignal] Localhost detected, skipping initialization.");
      return;
    }

    let isMounted = true;
    const initOneSignal = async () => {
      try {
        await OneSignal.init({
          appId: 'b642fbbb-f82b-4d0d-93b0-192e702cbd75',
          allowLocalhostAsSecureOrigin: true,
        });
        if (isMounted) {
          OneSignal.Slidedown.promptPush();
          console.log("🔔 [OneSignal] Initialized successfully");
        }
      } catch (err) {
        // Suppress "already initialized" error which happens in StrictMode or re-mounts
        if (err.message?.includes('already initialized')) {
          console.warn("🔔 [OneSignal] Already initialized, skipping.");
        } else if (err.message?.includes('Can only be used on')) {
          console.warn("🔔 [OneSignal] Domain mismatch (Update Site URL in OneSignal Dashboard):", err.message);
        } else {
          console.error("🔔 [OneSignal] Initialization failed:", err);
        }
      }
    };
    initOneSignal();
    return () => { isMounted = false; };
  }, []);

  // --- ONESIGNAL IDENTITY SYNC ---
  useEffect(() => {
    if (window.location.hostname === 'localhost') return;
    
    if (user?.id) {
      OneSignal.login(user.id).catch(err => console.warn("🔔 [OneSignal] Login Error:", err));
    } else {
      OneSignal.logout().catch(err => console.warn("🔔 [OneSignal] Logout Error:", err));
    }
  }, [user?.id]);

  // --- GUEST LEVEL 5 PROGRESSION TRIGGER ---
  useEffect(() => {
    if (!user || !user.is_anonymous || !profileData || typeof profileData.xp !== 'number') return;
    
    const xpThreshold = getTotalXPForLevel(5);
    const hasBeenNotified = localStorage.getItem('guest_level5_notified') === 'true';

    if (profileData.xp >= xpThreshold && !hasBeenNotified) {
      console.log("[Progression] Guest reached Level 5. Sending automated system message.");
      
      // Optimistically set the flag to prevent duplicate messages from race conditions
      localStorage.setItem('guest_level5_notified', 'true');

      const sendSystemMessage = async () => {
        try {
          const { error } = await supabase.from('messages').insert([{
            content: "تو گەهشتیە ئاستەکێ باش!\nلێ بۆ پاراستنا ئاست و زانیاریێن خوە و بەردەوامبوونا یاریێ، پێدڤیە هژمارا خوە ب شێوەیەکێ فەرمی تۆمار بکەی. ئەو کەسێن وەکو مێڤان خوە تۆمارکرین و بێی ئیمێل، دێ پشتی ٧ ڕۆژان ب شێوەیەکێ تۆتۆماتیکی هێنە ژێبرن د ناڤ یاریێ دا. هێڤیە ب زویترین دەم ب شێوەیەکێ فەرمی ب ڕێکا ئیمێلی خوە تۆمار بکە!",
            user_id: '9a813c24-b662-477d-a74a-6f822d17bbf1', // System Bot ID
            user_nickname: 'پەیڤۆک',
            receiver_id: user.id,
            is_read: false
          }]);

          if (error) {
            localStorage.removeItem('guest_level5_notified');
            throw error;
          }
        } catch (err) {
          console.error("Failed to send guest level 5 message:", err);
        }
      };

      sendSystemMessage();
    }
  }, [user, profileData]);

  // --- BETA WELCOME MESSAGE TRIGGER ---
  useEffect(() => {
    if (!user || !user.id) return;

    const hasBeenWelcomed = localStorage.getItem('beta_welcome_sent') === 'true';

    if (!hasBeenWelcomed) {
      console.log("[Welcome] First login detected. Sending automated welcome message.");
      
      // Optimistically set the flag to prevent duplicate messages from race conditions
      localStorage.setItem('beta_welcome_sent', 'true');

      const sendWelcomeMessage = async () => {
        try {
          const { error } = await supabase.from('messages').insert([{
            content: "سڵاڤ و رێز... ب خێرهاتی بۆ یاریا پەیڤۆک 🧩\n\nمە دڤیا ب ڕێکا ڤێ نامەیێ، هەم ب گەرمی خێرهاتنا تە بکەین و هەم ژی ب شانازی ڤە پێزانینەکا گرنگ بگەهینینە تە. 'پەیڤۆک' یارییەکا کوردی یا رەسەنە، کو ب تەمامی ب دەستێ گەشەپێدەرێن کورد هاتییە دروستکرن و ب ڕەنگەکێ راستەوخۆ گرێدایی زمان و کلتورێ مە یێ دەوڵەمەندە.\n\nیارییا مە نۆکە د قۆناغا تاقیکرنێ (Beta) دایە، و پرۆسەیا دروستکرنا وێ هێشتا یا د بەردەوامە. تیمێ مە ب بەردەوامی کار دکەت بۆ زێدەکرنا پەیڤێن کوردی یێن نویتر و بەرفرەهتر، دگەل چارەسەرکرنا هەر ئاریشەیەکا تەکنیکی کو بهێتە پێش. ژبەر هندێ، ئەگەر تو تووشی هەر ئاریشەیەکێ ببی، قۆناغەکا دەمییە و ئەم کار ل سەر دکەین.\n\nل ڤان نێزیکان، 'پەیڤۆک' دێ ب شێوەیەکێ فەرمی وەک ئەپلیکەیشن بۆ ئەندرۆید (Android) و ئایئۆئێس (iOS) بەردەست بیت!\n\nپشکدارییا تە د ڤێ قۆناغێ دا بۆ مە گەلەک یا گرنگە. تو ئێک ژ بکارهێنەرێن مە یێن دەستپێکێی، و پشتەڤانییا تە دێ هاریکارییا مە کەت بۆ پێشخستنا یاریێ، دا کو ببیتە باشترین یارییا هزری ب زمانێ کوردی/بەهدینی.\n\nزۆر سوپاس بۆ باوەری و پشتەڤانییا تە. \nـ دگەل رێزێن تیما گەشەپێدەرێن \"پەیڤۆک\"",
            user_id: '9a813c24-b662-477d-a74a-6f822d17bbf1', // System Bot ID
            user_nickname: 'پەیڤۆک',
            receiver_id: user.id,
            is_read: false
          }]);

          if (error) {
            localStorage.removeItem('beta_welcome_sent');
            throw error;
          }
        } catch (err) {
          console.error("Failed to send beta welcome message:", err);
        }
      };

      sendWelcomeMessage();
    }
  }, [user]);

  // 1. INITIALIZE VIEW FROM URL
  const [currentView, setCurrentView] = useState(() => {
    const path = window.location.pathname.replace('/', '');
    return path || 'lobby';
  });

  const bgmStatusRef = useRef('stopped');

  // --- THEME SYNC ENGINE (OS PREFERENCE & USER SELECTION) ---
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      // Priority: 1. User Selected Dark Theme, 2. OS Preference
      const isDarkTheme = currentTheme === 'zakho_nights' || currentTheme === 'dark';
      const isOSDark = mediaQuery.matches;

      const setMetaTheme = (color) => {
        const metas = document.querySelectorAll('meta[name="theme-color"]');
        metas.forEach(meta => {
          meta.setAttribute('content', color);
        });
      };

      if (isDarkTheme || (currentTheme === 'default' && isOSDark)) {
        document.documentElement.classList.add('dark');
        setMetaTheme('#000000');
        document.documentElement.style.backgroundColor = '#000000';
        document.body.style.backgroundColor = '#000000';
      } else {
        document.documentElement.classList.remove('dark');
        setMetaTheme('#f8fafc');
        document.documentElement.style.backgroundColor = '#f8fafc';
        document.body.style.backgroundColor = '#f8fafc';
      }
    };

    // Apply immediately on mount and when currentTheme changes
    applyTheme();

    const handleOSThemeChange = () => {
      if (currentTheme === 'default') applyTheme();
    };

    mediaQuery.addEventListener('change', handleOSThemeChange);

    // --- GLOBAL AUDIO UNLOCK: Clear browser policy block on first interaction ---
    const handleFirstInteraction = () => {
      console.log("🔊 [App] Interaction detected, unlocking AudioContext...");
      forceResumeAudio();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      mediaQuery.removeEventListener('change', handleOSThemeChange);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [currentTheme]);

  // Sync URL -> State (Initial Load & Back Button)
  // Sync URL -> State (Handles Initial Load & Back/Forward Buttons)
  useEffect(() => {
    const path = location.pathname.replace('/', '') || 'lobby';
    requestAnimationFrame(() => {
      setCurrentView(prev => prev !== path ? path : prev);
    });
  }, [location.pathname]);

  // Sync State -> URL (Handles internal navigateTo calls)
  useEffect(() => {
    const path = location.pathname.replace('/', '') || 'lobby';
    if (path !== currentView) {
      navigate('/' + currentView, { replace: true });
    }
  }, [currentView, navigate, location.pathname]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [isDailyRewardOpen, setIsDailyRewardOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [howToPlayMode, setHowToPlayMode] = useState('classic');
  const [isHowToPlayShowTabs, setIsHowToPlayShowTabs] = useState(true);
  const [activeChatPartner, setActiveChatPartner] = useState(null);
  const [initialSocialTab, setInitialSocialTab] = useState(null);
  const [openFriendsFromNotif, setOpenFriendsFromNotif] = useState(false);
  const [_isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  const [_isVerifyingSignup, setIsVerifyingSignup] = useState(false);
  const isRecoveringRef = useRef(false);
  const isVerifyingRef = useRef(false);

  // Sync refs with state for instant guard access in effects
  const setVerifyingSignup = (val) => {
    isVerifyingRef.current = val;
    setIsVerifyingSignup(val);
  };
  const [_initialStatsTab, setInitialStatsTab] = useState('stats');
  const setRecoveringPassword = (val) => {
    isRecoveringRef.current = val;
    setIsRecoveringPassword(val);
  };


  const [targetWord, setTargetWord] = useState('');
  const [targetHint, setTargetHint] = useState('');
  const [category, setCategory] = useState('');
  const [currentWordCategory, setCurrentWordCategory] = useState('');

  const [startTime, setStartTime] = useState(0);
  const [, setRewardAmount] = useState(0);
  const [rewardAmountXp, setRewardAmountXp] = useState(0);
  const [magnetDisabledKeys, setMagnetDisabledKeys] = useState([]);
  const [revealedIndices, setRevealedIndices] = useState([]);
  const [hintTaps, setHintTaps] = useState(0);
  const [magnetsUsedInRound, setMagnetsUsedInRound] = useState(0);
  const [skipsUsedInRound, setSkipsUsedInRound] = useState(0);

  const [gameMode, setGameMode] = useState('classic'); // 'classic', 'word_fever', 'mamak', 'hard_words'
  const [timeLeft, setTimeLeft] = useState(30);
  const [, setIsDailyActive] = useState(false);
  const [isSuccessSplash, setIsSuccessSplash] = useState(false);
  const [currentSolveTime, setCurrentSolveTime] = useState(0);

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
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [defeatBreakdown, setDefeatBreakdown] = useState({ base: 0, mistakes: 0, total: 0 });
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [wordFeverResultType, setWordFeverResultType] = useState('win');
  const [_hintLimitToast, setHintLimitToast] = useState({ visible: false, message: '' });
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [isMasteryOpen, setIsMasteryOpen] = useState(false);
  const [masteryData, _setMasteryData] = useState(null);
  const [isKeyboardWarningOpen, setIsKeyboardWarningOpen] = useState(false);
  const [isUpgradeModalDismissed, setIsUpgradeModalDismissed] = useState(false);

  // 1. Memoized flattened dictionary for ultra-fast lookups
  const dictionarySet = useMemo(() => {
    const set = new Set();
    Object.values(gameWordLists).forEach(list => {
      list.forEach(item => {
        if (item.word) set.add(normalizeKurdishInput(item.word));
      });
    });
    return set;
  }, []);

  const [toastMessage, setToastMessage] = useState(null);
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  const [pushNotification, setPushNotification] = useState(null);
  const showPush = useCallback((data) => {
    setPushNotification(data);
    setTimeout(() => setPushNotification(null), 4000);
  }, []);


  // Expose initialization helper to console for the user
  useEffect(() => {
    window.initializeStats = async () => {
      console.log("Initializing dummy stats in DB...");
      const res = await initializeStatsInDB();
      if (res?.success) {
        console.log("Stats initialized successfully! Refreshing UI...");
        window.location.reload();
      } else {
        console.error("Failed to initialize stats:", res?.error);
      }
    };
  }, [initializeStatsInDB]);

  const {
    activeMatch,
    multiplayerState,
    MatchmakingTime,
    opponent,
    cancelMatch,
    startMatchmaking,
    LastMatchResult,
    MatchReward,
    scores,
    MatchResultTrigger,
    ResetMatchResultTrigger,
    submitFailure
  } = useMultiplayer();

  // Force view to 'game' when multiplayer starts to prevent cleanup hook from destroying the match
  const hasForcedGameViewRef = useRef(false);
  useEffect(() => {
    // 1. Force view to 'lobby' for the 5-second match_starting buffer (Receiver might be in social_hub)
    if (multiplayerState === 'match_starting' && currentView !== 'lobby') {
      setCurrentView('lobby');
    }

    // 2. Force view to 'game' when officially playing
    const isGameActive = multiplayerState === 'searching' || multiplayerState === 'waiting' || multiplayerState === 'found' || multiplayerState === 'playing';
    if (isGameActive && !hasForcedGameViewRef.current) {
      if (currentView !== 'game') {
        setCurrentView('game');
      }
      hasForcedGameViewRef.current = true;
    } else if (!isGameActive) {
      // If the match search was cancelled/failed, we must safely return to the lobby.
      if (hasForcedGameViewRef.current && multiplayerState === 'idle') {
        setCurrentView('lobby');
      }
      hasForcedGameViewRef.current = false;
    }
  }, [multiplayerState, currentView]);

  // CLEANUP: Ensure multiplayer state is reset when navigating away from results
  useEffect(() => {
    const mainViews = ['store', 'social_hub', 'leaderboard', 'stats', 'dictionary', 'profile'];
    if (multiplayerState === 'game_over' && mainViews.includes(currentView)) {
      // If we are in a result state but moved to a menu, clean up the match record
      if (cancelMatch) cancelMatch();
    }
  }, [currentView, multiplayerState, cancelMatch]);

  const [notificationsList, setNotificationsList] = useState([]);
  const [socialNotifications, setSocialNotifications] = useState({ unreadMessages: 0, pendingRequests: 0, unreadGlobal: 0 });
  const [hasUnreadGlobalMessage, setHasUnreadGlobalMessage] = useState(false);



  // 5. Notification Sound Trigger (Distinguishing between messages and others)
  const prevNotifCount = useRef(0);
  useEffect(() => {
    const currentCount = notificationsList.length;
    if (currentCount > prevNotifCount.current) {
      const latest = notificationsList[0];
      if (latest && latest.type === 'message') {
        const isGameOn = currentView === 'game' || multiplayerState === 'searching' || multiplayerState === 'waiting' || multiplayerState === 'playing' || multiplayerState === 'match_starting';
        if (!isGameOn) {
          playMessageSound();
        }
      } else {
        playNotifSound();
      }
    }
    prevNotifCount.current = currentCount;
  }, [notificationsList, playNotifSound, playMessageSound, currentView, multiplayerState]);


  // --- CORE GAME ENGINE (Unified) ---
  const [feverStreak, setFeverStreak] = useState(0);

  const handleGameCompletion = useCallback(async (finalGuesses, isWin, forcedMode = null, forcedTarget = null, precalcBreakdown = null, precalcPenalty = null) => {
    const { targetWord: refTWord, gameMode: refGMode, winsTowardsSecret: _wts, fils: currFils } = gameRefs.current;

    // Prioritize passed arguments over refs to avoid race conditions
    const tWord = forcedTarget || refTWord;
    const gMode = forcedMode || refGMode;

    if (isWin) {
      const breakdown = precalcBreakdown || calculateLevelRewards(tWord, finalGuesses, gMode);

      // Ensure local state is current (redundant safety)
      setVictoryBreakdown(breakdown);
      setRewardAmount(breakdown.awardAmount);
      setRewardAmountXp(breakdown.xpAdded);

      // --- CALCULATE SCORE & DURATION ---
      let score = 0;
      const solveTimeMs = Date.now() - startTime;
      setCurrentSolveTime(solveTimeMs);

      const maxRows = (gMode === 'word_fever' ? 3 : 6);

      if (gMode === 'word_fever') {
        score = feverStreak + 1; // Current word count in the streak
      } else if (gMode === 'battle') {
        score = 100;
      } else {
        // Wordle-style score: higher is better for stats dashboard
        score = Math.max(10, (maxRows - finalGuesses.length + 1) * 10);
      }



      const syncData = await syncProgressToDatabase(
        tWord.length,
        gMode,
        {
          sessionId: `${gMode}_${Date.now()}`, // 1 Attempt Only logic guard
          score: score,
          solvedWords: [tWord],
          filsBonus: breakdown.awardAmount,
          magnetsUsed: magnetsUsedInRound,
          hintsUsed: hintTaps,
          skipsUsed: skipsUsedInRound,
          attempts: finalGuesses.length,
          isWin: true,
          durationMs: solveTimeMs
        }
      );
      // Extra verification from server if needed
      if (syncData?.xpAdded !== undefined) {
        setRewardAmountXp(syncData.xpAdded);
      }
    } else {
      const penaltyBreakdown = precalcPenalty || calculateDefeatPenalty(tWord, finalGuesses, gMode);
      setDefeatBreakdown(penaltyBreakdown);
      const nextFils = Math.max(0, Math.ceil(currFils - penaltyBreakdown.total));
      updateInventory({ fils: nextFils }, false);

      // Sync loss to update 'score' (0) for stats
      if (gMode !== 'multiplayer') { // Battle handled by multiplayer logic
        syncProgressToDatabase(tWord.length, gMode, {
          score: 0,
          solvedWords: [],
          isWin: false,
          attempts: finalGuesses.length
        });
      }
    }
  }, [syncProgressToDatabase, updateInventory, feverStreak, magnetsUsedInRound, hintTaps, skipsUsedInRound, startTime]); // Stable dependencies

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
      setFeverStreak(prev => prev + 1);
      setIsWordFeverResultVisible(true);
      setWordFeverResultType('win');
      playRewardSound();
      setIsSuccessSplash(true);
      setTimeout(() => setIsSuccessSplash(false), 1000);
    } else {
      if (hEnabled) triggerHaptic(25);
    }

    // 3. Trigger completion (Async DB sync)
    setRevealedIndices([]); // Clear immediately to prevent ghost tiles in next row during delay
    handleGameCompletion(finalGuesses, true, winMode, winWord, breakdown);
  }, [handleGameCompletion, playRewardSound]);

  const onLossHandler = useCallback((finalGuesses, lossWord, lossMode) => {
    const { multiplayerState: mState } = gameRefs.current;

    setLastSolvedWord(lossWord);
    setRevealedIndices([]); // Clear immediately
    setFeverStreak(0); // Reset fever streak on loss

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
    }
  }, [handleGameCompletion, submitFailure]);

  // --- SAFETY: PHANTOM HANDLER GUARD ---
  // Some legacy components or keyboard listeners may attempt to call this function.
  // We define it here to prevent 'ReferenceError: handleGameplayUpdate is not defined' crashes.
  const handleGameplayUpdate = useCallback((data) => {
    if (import.meta.env.MODE === 'development') {
      console.warn('[App] Phantom handleGameplayUpdate called with:', data);
    }
  }, []);

  const {
    guesses,
    currentGuess,
    usedKeys,
    isVictory, setIsVictory,
    isDefeat, setIsDefeat,
    hintIndices,
    onKey, onDelete, onEnter,
    triggerHint,
    getLetterStatus,
    resetLocalBoard,
    isShaking
  } = useGameLogic({
    targetWord,
    maxRows: (gameMode === 'word_fever' ? 3 : 6),
    gameMode,
    revealedIndices,
    isLevelingUp,
    onWin: onWinHandler,
    onLoss: onLossHandler,
    isActive: currentView === 'game',
    handleGameplayUpdate,
    onWrongLanguage: () => {
      setIsKeyboardWarningOpen(true);
      triggerHaptic([50, 50]);
    },
    soundEnabled: appSoundsEnabled,
    hapticEnabled: hapticEnabled,
    dictionary: dictionarySet,
    onInvalidWord: (reason) => {
      if (reason === 'not_in_dictionary') {
        showToast('ئەڤ پەیڤە د فەرهەنگێ دا نینە');
      } else if (reason === 'short') {
        showToast('پەیڤ کێمە!');
      }
    }
  });

  // --- UNIFIED AUTOMATIC BACKGROUND MUSIC (BGM) CONTROLLER ---
  const lastBgmActionRef = useRef(null);
  useEffect(() => {
    if (!startBGM || !stopBGM || currentView === undefined) return;
    const menuViews = ['lobby', 'social_hub', 'store', 'leaderboard', 'stats', 'dictionary', 'profile'];
    const isGameplayActive = currentView === 'game' || multiplayerState === 'searching' || multiplayerState === 'waiting' || multiplayerState === 'playing' || isVictory || isDefeat || isWordFeverResultVisible;
    const isAuth = currentView === 'auth';
    const shouldPlay = menuViews.includes(currentView) && !isGameplayActive && !isAuth;
    const intendedAction = (shouldPlay && bgMusicVolume > 0) ? 'PLAY' : 'STOP';
    if (lastBgmActionRef.current === intendedAction) return;
    lastBgmActionRef.current = intendedAction;
    if (intendedAction === 'PLAY') {
      const timer = setTimeout(() => {
        if (lastBgmActionRef.current !== 'PLAY') return;
        bgmStatusRef.current = 'playing';
        startBGM();
      }, 800);
      return () => clearTimeout(timer);
    } else {
      if (isGameplayActive || isAuth || bgMusicVolume <= 0) {
        bgmStatusRef.current = 'stopped';
        stopBGM();
      }
    }
  }, [currentView, multiplayerState, isVictory, isDefeat, isWordFeverResultVisible, bgMusicVolume, startBGM, stopBGM]);

  // --- GLOBAL CLICK LISTENER ---
  useEffect(() => {
    const nuclearUnlock = () => { forceResumeAudio(); window.removeEventListener('click', nuclearUnlock); };
    window.addEventListener('click', nuclearUnlock);
    return () => window.removeEventListener('click', nuclearUnlock);
  }, []);

  const handleGoHome = useCallback(() => {
    setIsVictory(false); setIsDefeat(false);
    setVictoryBreakdown({ awardAmount: 0, xpAdded: 0, greenCount: 0, yellowCount: 0, grayCount: 0 });
    setRewardAmountXp(0); setVictoryCustomText(null); setIsWordFeverResultVisible(false); setIsDailyActive(false);
    setCategory(''); setTargetWord(''); setRevealedIndices([]);
    setGameMode('menu');
    setTimeLeft(30);
    if (cancelMatch) cancelMatch();
    setCurrentView('lobby');
  }, [setIsVictory, setIsDefeat, setIsWordFeverResultVisible, setIsDailyActive, setCategory, setTargetWord, cancelMatch, setCurrentView]);

  const handleShareToGlobal = useCallback(async (text) => {
    if (!user) return false;
    try {
      const { error } = await supabase.from('messages').insert([{
        user_id: user.id,
        user_nickname: userNickname || 'یاریزان',
        content: text
      }]);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Failed to share to global chat:", err);
      return false;
    }
  }, [user, userNickname]);

  const getMaxHintsForWord = useCallback((length) => {
    if (length <= 2) return 0; if (length <= 5) return 1; if (length <= 8) return 2; if (length <= 10) return 3; if (length <= 13) return 4; return 5;
  }, []);

  const showHintLimitToast = useCallback(() => {
    setHintLimitToast({ visible: true, message: 'هاریکاریێن تە ب دوماهیک هاتن' });
    triggerHaptic([50, 100, 50]); setTimeout(() => setHintLimitToast(prev => ({ ...prev, visible: false })), 3000);
  }, []);

  const gameRefs = useRef({ targetWord, category, hintCount, magnetCount, skipCount, isVictory, isDefeat, currentView, revealedIndices, currentGuess, magnetDisabledKeys, gameMode, hapticEnabled, solvedWords, level, lastSolvedWord, fils, targetHint, hintTaps, usedKeys });
  useEffect(() => {
    Object.assign(gameRefs.current, { targetWord, category, hintCount, magnetCount, skipCount, isVictory, isDefeat, currentView, revealedIndices, currentGuess, magnetDisabledKeys, gameMode, hapticEnabled, solvedWords, level, lastSolvedWord, fils, targetHint, hintTaps, usedKeys });
  }, [targetWord, category, hintCount, magnetCount, skipCount, isVictory, isDefeat, currentView, revealedIndices, currentGuess, magnetDisabledKeys, gameMode, hapticEnabled, solvedWords, level, lastSolvedWord, fils, targetHint, hintTaps, usedKeys]);

  const handleOnEnter = useCallback(async () => {
    await onEnter();
  }, [onEnter]);

  const handleHint = useCallback(() => {
    const { hintCount: hCount, isVictory: isV, targetWord: tWord, hintTaps: hTaps } = gameRefs.current;
    const dynamicLimit = getMaxHintsForWord(tWord.length);
    if (hTaps >= dynamicLimit && !isV) { showHintLimitToast(); return; }
    if (hCount <= 0 || isV) return;

    const hintIndex = triggerHint();
    if (hintIndex === null) return;

    triggerHaptic(20);
    playBoosterSound();
    updateInventory({ hintCount: -1 }, true, true);
    setHintTaps(prev => prev + 1);
  }, [triggerHint, updateInventory, playBoosterSound, showHintLimitToast, getMaxHintsForWord]);

  const handleMagnet = useCallback(() => {
    const { magnetCount: mCount, isVictory: isV, targetWord: tWord, magnetDisabledKeys: mDisabled, usedKeys: uKeys } = gameRefs.current;

    if (mCount <= 0 || isV) return;

    const alphabet = 'ئابپت جچحخد ڕزژسشعغفقکگ لڵمنوۆھەیێ'.replace(/\s/g, '').split('');
    const targetSet = new Set(tWord.split(''));
    // Safely check if char is in usedKeys (absent/present/correct)
    const incorrect = alphabet.filter(char => {
      const isTarget = targetSet.has(char);
      const isDisabled = mDisabled && mDisabled.includes(char);
      const isUsed = uKeys && uKeys[char];
      return !isTarget && !isDisabled && !isUsed;
    });

    if (incorrect.length === 0) {
      triggerHaptic([50, 100, 50]);
      setHintLimitToast({ visible: true, message: 'چ پیتێن شاش یێن دی نەماینە' });
      setTimeout(() => setHintLimitToast(prev => ({ ...prev, visible: false })), 3000);
      return;
    }

    triggerHaptic(30);
    playBoosterSound();

    const toDisable = incorrect.sort(() => 0.5 - Math.random()).slice(0, 3);

    setMagnetDisabledKeys(prev => [...(prev || []), ...toDisable]);
    setMagnetsUsedInRound(prev => prev + 1);
    updateInventory({
      magnetCount: -1
    }, true, true); // Sync to DB immediately
  }, [updateInventory, playBoosterSound]); // Added missing dependency

  const handleSkip = useCallback(() => {
    const { skipCount: sCount, isVictory: isV, targetWord: tWord } = gameRefs.current;

    if (sCount <= 0 || isV) return;
    triggerHaptic(25);
    playBoosterSound();
    onEnter(tWord, true); // Use targetWord as forced guess
    setSkipsUsedInRound(prev => prev + 1);
    updateInventory({
      skipCount: -1
    }, true, true); // Sync to DB immediately
  }, [onEnter, updateInventory, playBoosterSound]); // Added missing dependency






  // TRIGGER LEVEL UP UI (Standardized)
  useEffect(() => {
    // Only trigger if authenticated, at the end of a game, and we haven't notified for this level yet
    const isEndGame = isVictory || isDefeat || isWordFeverResultVisible || multiplayerState === 'game_over';
    if (user && currentView === 'game' && isEndGame && level > lastNotifiedLevel) {
      requestAnimationFrame(() => setIsLevelingUp(true));
      triggerHaptic([40, 60, 40, 60, 80]);
    }
  }, [level, user, currentView, lastNotifiedLevel, isVictory, isDefeat, isWordFeverResultVisible, multiplayerState]);

  // MANDATORY AUTHENTICATION ENFORCEMENT & HEARTBEAT (Online Status)
  useEffect(() => {
    if (!isGameLoading && !loadingAuth) {
      console.log(`[App] Auth Guard Check - User: ${user ? 'YES' : 'NO'}, View: ${currentView}`);

      if (!user) {
        if (currentView !== 'auth') {
          console.log("[App] No user found, forcing AuthView...");
          requestAnimationFrame(() => setCurrentView('auth'));
        }
      } else {
        // STRICT ENTRY GUARD: Prevent unverified users from accessing the app via backdoor routes (like Password Recovery)
        if (user.app_metadata?.provider === 'email' && !user.email_confirmed_at) {
          console.warn("[App] Unverified user detected. Forcing sign out...");
          supabase.auth.signOut();
          if (currentView !== 'auth') {
            requestAnimationFrame(() => setCurrentView('auth'));
          }
          return;
        }

        if (currentView === 'auth') {
          // Guard: Prevent redirecting to lobby if user is in the middle of password recovery or signup verification
          if (isRecoveringRef.current || isVerifyingRef.current) {
            console.log("[App] Redirect blocked: Verification/Recovery in progress");
            return;
          }
          console.log("[App] User detected on AuthView, redirecting to Lobby...");
          requestAnimationFrame(() => setCurrentView('lobby'));
        }
      }
    }
  }, [user, isGameLoading, loadingAuth, currentView]);

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
        async (payload) => {
          // If the user is currently viewing this exact chat, do not show toast
          const currentActiveChatId = window.activeChatId || localStorage.getItem('activeChatId');
          const currentActiveTab = window.activeChatTab || localStorage.getItem('activeChatTab');
          
          if (currentActiveTab === 'private' && currentActiveChatId && String(currentActiveChatId) === String(payload.new.user_id)) {
            return;
          }
          
          let senderName = 'کەسەک';
          let avatarUrl = null;
          try {
            const { data } = await supabase.from('profiles').select('nickname, avatar_url').eq('id', payload.new.user_id).single();
            if (data) {
              senderName = data.nickname || senderName;
              avatarUrl = data.avatar_url;
            }
          } catch (_e) { console.warn(_e); }

          setSocialNotifications(prev => ({
            ...prev,
            unreadMessages: prev.unreadMessages + 1
          }));
          setNotificationsList(prev => [{
            id: Date.now(),
            type: 'message',
            title: senderName,
            message: 'نامەیەک بۆ تە هنارت',
            created_at: new Date().toISOString()
          }, ...prev]);

          showPush({
            title: senderName,
            message: 'نامەیەک بۆ تە هنارت',
            avatar: avatarUrl,
            type: 'message'
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'friendships', filter: `friend_id=eq.${user.id}` },
        async (payload) => {
          let senderName = 'کەسەک';
          let avatarUrl = null;
          try {
            const { data } = await supabase.from('profiles').select('nickname, avatar_url').eq('id', payload.new.user_id).single();
            if (data) {
              senderName = data.nickname || senderName;
              avatarUrl = data.avatar_url;
            }
          } catch (_e) { console.warn(_e); }

          setSocialNotifications(prev => ({
            ...prev,
            pendingRequests: prev.pendingRequests + 1
          }));
          setNotificationsList(prev => [{
            id: Date.now(),
            type: 'friend_request',
            title: senderName,
            message: 'داخوازیا هەڤالینیێ بۆ تە هنارت',
            created_at: new Date().toISOString()
          }, ...prev]);

          showPush({
            title: senderName,
            message: 'داخوازیا هەڤالینیێ بۆ تە هنارت',
            avatar: avatarUrl,
            type: 'friend_request'
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'friendships', filter: `user_id=eq.${user.id}` },
        async (payload) => {
          if (payload.new.status === 'accepted') {
            let friendName = 'هەڤالەک';
            let avatarUrl = null;
            try {
              const { data } = await supabase.from('profiles').select('nickname, avatar_url').eq('id', payload.new.friend_id).single();
              if (data) {
                friendName = data.nickname || friendName;
                avatarUrl = data.avatar_url;
              }
            } catch (_e) { console.warn(_e); }

            showPush({
              title: friendName,
              message: 'داخوازا هەڤالینیێ وەرگرت',
              avatar: avatarUrl,
              type: 'friend_accepted'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(socialChannel);
    };
  }, [user?.id, showPush]);

  // --- GLOBAL CHAT NOTIFICATION DOT LOGIC ---
  useEffect(() => {
    if (!user?.id) return;

    const checkGlobalMessages = async () => {
      try {
        const { data } = await supabase
          .from('messages')
          .select('created_at, user_id')
          .is('receiver_id', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data && data.user_id !== user.id) {
          const lastOpened = localStorage.getItem('lastOpenedGlobalChatTime');
          if (!lastOpened || new Date(data.created_at) > new Date(lastOpened)) {
            setHasUnreadGlobalMessage(true);
          }
        }
      } catch (e) { console.warn(e); }
    };

    checkGlobalMessages();

    const globalSub = supabase
      .channel('public:messages:global:badge')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: 'receiver_id=is.null' },
        (payload) => {
          if (payload.new.user_id !== user.id) {
            if (window.activeChatTab === 'global') {
              const now = new Date().toISOString();
              localStorage.setItem('lastOpenedGlobalChatTime', now);
              localStorage.setItem('last_seen_global_chat', now);
            } else {
              setHasUnreadGlobalMessage(true);
            }
          }
        }
      )
      .subscribe();

    const handleGlobalChatOpened = () => setHasUnreadGlobalMessage(false);
    window.addEventListener('globalChatOpened', handleGlobalChatOpened);

    return () => {
      supabase.removeChannel(globalSub);
      window.removeEventListener('globalChatOpened', handleGlobalChatOpened);
    };
  }, [user?.id]);


  // Shared Logic (Haptic, Audio, Normalized, etc.) now handled in src/utils/gameStatus.js






  // Core logic is now handled by useGameLogic hook



  const handleProfileSave = async (profileData) => {
    if (!user || !user.id) {
      console.error("Save attempted without user session");
      throw new Error('هێڤییە پێشێ وەرە ژوور (Login)');
    }

    try {
      const result = await updateProfile({
        nickname: profileData.nickname,
        avatar_url: profileData.avatar_url,
        country_code: profileData.countryCode,
        is_kurdistan: profileData.isInKurdistan
      });

      if (result?.success) {
        // Safe call for refreshRank (ensuring it exists)
        try {
          if (typeof refreshRank === 'function') refreshRank();
        } catch (e) { console.warn("Rank refresh failed but profile is saved", e); }
      } else {
        const errCode = result.error?.code;
        const errMsg = result.error?.message || 'Update failed';
        if (errCode === '23505') {
          throw new Error('ئەڤ ناڤە یێ ھاتییە بکارهینان، تاقی بکە ناڤەکێ دی بنڤیسی');
        } else {
          throw new Error(errMsg);
        }
      }
    } catch (err) {
      console.error("Critical handleProfileSave error:", err);
      if (err.message === 'ئەڤ ناڤە یێ ھاتییە بکارهینان، تاقی بکە ناڤەکێ دی بنڤیسی' || err.message === 'هێڤییە پێشێ وەرە ژوور (Login)') {
        throw err;
      }
      throw new Error(err.message || "ئاریشەیەک د گەھشتنا داتابەیسێ دا ھەبوو");
    }
  };

  // 7. MULTIPLAYER RESULT REDIRECTION (CLEANUP)
  // Decoupled from shared isVictory/isDefeat state to prevent double overlays.
  // BattleResultOverlay now consumes LastMatchResult directly from MultiplayerContext.
  useEffect(() => {
    if (MatchResultTrigger > 0 && LastMatchResult) {
      console.log(`[Multiplayer] Result detected: ${LastMatchResult}. View redirected to Lobby.`);

      if (LastMatchResult === 'victory') {
        // Reward sound handled by result overlay if needed
      }

      setCurrentView('lobby');
    }
  }, [MatchResultTrigger, LastMatchResult, playRewardSound, setCurrentView]);

  // Safe Audio Trigger for Game Start
  useEffect(() => {
    // Multiplayer handles its own delayed start sound in MultiplayerGameView
    const isSinglePlayer = gameMode !== 'multiplayer' && multiplayerState === 'idle';
    
    if (currentView === 'game' && isSinglePlayer) {
      try {
        playStartGameSound();
      } catch (e) {
        console.warn("Start sound trigger failed", e);
      }
    }
  }, [currentView, gameMode, playStartGameSound, multiplayerState]);

  // Delay Result Overlay by a short amount to allow final word animation to finish
  useEffect(() => {
    if (isVictory || isDefeat || isWordFeverResultVisible) {
      const timer = setTimeout(() => {
        setShowResultOverlay(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      requestAnimationFrame(() => {
        setShowResultOverlay(false);
      });
    }
  }, [isVictory, isDefeat, isWordFeverResultVisible]);


  // Handlers now provided by useGameLogic

  // handleGameCompletion is now defined above 
  const ResetRoundBoosters = useCallback(() => {
    setHintTaps(0);
    setSkipsUsedInRound(0);
    setRevealedIndices([]);
    setMagnetsUsedInRound(0);
    setMagnetDisabledKeys([]);
    setVictoryBreakdown({ awardAmount: 0, xpAdded: 0, greenCount: 0, yellowCount: 0, grayCount: 0 });
    setVictoryCustomText(null);
    setRewardAmount(0);
    setRewardAmountXp(0);
    setDefeatBreakdown({ base: 0, mistakes: 0, total: 0 });
    setLastSolvedWord('');
  }, []); // Stable initializer

  const resetBoard = useCallback((wordObj) => {
    const { hapticEnabled: hEnabled, gameMode: gMode } = gameRefs.current;
    const cleanWord = normalizeKurdishInput(wordObj.word);

    setTargetWord(cleanWord);
    setTargetHint(wordObj.hint || '');
    setCurrentWordCategory(wordObj.category || '');
    setRevealedIndices([]);
    setStartTime(Date.now());
    setCurrentSolveTime(0);
    setHintTaps(0);
    setMagnetsUsedInRound(0);
    setMagnetDisabledKeys([]);

    if (gMode === 'word_fever') setTimeLeft(30);
    resetLocalBoard(cleanWord);
    if (hEnabled) triggerHaptic(25);
  }, [resetLocalBoard]);

  const selectCategory = useCallback(async (cat, forcedMode = null) => {
    const { gameMode: gMode } = gameRefs.current;
    const modeToUse = forcedMode || gMode;

    const wordObj = await getFreshWord(modeToUse, cat);

    if (wordObj) {
      if (forcedMode) setGameMode(forcedMode);
      resetBoard(wordObj);
      setCategory(cat);
      setCurrentView('game');
    }
  }, [resetBoard, getFreshWord]);

  const handleEarlyExit = useCallback(() => {
    setIsVictory(false);
    setCurrentView('lobby');
    setCategory('');
    setTargetWord('');
    setIsDailyActive(false);
  }, [setIsVictory, setCurrentView, setCategory, setTargetWord, setIsDailyActive]);

  const handleNextGame = useCallback(async () => {
    const { gameMode: gMode, category: currCat } = gameRefs.current;

    // Immediate state cleanup to prevent UI flickering and timer race conditions
    setIsVictory(false);
    setIsDefeat(false);
    setIsWordFeverResultVisible(false);

    // Safety for Word Fever: reset time immediately to prevent "fail" re-trigger
    if (gMode === 'word_fever') setTimeLeft(30);

    const wordObj = await getFreshWord(gMode, currCat);

    if (wordObj) {
      resetBoard(wordObj);
    } else {
      handleGoHome();
    }
  }, [resetBoard, getFreshWord, setIsVictory, setIsDefeat, setIsWordFeverResultVisible, setTimeLeft, handleGoHome]);

  const handleForfeitClick = useCallback(() => {
    playPopSound();
    setIsForfeitConfirmOpen(true);
  }, [playPopSound]);

  // Auto-close forfeit modal if game ends or view changes
  useEffect(() => {
    if (currentView !== 'game' || isWordFeverResultVisible || showResultOverlay) {
      setIsForfeitConfirmOpen(false);
    }
  }, [currentView, isWordFeverResultVisible, showResultOverlay]);

  const executeForfeitConfirmed = useCallback(() => {
    const penalty = getRewardForMode(gameMode);
    
    // Deduct penalty and sync to DB
    applyPenalty(penalty.xp, penalty.amount, penalty.type);
    
    setIsForfeitConfirmOpen(false);
    setCurrentView('lobby');
    setCategory('');
    setTargetWord('');
    setRevealedIndices([]);
  }, [gameMode, applyPenalty]);

  // --- WORD FEVER MODE TIMER ENGINE ---
  useEffect(() => {
    let timer;
    if (currentView === 'game' && gameMode === 'word_fever' && !isVictory && !isWordFeverResultVisible && multiplayerState === 'idle') {
      if (timeLeft > 0) {
        timer = setInterval(() => {
          setTimeLeft(prev => prev - 1);
        }, 1000);
      } else {
        // Time has expired
        requestAnimationFrame(() => {
          setLastSolvedWord(targetWord);
          setFeverStreak(0);
          setIsDefeat(true); // Lock the board
          
          // Apply Timeout Penalty
          const timeoutFils = 50;
          const timeoutXP = 25;
          
          setDefeatBreakdown({
            base: timeoutFils,
            mistakes: 0,
            total: timeoutFils,
            xp: timeoutXP
          });
          
          setWordFeverResultType('fail');
          setIsWordFeverResultVisible(true);
          
          applyPenalty(timeoutXP, timeoutFils, 'fils');
        });
      }
    }
    return () => clearInterval(timer);
  }, [currentView, gameMode, isVictory, isWordFeverResultVisible, timeLeft, setIsDefeat, targetWord, setLastSolvedWord, setFeverStreak, setWordFeverResultType, setIsWordFeverResultVisible, applyPenalty, multiplayerState]);

  // --- WORD FEVER LAST 10 SECONDS TENSION AUDIO ---
  useEffect(() => {
    if (currentView === 'game' && gameMode === 'word_fever' && !isVictory && !isWordFeverResultVisible && multiplayerState === 'idle') {
      if (timeLeft <= 10 && timeLeft > 0) {
        // Play the heartbeat using the Web Audio API Engine for zero latency and perfect sync
        playHeartbeatSound();
        
        // Add a slight haptic feedback for mobile users to increase tension
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        } else if (navigator.vibrate) {
          navigator.vibrate(30);
        }
      }
    }
  }, [timeLeft, currentView, gameMode, isVictory, isWordFeverResultVisible, playHeartbeatSound, multiplayerState]);

  // Audio logic handled via AudioContext hooks
  // Auth logic handled via AuthContext hooks


  const handleLogout = async () => {
    setIsLevelingUp(false); // Clear level-up state immediately
    setIsSettingsOpen(false);
    const { error } = await supabase.auth.signOut();
    if (!error) {
      // Clear all progression/inventory data from local storage to prevent data leakage to next user
      const keysToKeep = ['peyvchin_app_sfx_volume', 'peyvchin_bg_music_volume', 'peyvchin_haptic_enabled', 'peyvchin_current_theme'];
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('peyvchin_') && !keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
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
          user_nickname: sender?.nickname || m.user_nickname || 'بێناڤ',
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
          user_nickname: sender?.nickname || 'بێناڤ',
          user_avatar: sender?.avatar_url || 'default',
          created_at: r.created_at
        };
      });

      const lastSeenGlobal = localStorage.getItem('last_seen_global_chat') || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: globalCount } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .is('receiver_id', null)
        .gt('created_at', lastSeenGlobal)
        .neq('user_id', user.id);

      const { count: botGlobalCount } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .is('receiver_id', null)
        .gt('created_at', lastSeenGlobal)
        .eq('user_id', '9a813c24-b662-477d-a74a-6f822d17bbf1');

      const combined = [...msgList, ...reqList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setNotificationsList(combined);
      setSocialNotifications({ 
        unreadMessages: msgList.length, 
        pendingRequests: reqList.length, 
        unreadGlobal: globalCount || 0,
        unreadBotGlobal: botGlobalCount || 0
      });
    };

    fetchCounts();

    const handleClearGlobal = () => {
      setSocialNotifications(prev => ({ ...prev, unreadGlobal: 0 }));
    };
    window.addEventListener('clear_global_notifs', handleClearGlobal);

    const socialChannel = supabase
      .channel(`social_notifs:${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, () => fetchCounts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships', filter: `friend_id=eq.${user.id}` }, () => fetchCounts())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'receiver_id=is.null' }, (payload) => {
        if (payload.new.user_id !== user.id) {
          if (window.activeChatTab === 'global') {
             const now = new Date().toISOString();
             localStorage.setItem('last_seen_global_chat', now);
             localStorage.setItem('lastOpenedGlobalChatTime', now);
          } else {
             setSocialNotifications(prev => ({ ...prev, unreadGlobal: (prev.unreadGlobal || 0) + 1 }));
          }
        }
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(socialChannel); 
      window.removeEventListener('clear_global_notifs', handleClearGlobal);
    };
  }, [user?.id]);


  // WRAPPED NAVIGATION: Unified state transition
  const navigateTo = useCallback((view, state = {}) => {
    if (view === 'stats' && state.tab) {
      setInitialStatsTab(state.tab);
    }
    // Sync URL with State
    navigate('/' + view);
    setCurrentView(view);
  }, [navigate]);

  const handleNotificationAction = async (item) => {
    // The user requested that notifications should NOT disappear until the message is actually opened
    // or the friend request is explicitly accepted/rejected.
    // We just navigate to the appropriate tab. The DB listener will naturally clear the notification
    // when the chat is opened (onSeen triggers) or the request is accepted.

    if (item.type === 'message') {
      setActiveChatPartner({ id: item.sender_id, nickname: item.user_nickname, avatar_url: item.user_avatar });
      setInitialSocialTab('private');
      navigateTo('social_hub');
    } else if (item.type === 'friend') {
        setOpenFriendsFromNotif(true);
        navigateTo('profile');
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
    navigateTo('profile');
  }, [navigateTo]);


  const isSystemDark = useThemeDetector();

  const handleOpenHowToPlay = (mode = 'classic', showTabs = true) => {
    playBubblePopSound();
    setHowToPlayMode(mode);
    setIsHowToPlayShowTabs(showTabs);
    setIsHowToPlayOpen(true);
  };

  const handleCloseHowToPlay = () => {
    playBubblePopSound();
    setIsHowToPlayOpen(false);
  };

  // --- CRITICAL AUTH GUARD (Flicker Fix) ---
  // Shows loader if auth is initializing, game assets are loading,
  // or if we have no user but haven't yet redirected to the auth screen.
  if (loadingAuth || isGameLoading || (!user && !['auth', 'lobby', 'game'].includes(currentView))) return (
    <div className="h-dvh flex flex-col items-center justify-center bg-mono-white dark:bg-black transition-colors duration-500 gap-6">
      <div className="flex flex-col items-center gap-4">
        <img src="/Peyvok-logo-01.png" className="h-20 w-auto block dark:hidden animate-pulse" alt="Peyvok" />
        <img src="/Peyvok-logo-02.png" className="h-20 w-auto hidden dark:block animate-pulse" alt="Peyvok" />
      </div>
      <KurdishSunLoader progress={authProgress} />
    </div>
  );

  return (
    <div className="flex flex-col w-full h-full items-center justify-start bg-mono-white text-mono-900 dark:bg-black dark:text-mono-50 md:bg-mono-white dark:md:bg-mono-black transition-colors duration-500 font-noto-sans-arabic" dir="rtl">
      <Analytics />
      {user && currentView === 'lobby' && <UpdateNotesModal />}
      <div className={`flex-1 flex flex-col w-full max-w-screen-sm md:max-w-[960px] mx-auto relative overflow-hidden bg-mono-white dark:bg-black transition-colors duration-500`}>
        {/* Panic Overlay for Word Fever Mode Critical Time */}
        {gameMode === 'word_fever' && currentView === 'game' && timeLeft <= 10 && !isVictory && multiplayerState === 'idle' && (
          <div className="panic-overlay" />
        )}

        {/* 1. STATE-BASED NAVIGATION HEADER */}
        {currentView !== 'auth' && currentView !== 'leaderboard' && currentView !== 'social_hub' && currentView !== 'profile' && currentView !== 'medals' && currentView !== 'stats' && currentView !== 'achievements' && currentView !== 'dictionary' && !['playing', 'joining', 'syncing', 'match_starting'].includes(multiplayerState) && (
          <TopAppBar
            user={user} fils={fils} derhem={derhem} dinar={dinar}
            magnetCount={magnetCount} hintCount={hintCount} skipCount={skipCount}
            level={level} dailyStreak={dailyStreak}
            currentView={currentView} onEarlyExit={handleEarlyExit}
            onOpenSettings={() => { playSettingsOpenSound(); setIsSettingsOpen(true); }}
            notifications={notificationsList}
            onNotificationAction={handleNotificationAction}
            onOpenSocial={() => {
              playBubblePopSound();
              setCurrentView('social_hub');
            }}
            onForfeit={handleForfeitClick}
            category={category}
            equippedAvatar={equippedAvatar}
            gameMode={gameMode}
            timeLeft={timeLeft}
            notificationCount={(socialNotifications.unreadMessages || 0) + (socialNotifications.pendingRequests || 0) + (socialNotifications.unreadBotGlobal || 0)}
            onPlaySound={playBubblePopSound}
            onDailyRewardClick={() => {
              playBubblePopSound();
              setIsDailyRewardOpen(true);
            }}
            isDailyAvailable={
              (() => {
                if (!lastRewardClaimedAt) return true;
                try {
                  const formatter = new Intl.DateTimeFormat('en-CA', {
                    timeZone: 'Asia/Baghdad',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  });
                  const lastClaimStr = formatter.format(new Date(lastRewardClaimedAt));
                  const todayStr = formatter.format(new Date());
                  return lastClaimStr !== todayStr;
                } catch {
                  return false;
                }
              })()
            }
            isDark={isSystemDark}
            onOpenHowToPlay={(mode) => handleOpenHowToPlay(mode, mode ? false : true)}
            onHint={handleHint}
            onMagnet={handleMagnet}
            onSkip={handleSkip}
            hintTaps={hintTaps}
            hintLimit={getMaxHintsForWord(targetWord?.length || 0)}
            magnetUsedInRound={magnetsUsedInRound > 0}
            skipsUsedInRound={skipsUsedInRound}
            skipLimit={1}
          />
        )}

        {/* 2. MAIN CONTENT AREA (STATE DRIVEN) */}
        <main className={`flex-1 flex flex-col ${(currentView === 'game' || currentView === 'social_hub' || multiplayerState === 'playing' || multiplayerState === 'match_starting') ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'} w-full relative ${(currentView === 'game' || currentView === 'auth' || currentView === 'social_hub' || currentView === 'profile' || currentView === 'medals' || currentView === 'stats' || currentView === 'achievements' || currentView === 'dictionary' || multiplayerState === 'playing' || multiplayerState === 'match_starting') ? 'p-0' : 'px-4 pt-4 pb-0'}`}>
          {currentView === 'auth' && (
            <AuthView
              onAuthSuccess={async (u) => {
                setUser(u);
                setIsRecoveringPassword(false);
                setIsVerifyingSignup(false);
                // Small delay to allow state sync before navigating to lobby
                setTimeout(() => setCurrentView('lobby'), 300);
              }}
              onRecoveringChange={setRecoveringPassword}
              onVerifyingSignupChange={setVerifyingSignup}
            />
          )}

          {(multiplayerState === 'playing' || multiplayerState === 'game_over' || multiplayerState === 'syncing' || multiplayerState === 'match_starting') && (
            <Suspense fallback={<KurdishSunLoader />}>
              <MultiplayerGameView
                opponent={opponent}
                isDark={isSystemDark}
                onOpenHowToPlay={() => handleOpenHowToPlay('multiplayer', false)}
                handleGameplayUpdate={handleGameplayUpdate} // Safety prop passing
              />
            </Suspense>
          )}

          {/* 2. MAIN VIEWS (LOBBY / GAME / SOCIAL) */}
          {currentView === 'lobby' && (multiplayerState === 'idle' || multiplayerState === 'private_lobby' || multiplayerState === 'match_starting') && (
            <>
              <LobbyView
                onStartClassic={() => {
                  forceResumeAudio();
                  playTabSound();
                  stopBGM();
                  triggerHaptic(10);
                  setIsDailyActive(false);
                  selectCategory('ھەموو', 'classic');
                }}
                onStartHardWords={() => {
                  playTabSound();
                  stopBGM();
                  triggerHaptic(10);
                  setIsDailyActive(true);
                  selectCategory('ھەموو', 'hard_words');
                }}
                onStartWordFever={() => {
                  playTabSound();
                  stopBGM();
                  triggerHaptic(10);
                  setIsDailyActive(false);
                  selectCategory('ھەموو', 'word_fever');
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
                dailyStreak={dailyStreak}
                onViewChange={setCurrentView}
                notificationCount={(socialNotifications.unreadMessages || 0) + (socialNotifications.pendingRequests || 0) + (socialNotifications.unreadGlobal || 0)}
                onStartMultiplayer={() => {
                  forceResumeAudio(); // iOS Unlock on User Gesture
                  playTabSound();
                  stopBGM();
                  setGameMode('multiplayer');
                  startMatchmaking();
                }}
                onOpenHowToPlay={handleOpenHowToPlay}
                onOpenChat={handleOpenChat}
              />
              
              {/* ADMIN PANEL BUTTON (Only visible to the specific admin email) */}
              {user?.email === '4rasti@gmail.com' && (
                <button
                  onClick={() => setCurrentView('admin_panel')}
                  className="fixed bottom-24 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold shadow-lg z-9999 flex items-center gap-2 active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined">admin_panel_settings</span>
                  پەنێڵی ئەدمین
                </button>
              )}
            </>
          )}

          {currentView === 'game' && gameMode !== 'multiplayer' && !['playing', 'game_over', 'syncing', 'match_starting'].includes(multiplayerState) && (
            <div className="flex-1 flex flex-col overflow-hidden relative h-full">
              {/* Tier 1 & 2: Info & Grid (Flex Grow) */}
              <div className="flex-1 flex flex-col items-center min-h-0 overflow-hidden no-scrollbar">
                {/* Question Section */}
                <div className={`w-full shrink-0 flex flex-col items-center my-1`}>
                  <InfoBar
                    targetHint={targetHint}
                    category={currentWordCategory || category}
                    gameMode={gameMode}
                    guessesCount={guesses.length}
                    maxGuesses={gameMode === 'word_fever' ? 3 : 6}
                    fils={fils}
                    currentXP={currentXP}
                    minXP={minXPForLevel}
                    maxXP={maxXP}
                    level={level}
                    targetDifficultyLevel={level}
                    timeLeft={timeLeft}
                    showSuccessSplash={isSuccessSplash}
                    isDark={isSystemDark}
                  />
                </div>

                {/* Grid Section (Centers content in remaining space) */}
                <div className="grid-protection-wrapper flex-1 flex flex-col justify-center overflow-hidden">
                  <div className="game-grid-core">
                    <Grid
                      key={targetWord}
                      guesses={guesses}
                      currentGuess={currentGuess}
                      wordLength={targetWord.length}
                      getLetterStatus={getLetterStatus}
                      revealedIndices={revealedIndices}
                      hintIndices={hintIndices}
                      lastHintIndex={-1}
                      targetWord={targetWord}
                      maxRows={gameMode === 'word_fever' ? 3 : 6}
                      isShaking={isShaking}
                      isDark={isSystemDark}
                    />

                  </div>
                </div>
              </div>

              {/* Tier 3: Keyboard (Pinned to bottom) */}
              <div className={`shrink-0 w-full z-50 mt-auto px-2 pt-3 pb-[max(20px,env(safe-area-inset-bottom))] ${isSystemDark ? 'bg-mono-900 border-t border-white/5' : 'bg-mono-white border-t border-slate-200'} transition-colors duration-500`}>
                <Keyboard
                  onKey={onKey}
                  onDelete={onDelete}
                  onEnter={handleOnEnter}
                  usedKeys={usedKeys}
                  isDark={isSystemDark}
                  gameState={isVictory ? 'won' : isDefeat ? 'lost' : isLevelingUp ? 'leveling-up' : 'playing'}
                  magnetDisabledKeys={magnetDisabledKeys}
                  onHint={handleHint}
                  onMagnet={handleMagnet}
                  onSkip={handleSkip}
                  hintCount={hintCount}
                  magnetCount={magnetCount}
                  skipCount={skipCount}
                  hintTaps={hintTaps}
                  hintLimit={getMaxHintsForWord(targetWord.length)}
                  magnetUsedInRound={magnetsUsedInRound > 0}
                  skipsUsedInRound={skipsUsedInRound}
                  skipLimit={1}
                  hideSkip={gameMode === 'mamak'}
                  keyboardSoundEnabled={appSoundsEnabled}
                  hapticEnabled={hapticEnabled}
                />
              </div>
            </div>
          )}

          <Suspense fallback={<KurdishSunLoader />}>
            {user?.id && (
              <>
                <div className={currentView === 'social_hub' ? 'contents' : 'hidden'}>
                  <SocialHubView
                    isVisible={currentView === 'social_hub'}
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
                    onKeyboardToggle={(isOpen) => {
                      if (isOpen && !window.matchMedia('(pointer: coarse)').matches) return;
                      setIsKeyboardOpen(isOpen);
                    }}
                  />
                </div>
                <div className={currentView === 'leaderboard' ? 'contents' : 'hidden'}>
                  <LeaderboardView
                    onOpenChat={handleOpenChat}
                  />
                </div>
                <div className={currentView === 'store' ? 'contents' : 'hidden'}>
                  <ShopView
                    fils={fils}
                    derhem={derhem}
                    dinar={dinar}
                    magnetCount={magnetCount}
                    hintCount={hintCount}
                    skipCount={skipCount}
                    onPurchase={async (item) => {
                      // Security Hardening: Use the atomic RPC-based processPurchase
                      await processPurchase(item);
                    }}
                    onPurchaseAvatar={async (id, price, currency) => {
                      // Security Hardening: Treat avatar purchase as a standard item purchase
                      const result = await processPurchase({ id, price, currency, type: 'avatar' });
                      if (result.success) {
                        updateProfile({ ownedAvatars: [...ownedAvatars, id] });
                      }
                    }}
                    onEquipAvatar={(id) => updateProfile({ avatar_url: id })}
                    playPurchaseSound={playPurchaseSound}
                    ownedAvatars={ownedAvatars}
                    equippedAvatar={equippedAvatar}
                  />
                </div>
                <div className={currentView === 'stats' ? 'contents' : 'hidden'}>
                  <StatsView
                    profileData={profileData}
                    playerStats={playerStats}
                    rank={userRank}
                    userNickname={userNickname}
                    userAvatar={userAvatar}
                    level={level}
                    currentXP={currentXP}
                    onViewChange={navigateTo}
                  />
                </div>
                <div className={currentView === 'achievements' ? 'contents' : 'hidden'}>
                  <AchievementsView
                    profileData={profileData}
                    onViewChange={navigateTo}
                  />
                </div>
                <div className={currentView === 'medals' ? 'contents' : 'hidden'}>
                  <MedalsView
                    onViewChange={navigateTo}
                  />
                </div>
                <div className={currentView === 'dictionary' ? 'contents' : 'hidden'}>
                  <DictionaryView
                    solvedWords={solvedWords}
                    allWordsWithCategories={allWordsWithCategories}
                    onBack={() => navigateTo('profile')}
                  />
                </div>
                <div className={currentView === 'profile' ? 'contents' : 'hidden'}>
                  <ProfileView
                      initialFriendsModalOpen={openFriendsFromNotif}
                      onFriendsModalConsumed={() => setOpenFriendsFromNotif(false)}
                    onOpenSettings={() => { playSettingsOpenSound(); setIsSettingsOpen(true); }}
                    onViewChange={(view) => { playSettingsOpenSound(); setCurrentView(view); }}
                    onOpenChat={handleOpenChat}
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
                    pendingFriendsCount={socialNotifications.pendingRequests || 0}
                  />
                </div>
                {currentView === 'admin_panel' && (
                  <div className="contents">
                    <AdminPanelView onBack={() => setCurrentView('lobby')} />
                  </div>
                )}
              </>
            )}

            {/* SOCIAL ONBOARDING OVERLAY */}
            {user && !user.is_anonymous && profileData && (profileData.onboarded === false || profileData.onboarded === null) && (
              <OnboardingView />
            )}
          </Suspense>

          {/* Premium Push Notification System (Like Instagram) */}
          <AnimatePresence>
            {pushNotification && (
              <Motion.div
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                onClick={() => {
                  setPushNotification(null);
                  triggerHaptic(10);
                  if (pushNotification.type === 'friend_request') {
                    setOpenFriendsFromNotif(true);
                    navigateTo('profile');
                  } else {
                    setCurrentView('social_hub');
                  }
                }}
                className="fixed top-[env(safe-area-inset-top,16px)] left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-[360px] z-9999 bg-mono-900/95 dark:bg-mono-100/95 backdrop-blur-xl p-3 rounded-[16px] shadow-2xl border border-white/10 dark:border-black/10 flex items-center gap-3 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-mono-800 dark:bg-mono-200 shrink-0 flex items-center justify-center">
                  <Avatar src={pushNotification.avatar || 'default'} size="full" border={false} className="object-cover w-full h-full" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col items-start text-right">
                  <h4 className={`text-[15px] font-black ${isSystemDark ? 'text-mono-900' : 'text-mono-50'} truncate w-full leading-tight font-heading`}>
                    {pushNotification.title}
                  </h4>
                  <p className={`text-[12px] font-medium ${isSystemDark ? 'text-mono-600' : 'text-mono-300'} truncate w-full mt-0.5`}>
                    {pushNotification.message}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 ml-1">
                  <span className="material-symbols-outlined text-[18px]">
                    {pushNotification.type === 'message' ? 'chat' : 'person_add'}
                  </span>
                </div>
              </Motion.div>
            )}
          </AnimatePresence>

          {/* Premium Toast Notification System */}
          <AnimatePresence>
            {toastMessage && (
              <Motion.div
                initial={{ opacity: 0, y: -20, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: -20, x: '-50%' }}
                className="fixed top-32 left-1/2 z-100 bg-mono-900/90 dark:bg-mono-100/90 backdrop-blur-md text-mono-50 dark:text-mono-900 px-4 py-2 rounded-md shadow-2xl font-rabar font-light text-xs pointer-events-none border border-white/10 dark:border-black/10"
                style={{ whiteSpace: 'nowrap' }}
              >
                {toastMessage}
              </Motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* 3. CONDITIONAL BOTTOM NAV (Hide during ANY gameplay or multiplayer) */}
        {currentView !== 'game' &&
          currentView !== 'auth' &&
          currentView !== 'stats' &&
          currentView !== 'achievements' &&
          currentView !== 'dictionary' &&
          currentView !== 'medals' &&
          (multiplayerState === 'idle' || multiplayerState === 'game_over') &&
          !isKeyboardOpen && (
            <BottomNav
              currentView={currentView}
              setCurrentView={navigateTo}
              onSettingsToggle={() => { setIsSettingsOpen(true); }}
              onTabClickSound={playBubblePopSound}
              chatBadgeCount={(socialNotifications.unreadMessages || 0) + (socialNotifications.unreadGlobal || 0)}
              pendingFriendsCount={socialNotifications.pendingRequests || 0}
              hasSilentGlobal={hasUnreadGlobalMessage}
              hasUnclaimedRewards={hasUnclaimedMedals}
            />
          )}

        {/* 4. GLOBAL OVERLAYS (SINGLE PLAYER ONLY) */}
        {multiplayerState === 'idle' && (
          <>
            {/* Single Player Victory */}
            <VictoryOverlay
              isVisible={(isVictory && showResultOverlay && currentView === 'game' && gameMode !== 'word_fever') || (isWordFeverResultVisible && showResultOverlay && wordFeverResultType === 'win' && gameMode === 'word_fever')}
              breakdown={victoryBreakdown}
              solvedWord={lastSolvedWord}
              guesses={guesses}
              xp={rewardAmountXp}
              customTitle={victoryCustomText?.title}
              customDescription={victoryCustomText?.description}
              isDark={isSystemDark}
              onNext={() => {
                handleNextGame();
              }}
              onHome={handleGoHome}
              playStartSound={playStartGameSound}
              profileData={profileData}
              playerStats={playerStats}
              gameMode={gameMode}
              solveTimeMs={currentSolveTime}
              streak={feverStreak}
              onShareToGlobal={handleShareToGlobal}
            />

            {/* Single Player Defeat */}
            <DefeatOverlay
              isVisible={(isDefeat && showResultOverlay && currentView === 'game' && gameMode !== 'word_fever') || (isWordFeverResultVisible && showResultOverlay && wordFeverResultType === 'fail' && gameMode === 'word_fever')}
              solvedWord={lastSolvedWord}
              guesses={guesses}
              breakdown={defeatBreakdown}
              gameMode={gameMode}
              playStartSound={playStartGameSound}
              onRetry={() => {
                handleNextGame();
              }}
              onRepeat={() => {
                setIsWordFeverResultVisible(false);
                handleNextGame();
              }}
              onHome={handleGoHome}
              isDark={isSystemDark}
              profileData={profileData}
              playerStats={playerStats}
              streak={feverStreak}
              onShareToGlobal={handleShareToGlobal}
            />
          </>
        )}

        {/* UNIFIED MULTIPLAYER BATTLE RESULT */}
        <BattleResultOverlay
          isVisible={(multiplayerState === 'game_over' || multiplayerState === 'idle') && !!LastMatchResult}
          result={LastMatchResult}
          scores={scores}
          opponent={opponent}
          playerStats={playerStats}
          user={{ id: user?.id, nickname: userNickname, avatar_url: userAvatar, level: level, xp: profileData?.xp || 0 }}
          isPlayer1={activeMatch?.player1_id === user?.id}
          breakdown={MatchReward?.awards ? {
            awardAmount: MatchReward.awards.amount,
            awardType: MatchReward.awards.type,
            xpAdded: MatchReward.xpAdded
          } : {
            awardAmount: LastMatchResult === 'victory' ? 1 : (LastMatchResult === 'draw' ? 20 : 0),
            awardType: LastMatchResult === 'victory' ? 'derhem' : 'fils',
            xpAdded: LastMatchResult === 'victory' ? 30 : (LastMatchResult === 'draw' ? 5 : 0)
          }}
          xp={MatchReward?.xpAdded || (LastMatchResult === 'victory' ? 30 : (LastMatchResult === 'draw' ? 5 : 0))}
          onNext={() => {
            ResetMatchResultTrigger();
            handleGoHome();
          }}
          onExit={() => {
            ResetMatchResultTrigger();
            handleGoHome();
          }}
          playStartSound={playStartGameSound}
          isDark={isSystemDark}
          guesses={guesses}
          solvedWord={lastSolvedWord || targetWord}
          onShareToGlobal={handleShareToGlobal}
        />

        <Suspense fallback={null}>
          <AchievementToastManager />
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => { playSettingsCloseSound(); setIsSettingsOpen(false); }}
            isDark={isSystemDark}
            appSfxVolume={appSfxVolume}
            onAppSfxVolumeChange={updateSfxVolume}
            bgMusicVolume={bgMusicVolume}
            onBgMusicVolumeChange={updateMusicVolume}
            hapticEnabled={hapticEnabled}
            onHapticToggle={() => {
              updateProfile({ haptic_enabled: !hapticEnabled });
            }}
            updateProfile={updateProfile}
            user={user}
            onLogout={handleLogout}
            onPlaySound={playBubblePopSound}
          />

          <DailyRewardModal
            isOpen={isDailyRewardOpen}
            onClose={() => setIsDailyRewardOpen(false)}
            isDark={isSystemDark}
          />

          <HowToPlayModal
            isOpen={isHowToPlayOpen}
            onClose={handleCloseHowToPlay}
            initialMode={howToPlayMode}
            isDark={isSystemDark}
            showTabs={isHowToPlayShowTabs}
          />

          <MasteryModal
            isOpen={isMasteryOpen}
            onClose={() => setIsMasteryOpen(false)}
            masteryData={masteryData}
            isDark={isSystemDark}
          />

          <KeyboardLanguageModal
            isOpen={isKeyboardWarningOpen}
            onClose={() => setIsKeyboardWarningOpen(false)}
          />
        </Suspense>

        {/* GLOBAL INVITE TOAST */}
        <GlobalInviteToast setGameMode={setGameMode} currentView={currentView} setCurrentView={setCurrentView} />

        {/* UPGRADE ACCOUNT MODAL FOR GUESTS */}
        <UpgradeAccountModal 
          isOpen={user?.is_anonymous && level >= 5 && !isUpgradeModalDismissed} 
          onClose={() => setIsUpgradeModalDismissed(true)}
          onSuccess={() => {
            // The profile updates will automatically reflect due to AuthContext listeners
            console.log("Guest account upgraded successfully!");
          }} 
        />

        {/* 5. MULTIPLAYER MATCHMAKING OVERLAY */}
        <AnimatePresence>
          {(multiplayerState === 'searching' || multiplayerState === 'waiting' || multiplayerState === 'found') && (
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-200 flex flex-col items-center justify-between bg-mono-50/90 dark:bg-black/90 backdrop-blur-2xl px-6 py-12 text-center overflow-hidden"
            >
              {/* Background gradient elements removed as requested by user */}

              {/* TOP RIGHT CANCEL ICON */}
              <div className={`absolute top-6 right-6 z-50 transition-all duration-500 ${multiplayerState === 'found' ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'}`}>
                <button
                  onClick={cancelMatch}
                  className="p-3 bg-mono-200/50 dark:bg-mono-800/50 hover:bg-mono-300 dark:hover:bg-mono-700 border border-mono-300/50 dark:border-mono-700/50 rounded-full text-mono-600 dark:text-mono-400 hover:text-mono-900 dark:hover:text-white backdrop-blur-md shadow-sm hover:shadow-md transition-all active:scale-90"
                  aria-label="Cancel Matchmaking"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* TOP: OPPONENT SEARCHER / FOUND */}
              <div className="relative z-10 flex flex-col items-center mt-24 min-h-[220px] w-full">
                {/* Premium Avatar Rings */}
                <div className="relative flex flex-col items-center justify-center">

                  {/* Minimalist Stage Base */}
                  <div className="absolute -bottom-4 flex flex-col items-center z-0 pointer-events-none">
                    <div className="w-32 h-6 bg-linear-to-b from-mono-200/50 to-mono-300/30 dark:from-mono-800/50 dark:to-mono-900/30 border border-white/40 dark:border-mono-700/40 rounded-[100%] backdrop-blur-sm" />
                    <div className="absolute top-2 w-24 h-2 bg-black/10 dark:bg-black/50 rounded-[100%] blur-md" />
                  </div>

                  {/* Avatar (Rings removed as requested) */}
                  <div className="relative z-10 mt-2">
                    <ScrollingMatchFinder opponent={opponent} />
                  </div>
                </div>

                {/* Fixed height placeholder for the name to prevent layout shift */}
                <div className="absolute top-[160px] left-0 right-0 flex flex-col items-center pointer-events-none">
                  <AnimatePresence>
                    {multiplayerState === 'found' && opponent && (
                      <Motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="text-mono-800 dark:text-mono-100 font-black text-xl drop-shadow-md">
                          {opponent.nickname || 'ھەڤڕک'}
                        </div>
                        <div className="text-sm font-semibold text-mono-500 dark:text-mono-400 bg-white/60 dark:bg-mono-900/60 backdrop-blur-md px-3 py-0.5 rounded-md border border-mono-200 dark:border-mono-800 shadow-sm flex items-center justify-center -mt-1">
                          <span>ئاستێ {opponent.level || 1}</span>
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* MIDDLE: VS & TIMER */}
              <div className="relative z-10 flex flex-col items-center gap-2 w-full max-w-sm my-auto -translate-y-6">
                {/* Timer Without Background */}
                <div className="flex items-center justify-center">
                  <span className="text-mono-800 dark:text-mono-100 font-black font-mono text-4xl tracking-widest tabular-nums drop-shadow-md">
                    {Math.floor(MatchmakingTime / 60).toString().padStart(2, '0')}:
                    {(MatchmakingTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                <h2 className="text-sm font-light text-mono-500 dark:text-mono-400 transition-colors duration-300">
                  {multiplayerState === 'found' ? 'ئامادەبە!' : 'لێگەڕیان...'}
                </h2>
              </div>

              {/* BOTTOM: USER PODIUM */}
              <div className="relative z-10 flex flex-col items-center mb-24">
                <div className="relative flex flex-col items-center justify-center">

                  {/* Minimalist Stage Base */}
                  <div className="absolute -bottom-4 flex flex-col items-center z-0 pointer-events-none">
                    <div className="w-32 h-6 bg-linear-to-b from-mono-200/50 to-mono-300/30 dark:from-mono-800/50 dark:to-mono-900/30 border border-white/40 dark:border-mono-700/40 rounded-[100%] backdrop-blur-sm" />
                    <div className="absolute top-2 w-24 h-2 bg-black/10 dark:bg-black/50 rounded-[100%] blur-md" />
                  </div>

                  <div className="w-24 h-24 relative z-10 rounded-[100%] overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.3)] border-2 border-blue-500 bg-mono-100 dark:bg-black/40">
                    <Avatar src={userAvatar} size="full" border={false} />
                  </div>
                </div>

                <div className="mt-12 flex flex-col items-center gap-1 relative z-20">
                  <span className="text-mono-800 dark:text-mono-100 font-black text-lg drop-shadow-md">
                    {userNickname || 'تۆ (YOU)'}
                  </span>
                  <div className="text-sm font-semibold text-mono-500 dark:text-mono-400 bg-white/60 dark:bg-mono-900/60 backdrop-blur-md px-3 py-0.5 rounded-md border border-mono-200 dark:border-mono-800 shadow-sm flex items-center justify-center mt-1">
                    <span>ئاستێ {level}</span>
                  </div>
                </div>
              </div>


              <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-4 opacity-20">
                {['پ', 'ە', 'ی', 'ڤ', 'چ', 'ن'].map((char, i) => (
                  <Motion.span
                    key={i}
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                    className="text-4xl font-black font-rabar text-mono-900 dark:text-white"
                  >
                    {char}
                  </Motion.span>
                ))}
              </div>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* FORFEIT WARNING MODAL */}
        <AnimatePresence>
          {isForfeitConfirmOpen && (
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-200 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsForfeitConfirmOpen(false)}
            >
              <Motion.div
                initial={{ scale: 0.95, y: 10, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 10, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="w-full max-w-[320px] bg-mono-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-md p-5 shadow-2xl flex flex-col gap-4 text-center font-rabar overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Background glow effect */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center gap-3">
                  <h2 className="text-base font-bold text-mono-900 dark:text-white mt-2">ئەرێ دێ دەرکەڤی؟</h2>
                  
                  <div className="flex items-center justify-center gap-3 py-2 px-4 bg-mono-50 dark:bg-black/40 rounded-md border border-mono-100 dark:border-white/5 w-full">
                    <span className="flex items-center gap-1.5 text-base font-bold text-red-500" dir="ltr">
                      -{getRewardForMode(gameMode).amount}
                      {getRewardForMode(gameMode).type === 'fils' && <FilsIcon size={18} />}
                      {getRewardForMode(gameMode).type === 'derhem' && <DerhemIcon size={18} />}
                      {getRewardForMode(gameMode).type === 'dinar' && <DinarIcon size={18} />}
                    </span>
                    <span className="text-mono-300 dark:text-mono-700">|</span>
                    <span className="flex items-center gap-1 text-base font-bold text-red-500" dir="ltr">
                      -{getRewardForMode(gameMode).xp} <span className="text-xs">XP</span>
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 w-full mt-1 relative z-10">
                  <button
                    onClick={() => setIsForfeitConfirmOpen(false)}
                    className="flex-1 py-2.5 rounded-md font-bold text-sm text-mono-600 dark:text-mono-300 bg-mono-100 hover:bg-mono-200 dark:bg-mono-800 dark:hover:bg-mono-700 transition-all active:scale-95"
                  >
                    نەخێر
                  </button>
                  <button
                    onClick={() => { triggerHaptic(20); executeForfeitConfirmed(); }}
                    className="flex-1 py-2.5 rounded-md font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-all active:scale-95 shadow-sm"
                  >
                    بەلێ
                  </button>
                </div>
              </Motion.div>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* 6. LEVEL UP OVERLAY */}
        <LevelUpOverlay
          isVisible={isLevelingUp}
          newLevel={level}
          isDark={isSystemDark}
          onClose={() => {
            setIsLevelingUp(false);
            setNotifiedLevelDB(level); // Sync notified level to DB
            updateInventory({ fils: 100 }); // Bonus reward
          }}
        />

        {/* TEMPORARY MEDALS PREVIEW */}
        <Suspense fallback={null}>
          <AnimatePresence>
            
          </AnimatePresence>
        </Suspense>

      </div>
    </div>
  );
}


