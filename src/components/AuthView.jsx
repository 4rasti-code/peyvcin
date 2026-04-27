import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { triggerHaptic } from '../utils/haptics';
import { playAlertSfx, playBackSfx } from '../utils/audio';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import DataDeletion from './DataDeletion';
import FloatingLetterBackground from './FloatingLetterBackground';
import { useGame } from '../context/GameContext';

const COUNTRIES = [
  { name: 'کوردستان', code: 'KD', flag: '☀️' },
  { name: 'عێراق', code: 'IQ', flag: '🇮🇶' },
  { name: 'تورکیا', code: 'TR', flag: '🇹🇷' },
  { name: 'ئێران', code: 'IR', flag: '🇮🇷' },
  { name: 'سووریا', code: 'SY', flag: '🇸🇾' },
  { name: 'ئەلمانیا', code: 'DE', flag: '🇩🇪' },
  { name: 'سوید', code: 'SE', flag: '🇸🇪' },
  { name: 'بەریتانیا', code: 'GB', flag: '🇬🇧' },
  { name: 'ئەمریکا', code: 'US', flag: '🇺🇸' },
  { name: 'فەڕەنسا', code: 'FR', flag: '🇫🇷' },
  { name: 'ھۆڵەندا', code: 'NL', flag: '🇳🇱' },
  { name: 'نەرویج', code: 'NO', flag: '🇳🇴' },
  { name: 'دانیمارک', code: 'DK', flag: '🇩🇰' },
  { name: 'بەبەلجیکا', code: 'BE', flag: '🇧🇪' },
  { name: 'سویسرا', code: 'CH', flag: '🇨🇭' },
  { name: 'نەمسا', code: 'AT', flag: '🇦ت' },
  { name: 'ئیتالیا', code: 'IT', flag: '🇮🇹' },
  { name: 'کەنەدا', code: 'CA', flag: '🇨🇦' },
  { name: 'ئوسترالیا', code: 'AU', flag: '🇦🇺' },
  { name: 'ئیمارات', code: 'AE', flag: '🇦🇪' },
  { name: 'قەتەر', code: 'QA', flag: '🇶🇦' },
  { name: 'کوەیت', code: 'KW', flag: '🇰🇼' },
  { name: 'ئوردن', code: 'JO', flag: '🇯🇴' },
  { name: 'لوبنان', code: 'LB', flag: '🇱🇧' },
  { name: 'میسر', code: 'EG', flag: '🇪🇬' },
  { name: 'فینلەندا', code: 'FI', flag: '🇫🇮' },
  { name: 'یۆنان', code: 'GR', flag: '🇬🇷' },
  { name: 'ئیسپانیا', code: 'ES', flag: '🇪🇸' },
  { name: 'پۆڵەندا', code: 'PL', flag: '🇵🇱' },
  { name: 'ڕووسیا', code: 'RU', flag: '🇷🇺' },
  { name: 'چین', code: 'CN', flag: '🇨🇳' },
  { name: 'ژاپۆن', code: 'JP', flag: '🇯🇵' },
];

const RESERVED_WORDS = ['admin', 'peyvcin', 'official', 'support', 'moderator', 'staff', 'peyv', 'super', 'root'];
const NICKNAME_REGEX = /^[a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]{8,15}$/;

const KurdistanFlag = () => (
  <svg viewBox="0 0 512 341" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
    <path fill="#ed2024" d="M0 0h512v113.8H0z"/>
    <path fill="#fff" d="M0 113.8h512v113.4H0z"/>
    <path fill="#278e3c" d="M0 227.2h512v113.8H0z"/>
    <g transform="translate(256 170.5)">
      <circle fill="#f8e71c" r="54"/>
      {Array.from({ length: 21 }).map((_, i) => (
        <path 
          key={i}
          fill="#f8e71c" 
          d="M0-65L6-45h-12z" 
          transform={`rotate(${(i * 360) / 21})`}
        />
      ))}
      <circle fill="#f8e71c" r="22"/>
    </g>
  </svg>
);

