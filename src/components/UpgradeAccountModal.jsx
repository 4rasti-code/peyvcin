import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAudio } from '../context/AudioContext';
import { useUser } from '../context/AuthContext';

const RESERVED_WORDS = ['admin', 'peyvok', 'official', 'support', 'moderator', 'staff', 'peyv', 'super', 'root'];
const NICKNAME_REGEX = /^[a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]{8,15}$/;

const FloatingInput = ({ label, value, onChange, id, type = 'text', required = false, isError = false, suffix = null, autoComplete = 'off', name = '' }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="relative w-full text-right">
            <label
                htmlFor={id}
                className={`block text-[11px] sm:text-[10px] font-black font-rabar mb-1.5 sm:mb-1 pr-2 uppercase transition-colors duration-200 ${isFocused ? 'text-emerald-400' : 'text-mono-400 dark:text-white/70 hover:text-mono-900 dark:hover:text-white/90'}`}
            >
                {label}
            </label>
            <div className={`
                relative w-full rounded-md transition-all duration-300 border flex items-center
                ${isFocused ? 'bg-mono-100 dark:bg-white/10 border-emerald-500/50' : 'bg-mono-50 dark:bg-white/5 border-mono-200 dark:border-white/10 hover:border-mono-400 dark:hover:border-white/20'}
                ${isError ? 'border-red-500/50' : ''}
                puzzle-tile overflow-hidden
            `}>
                <input
                    id={id}
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
                    name={name || id}
                    aria-label={label}
                    className={`w-full bg-transparent py-1.5 sm:py-1 pr-4 ${suffix ? 'pl-10' : 'pl-4'} font-rabar text-mono-900 dark:text-white text-base sm:text-sm font-bold focus:outline-none transition-all duration-200 caret-emerald-400 relative z-10`}
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
                <Motion.div
                    layoutId={`input-glow-${id}`}
                    className="absolute inset-0 bg-emerald-500/10 blur-2xl -z-10 rounded-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                />
            )}
        </div>
    );
};

