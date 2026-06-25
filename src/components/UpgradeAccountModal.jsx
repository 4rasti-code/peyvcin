import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAudio } from '../context/AudioContext';
import { useUser } from '../context/AuthContext';
import { triggerHaptic } from '../utils/haptics';

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
    const { playPopSound, playAlertSound, playTabSound } = useAudio();
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

    // Social Login
    const handleSocialLogin = async (provider) => {
        try {
            setLoading(true);
            setError(null);
            console.log(`[UpgradeAccountModal] Starting OAuth with ${provider}...`);

            playTabSound();
            triggerHaptic(10);

            // Explicitly define the redirect URL to current location
            // Use environment variable or default to current origin
            const redirectTo = window.location.origin;
            console.log(`[UpgradeAccountModal] Redirect URL:`, redirectTo);

            const options = {
                redirectTo: redirectTo,
                skipBrowserRedirect: false
            };

            if (provider === 'google') {
                options.queryParams = {
                    access_type: 'offline',
                    prompt: 'consent',
                };
            }

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options
            });

            if (error) throw error;
            console.log(`[UpgradeAccountModal] OAuth request sent successfully:`, data);

        } catch (err) {
            console.error(`[UpgradeAccountModal] Social login error (${provider}):`, err);
            playAlertSound();
            setError(err.message || "هەڵەیەک ڕوویدا لە کاتی چوونە ژوورەوە");
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
                        <>
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

                        <div className="mt-4">
                            <div className="flex items-center gap-4 mb-3 text-mono-400 dark:text-white/30">
                                <div className="flex-1 h-px bg-current opacity-20"></div>
                                <span className="text-[10px] font-black font-rabar opacity-60">یان ب ڕێکا</span>
                                <div className="flex-1 h-px bg-current opacity-20"></div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleSocialLogin('google')}
                                disabled={loading}
                                className="w-full h-10 sm:h-9 rounded-md bg-white text-mono-900 border border-mono-200 flex items-center justify-center gap-3 hover:bg-gray-50 active:scale-95 transition-all shadow-sm font-bold font-rabar text-sm sm:text-xs"
                                title="Google"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1c-4.3 0-8.01 2.47-9.82 6.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                </svg>
                                <span className="relative z-10 font-bold text-[15px]">گۆگڵ</span>
                            </button>

                            {/* DISCORD BUTTON */}
                            <button
                                type="button"
                                onClick={() => handleSocialLogin('discord')}
                                disabled={loading}
                                className="w-full mt-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-md h-10 sm:h-9 font-bold font-rabar text-sm sm:text-xs transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                                </svg>
                                <span className="relative z-10 font-bold text-[15px]">دیسکۆرد</span>
                            </button>
                        </div>
                        </>
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