const FlagIcon = ({ code, isKurdistan, size = 'w-10 h-10' }) => {
  if (isKurdistan) return <div className={`${size} overflow-hidden rounded-sm`}><KurdistanFlag /></div>;
  const url = `https://purecatamphetamine.github.io/country-flag-icons/3x2/${code.toUpperCase()}.svg`;
  return (
    <div className={`${size} overflow-hidden rounded-sm bg-black/5`}>
      <img src={url} alt={code} className="w-full h-full object-cover" />
    </div>
  );
};

const FloatingInput = ({ label, value, onChange, type = 'text', required = false, isError = false, suffix = null, autoComplete = 'off', name = '' }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative w-full text-right">
      <label className={`block text-[11px] font-black font-rabar mb-1.5 pr-2 uppercase tracking-[0.15em] transition-colors duration-200 ${isFocused ? 'text-emerald-400' : 'text-white/70 hover:text-white/90'}`}>
        {label}
      </label>
      <div className={`
        relative w-full rounded-2xl transition-all duration-300 border flex items-center
        ${isFocused ? 'bg-white/10 border-emerald-500/50 ring-4 ring-emerald-500/10' : 'bg-white/5 border-white/10 hover:border-white/20'}
        ${isError ? 'border-red-500/50' : ''}
        puzzle-tile overflow-hidden
      `}>
        <input
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onMouseDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => {
            e.stopPropagation();
            e.target.select();
          }}
          autoComplete={autoComplete}
          name={name}
          className={`w-full bg-transparent py-2 pr-5 ${suffix ? 'pl-12' : 'pl-5'} font-rabar text-white text-lg font-bold focus:outline-none transition-all duration-200 caret-emerald-400 relative z-10`}
          style={{ 
            appearance: 'none', 
            userSelect: 'text', 
            WebkitUserSelect: 'text',
            cursor: 'text',
            touchAction: 'manipulation'
          }}
        />
        {suffix && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-emerald-400 transition-colors z-20 flex items-center justify-center">
            {suffix}
          </div>
        )}
      </div>
      
      {/* Caret / Cursor Highlight for active field */}
      {isFocused && (
        <motion.div 
          layoutId="input-glow"
          className="absolute inset-0 bg-emerald-500/10 blur-2xl -z-10 rounded-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </div>
  );
};