export default function UpgradeAccountModal({ isOpen, onSuccess, onClose }) {
    const { playPopSound, playAlertSound } = useAudio();
    const { completeOnboarding } = useUser();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // OTP States
    const [showOtpScreen, setShowOtpScreen] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    // Validation States
    const [nameAvailability, setNameAvailability] = useState(null); // 'checking', 'available', 'taken', 'invalid'
    const [nameError, setNameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmError, setConfirmError] = useState('');

    // Real-time Availability Check
    useEffect(() => {
        if (!username || !isOpen) {
            setNameAvailability(null);
            setNameError('');
            return;
        }

        const checkName = async () => {
            const raw = username.trim();

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
                setNameAvailability('available');
                setNameError('');
            }
        };

        const debounce = setTimeout(checkName, 500);
        return () => clearTimeout(debounce);
    }, [username, isOpen]);

    // Real-time Password Validation
    useEffect(() => {
        if (!isOpen) return;

        const hasNumber = /\d/.test(password);
        const hasUpper = /[A-Z]/.test(password);

        if (password && (password.length < 8 || !hasNumber || !hasUpper)) {
            setPasswordError('پێدڤییە پەیڤا نهێنی کێمتر ژ ٨ پیتان نەبیت، و ژمارەک و پیتەکا مەزن تێدا بیت');
        } else {
            setPasswordError('');
        }

        if (confirmPassword && password !== confirmPassword) {
            setConfirmError('پەیڤێن نهێنی نە وەکی ئێکە، دوبارە تاقی بکە');
        } else {
            setConfirmError('');
        }
    }, [password, confirmPassword, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (nameAvailability !== 'available' || passwordError || confirmError || !password || !confirmPassword || !email) {
            playAlertSound();
            setError(nameError || passwordError || confirmError || 'ھیڤییە هەمی زانیاریان ب درستی پڕ بکە');
            return;
        }

        setLoading(true);
        setError(null);
        playPopSound();

        try {
            const finalUsername = username.trim();
            // 1. Update the profile first using the specific onboarding method.
            // This immediately updates local state (setting onboarded: true) via the database RPC.
            // and prevents the OnboardingView from appearing due to a race condition.
            const result = await completeOnboarding(finalUsername);
            if (!result.success) {
                throw new Error(result.error || "Failed to complete profile onboarding");
            }

            // 2. Upgrade anonymous user
            const { error: updateError } = await supabase.auth.updateUser({
                email: email,
                password: password,
                data: {
                    nickname: finalUsername,
                    name: finalUsername
                }
            });

            if (updateError) throw updateError;

            // Show OTP Screen for email verification
            setShowOtpScreen(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err) {
            playAlertSound();
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        playPopSound();
        setLoading(true);
        setError(null);

        try {
            const cleanEmail = email.trim().toLowerCase();
            // For anonymous user upgrading via updateUser, the token type is 'email_change'
            const { error } = await supabase.auth.verifyOtp({
                email: cleanEmail,
                token: otpCode.trim(),
                type: 'email_change'
            });

            if (error) {
                // If email_change fails, fallback to 'signup' just in case Supabase treats it as a new signup
                const { error: fallbackError } = await supabase.auth.verifyOtp({
                    email: cleanEmail,
                    token: otpCode.trim(),
                    type: 'signup'
                });
                if (fallbackError) throw fallbackError;
            }

            await supabase.auth.refreshSession();

            setShowOtpScreen(false);
            setOtpCode('');
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("OTP Error:", err);
            playAlertSound();
            setError("کۆدێ تە یێ شاشە یان دەمێ وی یێ ب سەرڤە چووی.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0 || loading) return;

        playPopSound();
        setLoading(true);
        setError(null);

        try {
            const cleanEmail = email.trim().toLowerCase();
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: cleanEmail
            });

            if (error) throw error;

            setError("کۆدەکێ نوی هاتە هنارتن بۆ ئیمێڵێ تە.");

            setResendCooldown(60);
            const timer = setInterval(() => {
                setResendCooldown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (err) {
            console.error("Resend OTP Error:", err);
            playAlertSound();
            let errMsg = err.message;
            if (errMsg.includes('security purposes') || errMsg.includes('rate limit')) {
                errMsg = 'تە داخوازیا گەلەک ئیمێڵان یا کری، هیڤییە کێمەکا دی تاقی بکەی.';
            }
            setError(`ئاریشەیەک هەبوو د هنارتنا کۆدی دا: ${errMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-2000 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" dir="rtl">
            <Motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-sm bg-mono-white dark:bg-mono-900 rounded-[12px] shadow-2xl border border-mono-200 dark:border-mono-800 overflow-hidden flex flex-col relative"
            >
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-mono-100 dark:bg-mono-800 text-mono-500 hover:text-mono-900 dark:hover:text-white transition-colors z-10"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                )}

                {/* Header */}
                {!showOtpScreen && (
                    <div className="p-5 border-b border-mono-100 dark:border-mono-800/50 bg-primary/5 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-1">
                                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    workspace_premium
                                </span>
                            </div>
                            <h3 className="text-lg font-black font-rabar text-mono-900 dark:text-white text-center">
                                تو گەهشتیە ئاستەکێ باش!
                            </h3>
                            <div className="flex flex-col gap-1 mt-1">
                                <p className="text-[11px] font-bold text-mono-500 text-center leading-relaxed">
                                    لێ بۆ پاراستنا ئاست و زانیاریێن خوە و بەردەوامبوونا یاریێ، پێدڤیە هژمارا خوە ب شێوەیەکێ فەرمی تۆمار بکەی.
                                </p>
                                <p className="text-[11px] font-bold text-mono-500 text-center leading-relaxed">
                                    ئەو کەسێن وەکو مێڤان خوە تۆمارکرین و بێی ئیمێل، دێ پشتی ٧ ڕۆژان ب شێوەیەکێ تۆتۆماتیکی هێنە ژێبرن د ناڤ یاریێ دا.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <div className="p-5">
                    {!showOtpScreen ? (
                        <form onSubmit={handleSubmit} className="flex flex-col space-y-3" autoComplete="off">

                            {/* Username Field */}
                            <div className="space-y-2">
                                <FloatingInput
                                    label="ناسناڤ"
                                    id="upgrade-username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    name="upgrade_user"
                                    isError={nameAvailability === 'taken' || nameAvailability === 'invalid'}
                                    suffix={<span className="material-symbols-outlined text-[18px]">person</span>}
                                />
                                <AnimatePresence>
                                    {nameAvailability && (
                                        <Motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className={`text-[10px] font-black font-rabar pt-1 pr-2 flex items-center gap-1.5 ${nameAvailability === 'available' ? 'text-emerald-400' :
                                                nameAvailability === 'checking' ? 'text-blue-400' : 'text-red-400'
                                                }`}>
                                                <span className="material-symbols-outlined text-[14px]">
                                                    {nameAvailability === 'available' ? 'check_circle' :
                                                        nameAvailability === 'checking' ? 'sync' : 'error'}
                                                </span>
                                                {nameAvailability === 'available' ? 'ناڤ یێ ئامادەیە' :
                                                    nameAvailability === 'checking' ? 'لێگەریان...' : nameError}
                                            </div>
                                        </Motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Email Field */}
                            <FloatingInput
                                label="ئیمێڵ"
                                id="upgrade-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                name="upgrade_email"
                                suffix={<span className="material-symbols-outlined text-[18px]">mail</span>}
                            />

                            {/* Password Field */}
                            <FloatingInput
                                label="پەیڤا نهێنی"
                                id="upgrade-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                name="upgrade_pass"
                                autoComplete="new-password"
                                suffix={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="flex items-center justify-center p-1 text-slate-900 dark:text-white/30 hover:text-emerald-600 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                }
                            />

                            {/* Confirm Password Field */}
                            <div className="space-y-2">
                                <FloatingInput
                                    label="پشتڕاستبوونا پەیڤا نهێنی"
                                    id="upgrade-confirm-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    name="upgrade_confirm_pass"
                                    autoComplete="new-password"
                                    suffix={<span className="material-symbols-outlined text-[18px]">lock_reset</span>}
                                />
                                <AnimatePresence>
                                    {(passwordError || confirmError) && (
                                        <Motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="text-[10px] font-black font-rabar pt-1 pr-2 flex items-center gap-1.5 text-red-400">
                                                <span className="material-symbols-outlined text-[14px]">error</span>
                                                {passwordError || confirmError}
                                            </div>
                                        </Motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* General Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <Motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="pt-2 overflow-hidden"
                                    >
                                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-[6px] flex items-center gap-2 text-red-500 dark:text-red-400">
                                            <span className="material-symbols-outlined text-[16px]">error</span>
                                            <span className="text-[10px] font-bold">{error}</span>
                                        </div>
                                    </Motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-4 w-full h-11 bg-primary hover:bg-primary-dark text-white rounded-[6px] font-black font-rabar text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                ) : (
                                    <>
                                        <span>تۆمارکرنا هەژمارێ</span>
                                        <span className="material-symbols-outlined text-[18px]">verified_user</span>
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-right space-y-2">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto mb-4">
                                    <span className="material-symbols-outlined text-2xl">mail_lock</span>
                                </div>
                                <h2 className="text-xl font-black font-heading text-mono-900 dark:text-white text-center">پشتڕاستکرنا ئیمێڵی</h2>
                                <p className="text-xs font-black font-rabar text-mono-500 text-center leading-relaxed">
                                    مە کۆدەکێ ٦ ژمارەیی هنارتە ئیمێڵێ تە: <br /> <span className="text-primary font-sans block mt-1">{email}</span>
                                </p>
                            </div>

                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <FloatingInput
                                    label="کۆدێ پشتڕاستکرنێ"
                                    id="otp-code"
                                    type="text"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    autoComplete="one-time-code"
                                    suffix={<span className="material-symbols-outlined text-[18px]">dialpad</span>}
                                />

                                <AnimatePresence>
                                    {error && (
                                        <Motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-3 mt-2 bg-red-500/10 border border-red-500/20 rounded-[6px] flex items-center gap-2 text-red-500 dark:text-red-400">
                                                <span className="material-symbols-outlined text-[16px]">error</span>
                                                <span className="text-[10px] font-bold">{error}</span>
                                            </div>
                                        </Motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    disabled={loading || otpCode.length < 6}
                                    className="w-full h-11 bg-primary hover:bg-primary-dark text-white rounded-[6px] font-black font-rabar text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                >
                                    {loading ? (
                                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                    ) : (
                                        <>
                                            <span>پشتڕاستکرن</span>
                                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                        </>
                                    )}
                                </button>

                                <div className="flex flex-col items-center gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={loading || resendCooldown > 0}
                                        className={`text-[11px] font-black font-rabar transition-colors ${resendCooldown > 0 ? 'text-mono-400 cursor-not-allowed' : 'text-primary hover:text-primary-dark'}`}
                                    >
                                        {resendCooldown > 0 ? `دوبارە هنارتن پشتی (${resendCooldown}) چرکەیا` : 'دوبارە هنارتنا کۆدی'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowOtpScreen(false);
                                            setError(null);
                                            setOtpCode('');
                                        }}
                                        className="text-[11px] font-black font-rabar text-mono-400 hover:text-mono-600 dark:hover:text-mono-300 mt-2"
                                    >
                                        ڤەگەڕیان بۆ پاش
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </Motion.div>
        </div>
    );
}
