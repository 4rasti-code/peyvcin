import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { playBackSfx, playTabSfx } from '../utils/audio';



const PrivacyPolicy = ({ onViewChange, onClose }) => {
    const [lang, setLang] = useState(() => {
        return localStorage.getItem('policy_lang') || 'ku';
    });

    const handleLanguageChange = (newLang) => {
        setLang(newLang);
        localStorage.setItem('policy_lang', newLang);
        playTabSfx();
    }; // 'en' or 'ku'
    const navigate = useNavigate();

    const handleNavigate = (path, policyKey) => {
        if (onViewChange && policyKey) {
            onViewChange(policyKey);
        } else {
            navigate(path);
        }
    };

    const handleClose = () => {
        playBackSfx();
        if (onClose) {
            onClose();
        } else {
            navigate('/');
        }
    };

    const content = {
        en: {
            title: "Privacy Policy",
            subtitle: "Last Updated: April 2, 2026",
            intro: "At Peyvok, we are committed to protecting your privacy and security. This Privacy Policy outlines how we handle your personal information when you use our application.",
            sections: [
                {
                    title: "1. Information We Collect",
                    text: "When you use Peyvok, we may collect the following information:",
                    list: [
                        "Public profile information (Name, Profile Picture) from Facebook, Google, or Apple.",
                        "Email address provided during sign-in.",
                        "Game data (scores, level, and virtual rewards) to maintain your ranking on the leaderboard.",
                        "Device information (language, device type)."
                    ]
                },
                {
                    title: "2. How We Use Facebook, Google, and Apple Data",
                    text: "If you choose to sign in via Facebook, Google, or Apple, we only access information you explicitly permit. We use this data to:",
                    list: [
                        "Create your unique game profile.",
                        "Display your name and country on the global leaderboards.",
                        "Synchronize your game progress across multiple devices."
                    ]
                },
                {
                    title: "3. Data Security",
                    text: "Your data is stored securely using Supabase. We do not sell or share your personal information with third parties for marketing purposes."
                },
                {
                    title: "4. Your Rights and Data Deletion",
                    text: "You have the right to access, edit, or delete your information at any time. Specifically for Facebook, Google, or Apple users:",
                    list: [
                        "To delete game activity, go to your Facebook, Google, or Apple profile > Settings & Privacy > Settings > Apps and Websites.",
                        "Find 'پەیڤۆک App' and click 'Remove'.",
                        "Alternatively, you can email us at support@peyvokgame.com to request full account and data deletion."
                    ]
                },
                {
                    title: "5. Contact Us",
                    text: "If you have any questions or concerns regarding this policy, please contact us at:",
                    email: "support@peyvokgame.com"
                }
            ]
        },
        ku: {
            title: "ڕێبازا پاراستنا نھێنیێ",
            subtitle: "دووماھیک نویژەنکرن: ٢ نیسان، ۲۰۲٦",
            intro: "ئەم ل پەیڤۆک ھەمی پێکۆلەکێ دکەین بۆ پاراستنا تایبەتمەندیا تە. ئەڤ ڕێبازە دیار دکەت کا ئەم چەوا پێزانینێن تە یێن کەسی بکار دهینین دەما تو یارییا مە بکار دهینی.",
            sections: [
                {
                    title: "١. ئەو پێزانینێن ئەم کۆم دکەین",
                    text: "دەما تو پەیڤۆک بکار دهینی، دبیت ئەڤ پێزانینە بھێنە کۆمکرن:",
                    list: [
                        "پێزانینێن گشتی یێن پڕۆفایلی (ناڤ، وێنە) ژ فەیسبۆکی، گۆگلی یان ئەپڵی.",
                        "ئیمەیڵا ھاتیە پێشکێشکرن دەما چوونەژوورێ.",
                        "داتایێن یاریێ (نمرەیان، ئاست، و پاداشتێن خەیالی) بۆ پاراستنا ڕێزا تە د لیستا سەرکەفتیاندا.",
                        "پێزانینێن ئامیرەیی (زمان، جۆرێ مۆبایلێ)."
                    ]
                },
                {
                    title: "٢. چەوا ئەم داتایێن فەیسبۆک، گۆگل و ئەپڵی بکار دهینین",
                    text: "ئەگەر تە ھەلبژارت ب ڕێیا فەیسبۆکی، گۆگلی یان ئەپڵی بچی د ژوورڤە، ئەم ب تنێ دەستەکا مە ل سەر وان پێزانینان ھەیە کو تە ڕێپێدان پێ دایە. ئەم ڤان داتایان بکار دهینین بۆ:",
                    list: [
                        "دروستکرنا پڕۆفایلێ تە یێ تایبەت د ناڤ یاریێدا.",
                        "پێشاندانا ناڤ و وەلاتێ تە د لیستا جیھانی یا سەرکەفتیاندا.",
                        "ھەڤدەمکرنا (Sync) پێشکەفتنا تە د یاریێدا د ناڤبەرا چەندین ئامیران دا."
                    ]
                },
                {
                    title: "٣. پاراستنا داتایان",
                    text: "داتایێن تە گەلەک ب تەناهی دھێنە پاراستن ب ڕێیا Supabase. ئەم چ پێزانینێن تە یێن تایبەت نادەینە چ لایەنەکێ دی بۆ مەبەستێن ڕیکلامێ."
                },
                {
                    title: "٤. مافێن تە و ژێبرنا داتایان",
                    text: "مافێ تە ھەیە ل ھەر دەمەکی پێزانینێن خوە ببینی، دەستکاری بکەی، یان ژی ببەی. تایبەت بۆ بکارھێنەرێن فەیسبۆک، گۆگل یان ئەپڵی:",
                    list: [
                        "بۆ ژێبرنا چالاکیێن یاریێ، ھەرە د ناڤ پڕۆفایلێ خوە یێ فەیسبۆکی، گۆگلی یان ئەپڵی > Settings & Privacy > Settings > Apps and Websites.",
                        "پەیڤۆک (پەیڤۆک App) بببینە و کلیک بکە ل سەر Remove.",
                        "یان ژی تو دشێی ئیمەیڵەکێ بۆ مە بهنێری ل سەر support@peyvokgame.com بۆ داخوازکرنا ژێبرنا ئێکجارە یا هژمارێ و ھەمی داتایێن یاریێ."
                    ]
                },
                {
                    title: "٥. پەیوەندی ب مە بکە",
                    text: "ئەگەر تە ھەر پسیارەک یان تێبینیەک ھەبیت ل سەر ڤێ ڕێبازێ، ھیڤییە پەیوەندیێ ب مە بکەی ب ڕێیا:",
                    email: "support@peyvokgame.com"
                }
            ]
        }
    };

    const current = content[lang];
    const isRTL = lang === 'ku';

    return (
        <div className={`min-h-screen bg-mono-white dark:bg-black text-mono-900 dark:text-mono-100 selection:bg-mono-900/30 dark:selection:bg-mono-50/30 selection:text-white ${isRTL ? 'font-rabar' : 'font-body'} p-6 sm:p-12`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-4xl mx-auto relative">
                {/* Header Section */}
                <div className="flex flex-col items-center justify-center mb-16 gap-8">
                    <div className="flex flex-col items-center justify-center group cursor-pointer" onClick={handleClose}>
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-mono-900 dark:text-white mb-1">{isRTL ? 'پەیڤۆک' : 'Peyvok'}</h1>
                            <p className="text-text-dim/60 text-xs font-bold uppercase tracking">{isRTL ? 'سیاسەتا تایبەتمەندیێ' : 'PRIVACY POLICY'}</p>
                        </div>
                    </div>

                    <div dir="ltr" className="flex bg-mono-100 dark:bg-black/40 p-1.5 rounded-md border border-mono-200 dark:border-white/5 backdrop-blur-md relative">
                        <div
                            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-mono-900 dark:bg-mono-50 rounded shadow-sm border border-mono-200 dark:border-white/10 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${lang === 'en' ? 'left-1.5' : 'left-[50%]'}`}
                        />
                        <button
                            onClick={() => handleLanguageChange('en')}
                            className={`flex-1 relative z-10 px-6 py-2.5 rounded-md text-xs font-bold transition-colors duration-300 flex items-center justify-center gap-2 ${lang === 'en' ? 'text-mono-50 dark:text-mono-900' : 'text-mono-500 dark:text-mono-400 hover:text-mono-900 dark:hover:text-mono-50'}`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => handleLanguageChange('ku')}
                            className={`flex-1 relative z-10 px-6 py-2.5 rounded-md text-xs font-bold transition-colors duration-300 flex items-center justify-center gap-2 ${lang === 'ku' ? 'text-mono-50 dark:text-mono-900' : 'text-mono-500 dark:text-mono-400 hover:text-mono-900 dark:hover:text-mono-50'}`}
                        >
                            <span>کوردی</span>
                        </button>
                    </div>
                </div>

                {/* Content Card */}
                <Motion.div
                    key={lang}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-mono-50 dark:bg-mono-900/50 backdrop-blur-2xl border border-mono-200 dark:border-white/5 rounded-md p-6 sm:p-10 relative text-start"
                >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-mono-500/50 to-transparent opacity-30"></div>



                    <p className={`text-sm text-mono-800 dark:text-white/90 mb-8 leading-relaxed font-normal italic border-mono-900 dark:border-mono-50 ${lang === 'ku' ? 'border-r-4 pr-4' : 'border-l-4 pl-4'}`}>
                        {current.intro}
                    </p>

                    <div className="space-y-8">
                        {current.sections.map((section, idx) => (
                            <section key={idx} className="relative">
                                <h3 className="text-lg font-medium text-mono-900 dark:text-white/90 mb-4 flex items-center gap-3">
                                    {section.title}
                                </h3>
                                <p className="text-sm text-mono-800 dark:text-white/90 leading-relaxed font-normal mb-4">{section.text}</p>
                                {section.list && (
                                    <ul className="space-y-4 pr-12">
                                        {section.list.map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-xs text-mono-800 dark:text-white/90 font-normal group">
                                                <div className="w-1.5 h-1.5 rounded-md bg-mono-900 dark:bg-mono-50 mt-2.5 transition-transform group-hover:scale-150"></div>
                                                <span className="flex-1">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {section.email && (
                                    <a href={`mailto:${section.email}`} className="inline-block mt-2 text-mono-900 dark:text-mono-50 font-medium text-base hover:text-white transition-colors border-b-2 border-mono-300 dark:border-mono-600 pb-1">
                                        {section.email}
                                    </a>
                                )}
                            </section>
                        ))}
                    </div>
                </Motion.div>

                {/* Footer */}
                <div className="mt-16 text-center space-y-8">
                    <div className="flex flex-wrap items-center justify-center gap-6 text-mono-800 dark:text-white/90 font-medium text-[11px] uppercase antialiased">
                        <button onClick={() => handleNavigate('/data-deletion', 'deletion')} className="text-mono-500 dark:text-white/50 hover:text-mono-900 dark:hover:text-white transition-colors">{lang === 'ku' ? 'ژێبرنا داتایان' : 'Data Deletion'}</button>
                        <span className="w-1 h-1 rounded-md bg-white/10"></span>
                        <button className="text-blue-600 dark:text-blue-400 font-bold pointer-events-none">{lang === 'ku' ? 'سیاسەتا تایبەتمەندیێ' : 'Privacy Policy'}</button>
                        <span className="w-1 h-1 rounded-md bg-white/10"></span>
                        <button onClick={() => handleNavigate('/terms-of-service', 'terms')} className="text-mono-500 dark:text-white/50 hover:text-mono-900 dark:hover:text-white transition-colors">{lang === 'ku' ? 'مەرجێن خزمەتگوزاریێ' : 'Terms of Service'}</button>
                    </div>

                    <button
                        onClick={handleClose}
                        className="bg-mono-900 text-mono-50 dark:bg-mono-50 dark:text-mono-900 px-6 py-3 rounded-md font-bold text-xs uppercase hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto mt-8"
                    >
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                        {lang === 'ku' ? 'ڤەگەڕە' : 'Back to Game'}
                    </button>
                    <p className="mt-8 text-center text-mono-500 dark:text-white/50 text-xs font-normal uppercase antialiased opacity-90">
                        {isRTL ? '© ٢٠٢٦ تیما پەیڤۆک • هاتیە دروستکرن بۆ کەلەپووری' : '© 2026 Peyvok Team • Built for Heritage'}
                    </p>
                </div>
            </div>

            <style>{`
 .animate-pulse-slow {
 animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
 }
 @keyframes pulse {
 0%, 100% { opacity: 0.3; transform: scale(1); }
 50% { opacity: 0.15; transform: scale(1.1); }
 }
 `}</style>
        </div>
    );
};

export default PrivacyPolicy;