export default function AuthView({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedCountry] = useState(COUNTRIES[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validation States
  const [nameAvailability, setNameAvailability] = useState(null); // 'checking', 'available', 'taken', 'invalid'
  const [nameError, setNameError] = useState('');
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [activePolicyModal, setActivePolicyModal] = useState(null); // 'terms', 'privacy', 'deletion'

  // Real-time Availability Check
  React.useEffect(() => {
    if (isLogin || !nickname) {
      setNameAvailability(null);
      setNameError('');
      return;
    }

    const checkName = async () => {
      const raw = nickname.trim();
      
      // 1. Basic Format Validation
      if (raw.includes(' ')) {
        setNameAvailability('invalid');
        setNameError('نابیت چ ڤالاهی(سپەیس) دناڤبەرا ناڤێ تەدا هەبیت');
        return;
      }
      if (raw.length < 8 || raw.length > 15) {
        setNameAvailability('invalid');
        setNameError('کێمترە ژ ٨ پیتان یان زێدەترە ژ ١٥ پیتان');
        return;
      }
      if (!NICKNAME_REGEX.test(raw)) {
        setNameAvailability('invalid');
        setNameError('بنتنێ پیت، ژمارە و (_) دهێنە پەژراندن');
        return;
      }
      if (RESERVED_WORDS.includes(raw.toLowerCase())) {
        setNameAvailability('invalid');
        setNameError('ئەڤ ناڤە ڕێپێدای نینە');
        return;
      }

      setNameAvailability('checking');
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('nickname')
          .ilike('nickname', raw)
          .maybeSingle();
        
        if (data) {
          setNameAvailability('taken');
          setNameError('ئەڤ ناڤە یێ ھاتییە برن');
        } else {
          setNameAvailability('available');
          setNameError('');
        }
      } catch {
        // If single() fails with 406 (no rows), it's available
        setNameAvailability('available');
        setNameError('');
      }
    };

    const debounce = setTimeout(checkName, 500);
    return () => clearTimeout(debounce);
  }, [nickname, isLogin]);

  // Real-time Password Validation
  React.useEffect(() => {
    if (isLogin) {
      setPasswordError('');
      setConfirmError('');
      return;
    }

    const hasNumber = /\d/.test(password);
    const hasUpper = /[A-Z]/.test(password);

    if (password && (password.length < 8 || !hasNumber || !hasUpper)) {
      setPasswordError('پێدڤییە بۆرینپەیڤ کێمتر ژ ٨ پیتان نەبیت، و ژمارەک و پیتەکا مەزن تێدا بیت');
    } else {
      setPasswordError('');
    }

    if (confirmPassword && password !== confirmPassword) {
      setConfirmError('بۆرینپەیڤ نە وەکی ئێکە، دوبارە تاقی بکە');
    } else {
      setConfirmError('');
    }
  }, [password, confirmPassword, isLogin]);

  const handleAuth = async (e) => {
    e.preventDefault();
    triggerHaptic(10);
    playTabSound();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onAuthSuccess(data.user, data.user?.user_metadata?.nickname);
      } else {
        // Double check validation before sign up
        if (nameAvailability !== 'available' || passwordError || confirmError || !password || !confirmPassword) {
          playAlertSfx();
          setError(nameError || passwordError || confirmError || 'ھیڤییە هەمی زانیاریان ب درستی پڕ بکەو');
          setLoading(false);
          return;
        }

        // SIGNUP FLOW
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nickname: nickname,
              name: nickname,       // دا کو ڕۆبۆتێ سۆپەبێیسێ تێبگەهیت
              username: nickname,   // نوسخەیەکا دی بۆ دڵنیابوونێ
              country: selectedCountry.name,
              country_code: selectedCountry.code,
            }
          }
        });
        
        if (error) throw error;
        
        // The profile creation (Registration Bridge) is handled entirely by the Supabase 
        // handle_new_user trigger which reads the metadata provided above. 
        // We do not do a manual insert here to avoid 409 Conflicts and RLS errors.

        if (data.session) {
          onAuthSuccess(data.user, nickname);
        } else {
          setRegistrationSuccess(true);
          setConfirmPassword('');
          setPassword('');
          setIsLogin(true);
          // Scroll to top to see success message
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (err) {
      console.error("Supabase Error Details:", err); // ئەڤە زێدە بکە
      playAlertSfx();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const { playTabSound } = useGame();

  const handleSocialLogin = async (provider) => {
    try {
      playTabSound();
      triggerHaptic(10);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      playAlertSfx();
      setError(err.message);
      setLoading(false);
    }
  };

  const bgRef = useRef(null);

  const handleBackgroundClick = (e) => {
    // Pulse on background void clicks or specific trigger zones
    if (e.target === e.currentTarget || e.target.classList.contains('auth-view-container')) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      bgRef.current?.pulse(x, y);
    }
  };

  return (
    <div 
      onClick={handleBackgroundClick}
      className="flex-1 w-full max-w-lg mx-auto flex flex-col items-center justify-center pt-[env(safe-area-inset-top,24px)] px-6 pb-[env(safe-area-inset-bottom,24px)] h-full animate-in fade-in duration-500 overflow-hidden relative auth-view-container bg-[#020617]"
    >
      <FloatingLetterBackground ref={bgRef} />
      
      <div className="flex flex-col items-center mb-4 text-center relative z-20">
         <h1 className="text-5xl font-black font-heading text-white text-pop tracking-tight transform hover:scale-110 transition-transform duration-500">پەیڤچن</h1>
         <div className="w-12 h-0.5 bg-white/20 rounded-full mt-4"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full px-8 py-5 sm:px-12 sm:py-7 relative z-20 bg-[#020617] rounded-[32px] border border-white/5 shadow-2xl"
      >
        <div className="relative z-10 w-full">
          {/* SEGMENTED TOGGLE (THE "BUTTON" PART) */}
          <div className="flex p-0.5 bg-slate-900/95 rounded-2xl border border-white/10 mb-5 relative z-10">
            <motion.div 
              className="absolute top-1 bottom-1 bg-[#0095f6] rounded-xl shadow-[0_0_15px_rgba(0,149,246,0.5)]"
              initial={false}
              animate={{ 
                right: isLogin ? '4px' : '50%', 
                left: isLogin ? '50%' : '4px' 
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            <button 
              onClick={() => {
                triggerHaptic(10);
                playTabSound();
                setIsLogin(true);
              }}
              className={`flex-1 relative z-10 py-3 text-sm font-black font-rabar transition-colors duration-300 ${isLogin ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
            >
              چوونا ژوورێ
            </button>
            <button 
              onClick={() => {
                triggerHaptic(10);
                playTabSound();
                setIsLogin(false);
              }}
              className={`flex-1 relative z-10 py-3 text-sm font-black font-rabar transition-colors duration-300 ${!isLogin ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
            >
              تۆمارکرن
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
              className="mb-4"
            >
              <p className="text-[10px] font-black font-rabar text-emerald-400 uppercase tracking-[0.25em] leading-none no-stroke mb-1 text-right">
                 {isLogin ? 'WELCOME BACK / بخێرھاتی' : 'NEW ACCOUNT / ھەژمارەکا نوی'}
              </p>
              <h2 className="text-2xl font-black font-heading text-white text-pop uppercase tracking-wide text-right">
                {isLogin ? 'چوونا ژوورێ' : 'تۆمارکرن'}
              </h2>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {registrationSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400"
              >
                <span className="material-symbols-outlined shrink-0 text-2xl">check_circle</span>
                <p className="text-xs font-black font-rabar leading-relaxed">
                  هەژمار ب سەرکەڤتی هاتە دروستکرن! نۆکە تو دشێی بچیە د ژوورڤە
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAuth} className="space-y-4" autoComplete="off">
            {!isLogin && (
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-2">
                  <FloatingInput 
                    label="ناسناڤ"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    name="peyvcin_reg_user"
                    autoComplete="off"
                    isError={nameAvailability === 'taken' || nameAvailability === 'invalid'}
                  />
                  
                  {/* Validation Feedback */}
                  <AnimatePresence>
                    {nameAvailability && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className={`text-[10px] font-black font-rabar pt-1 pr-2 flex items-center gap-1.5 ${
                          nameAvailability === 'available' ? 'text-emerald-400' : 
                          nameAvailability === 'checking' ? 'text-blue-400' : 'text-red-400'
                        }`}>
                          <span className="material-symbols-outlined text-[14px]">
                            {nameAvailability === 'available' ? 'check_circle' : 
                             nameAvailability === 'checking' ? 'sync' : 'error'}
                          </span>
                          {nameAvailability === 'available' ? 'ناڤ یێ ئامادەیە' : 
                           nameAvailability === 'checking' ? 'لێگەریان...' : nameError}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            <FloatingInput 
              label="ئیمەیڵ"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              name="peyvcin_auth_email"
              autoComplete="off"
            />

            <FloatingInput 
              label="بۆرینپەیڤ"
              type={showPassword ? 'text' : 'password'}
              value={password}
              name="peyvcin_auth_pass"
              autoComplete={isLogin ? "current-password" : "new-password"}
              onChange={(e) => {
                setPassword(e.target.value);
                if (registrationSuccess) setRegistrationSuccess(false);
              }}
              required
              suffix={
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center justify-center p-2 text-slate-900 hover:text-emerald-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              }
            />

            {!isLogin && (
              <div className="space-y-2">
                <FloatingInput 
                  label="دوبارەکرنا بۆرینپەیڤ"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  name="peyvcin_reg_confirm"
                  autoComplete="new-password"
                />
                
                <AnimatePresence>
                  {(passwordError || confirmError) && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="text-[10px] font-black font-rabar pt-1 pr-2 flex items-center gap-1.5 text-red-400">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        {passwordError || confirmError}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold font-body text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#0095f6] hover:bg-[#1877f2] active:scale-[0.98] text-white rounded-lg font-bold font-rabar text-sm transition-all flex items-center justify-center gap-2 mt-2 shadow-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>{isLogin ? 'چوونا ژوورێ' : 'تۆمارکرن'}</span>
              )}
            </button>
          </form>

          {/* Minimal Social Section */}
          <div className="mt-12">
             <div className="flex items-center gap-4 mb-8 text-on-surface/30">
                <div className="flex-1 h-px bg-current opacity-20"></div>
                <span className="text-[10px] font-bold  uppercase tracking-widest font-body opacity-60">یان</span>
                <div className="flex-1 h-px bg-current opacity-20"></div>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <button 
                   onClick={() => handleSocialLogin('google')}
                   className="h-12 rounded-xl bg-white text-black border border-outline/10 flex items-center justify-center gap-3 hover:bg-gray-50 active:scale-95 transition-all font-bold text-sm shadow-sm"
                >
                   <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                   </svg>
                   <span>Google</span>
                </button>
                <button 
                   onClick={() => handleSocialLogin('facebook')}
                   className="h-12 rounded-xl bg-[#1877F2] text-white flex items-center justify-center gap-3 hover:bg-[#1877F2]/90 active:scale-95 transition-all font-bold text-sm shadow-sm"
                >
                   <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                   </svg>
                   <span>Facebook</span>
                </button>
             </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-6">
            <p className="text-[10px] text-on-surface/30 font-bold uppercase text-center tracking-widest max-w-xs leading-relaxed italic">
               ب کۆماربوونێ د ناڤ یاریێدا، تو دشێی نمرێن خۆ پارێزی و پێشبڕکێیێ بکەی.
            </p>

        <div className="flex items-center gap-4 text-[10px] font-bold  uppercase tracking-[0.2em] text-on-surface/20">
          <button 
            type="button"
            onClick={() => setActivePolicyModal('terms')} 
            className="hover:text-primary transition-colors uppercase"
          >
            Terms
          </button>
          <span className="w-1 h-1 rounded-full bg-on-surface/5"></span>
          <button 
            type="button"
            onClick={() => setActivePolicyModal('privacy')} 
            className="hover:text-primary transition-colors uppercase"
          >
            Privacy
          </button>
          <span className="w-1 h-1 rounded-full bg-on-surface/5"></span>
          <button 
            type="button"
            onClick={() => setActivePolicyModal('deletion')} 
            className="hover:text-primary transition-colors uppercase"
          >
            Deletion
          </button>
        </div>
          </div>
        </div>
      </motion.div>

      <PolicyModal 
        isOpen={!!activePolicyModal} 
        onClose={() => setActivePolicyModal(null)} 
        type={activePolicyModal} 
        onViewChange={setActivePolicyModal}
      />
    </div>
  );
}

const PolicyModal = ({ isOpen, onClose, type, onViewChange }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [type]);

  const renderContent = () => {
    const props = { onViewChange, onClose };
    switch (type) {
      case 'terms': return <TermsOfService {...props} />;
      case 'privacy': return <PrivacyPolicy {...props} />;
      case 'deletion': return <DataDeletion {...props} />;
      default: return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          ref={scrollRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-1000 flex flex-col bg-[#050510] overflow-y-auto"
        >
          {/* Custom Header for Policy Modals */}
          <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-[#050510]/80 backdrop-blur-xl border-b border-white/5">
            <h3 className="text-xl font-black font-heading text-white uppercase tracking-wider">
               {type === 'terms' ? 'Terms of Service' : type === 'privacy' ? 'Privacy Policy' : 'Data Deletion'}
            </h3>
            <button 
              onClick={() => {
                playBackSfx();
                onClose();
              }}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-white text-2xl">close</span>
            </button>
          </div>
          
          <div className="flex-1">
            {renderContent()}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
