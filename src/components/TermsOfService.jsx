import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { playBackSfx, playTabSfx } from '../utils/audio';
import { useNavigate } from 'react-router-dom';



const TermsOfService = ({ onViewChange, onClose }) => {
    const [lang, setLang] = useState(() => {
        return localStorage.getItem('policy_lang') || 'ku';
    });

    const handleLanguageChange = (newLang) => {
        setLang(newLang);
        localStorage.setItem('policy_lang', newLang);
        playTabSfx();
    };
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
            title: "Terms of Service",
            subtitle: "Last Updated: April 2, 2026",
            intro: "Welcome to Peyvok. By accessing or using our application, you agree to be bound by these Terms of Service. Please read them carefully.",
            sections: [
                {
                    title: "1. Acceptance of Terms",
                    text: "By creating an account or using any part of the Peyvok platform, you confirm that you have read, understood, and agreed to these terms. If you do not agree, you must not use our services."
                },
                {
                    title: "2. License to Use",
                    text: "We grant you a non-exclusive, non-transferable, revocable license to use Peyvok for personal, non-commercial entertainment purposes only.",
                    list: [
                        "You may not reverse engineer or modify the game files.",
                        "Commercial use of our logos and assets is strictly prohibited."
                    ]
                },
                {
                    title: "3. User Accounts",
                    text: "You are responsible for maintaining the confidentiality of your login credentials (via Facebook, Google, or Apple).",
                    list: [
                        "You are responsible for all activities occurring under your account.",
                        "Notify us immediately of any unauthorized access."
                    ]
                },
                {
                    title: "4. Intellectual Property",
                    text: "All content within پەیڤۆک, including logos, graphics, word lists, and software, is the exclusive property of پەیڤۆک and its creators, protected by international copyright laws."
                },
                {
                    title: "5. Prohibited Conduct",
                    text: "To maintain a fair gaming environment, users are prohibited from:",
                    list: [
                        "Using cheats, hacks, or automation software.",
                        "Harassing other players or using offensive language in profiles.",
                        "Attempting to disrupt our technical infrastructure."
                    ]
                },
                {
                    title: "6. Limitation of Liability",
                    text: "پەیڤۆک provides its services 'as is'. We are not responsible for technical glitches, data loss, or server downtime. Our total liability shall not exceed the amount you paid to use the service (if any)."
                },
                {
                    title: "7. Virtual Currency",
                    text: "Any in-game currency (e.g., Fils, Derhem, Dinar) or rewards provided in پەیڤۆک are purely virtual. They have no real-world monetary value, cannot be exchanged for real money, and are used exclusively for in-game entertainment."
                },
                {
                    title: "8. Changes to Terms",
                    text: "We reserve the right to modify these terms at any time. We will notify you of major changes through the application.",
                    email: "support@peyvokgame.com"
                }
            ]
        },
        ku: {
            title: "مەرجێن بکارهینانێ",
            subtitle: "دووماھیک نویژەنکرن: ٢ نیسان، ٢٠٢٦",
            intro: "بخێر بێی بۆ پەیڤۆک. ب چوونە ژوور یان بکارهینانا ڤێ یاریێ، تو ڕازی دبی کو پابەندی ڤان مەرج و ڕێسایان بی. ھیڤییە ب ھووری بخوینە.",
            sections: [
                {
                    title: "١. پەژراندنا مەرجان",
                    text: "ب دروستکرنا هژمارێ یان بکارهینانا ھەر پشکەکا پەیڤۆک، تو پشتڕاست دکەی کو تە ئەڤ مەرجە خواندینە، تێگەھشتی، و پێ ڕازی بی. ئەگەر تو پێ ڕازی نەبی، نەدروستە خزمەتگوزاریێن مە بکاربهینی."
                },
                {
                    title: "٢. مۆڵەتا بکارھێنەران",
                    text: "ئەم مۆڵەتەکا نە-تایبەت و سنووردار ددەینە تە کو پەیڤۆک بکاربهینی ب تنێ بۆ مەبەستێن کەسی و نەک بۆ کارێن بازرگانی.",
                    list: [
                        "تو نەشێی فایلێن یاریێ کۆپی بکەی یان دەستکاری بکەی.",
                        "بکارهینانا بازرگانی ژ لۆگۆ و ناڤ و نیشانێن یاریێ قەدەغەیە بێی ڕێپێدان."
                    ]
                },
                {
                    title: "٣. بەرپرسیارەتییا هژمارێ",
                    text: "تو بەرپرسیاری ژ پاراستنا نھێنیا پێزانینێن چوونە ژوور (فەیسبۆک/گۆگل/ ئەپڵ).",
                    list: [
                        "ھەمی چالاکیێن د ناڤ هژمارا تە دا دھێنە کرن، تو بەرپرسیاری ژێ.",
                        "ئەگەر تە ھەست ب ھەر فێلبازیەکێ کر د هژمارا خوە دا، زوو مە ئاگەھدار بکە."
                    ]
                },
                {
                    title: "٤. مافێن خودانیێ",
                    text: "ھەمی ناڤەرۆکا پەیڤۆک، ژ لۆگۆ، گرافیک، لیستێن پەیڤان، و پڕۆگرامان، مافێ تایبەت یێ پەیڤۆک و خودانانە و ژ لایێ یاسا نێڤدەولەتیڤە پاراستیە."
                },
                {
                    title: "٥. کارێن قەدەغەکری",
                    text: "بۆ پاراستنا ژینگەکا دادپەروەر د یاریێدا، بۆ بکارھێنەران قەدەغەیە:",
                    list: [
                        "بکارهینانا ھاک و پڕۆگرامێن فێلبازیێ بۆ سەرکەفتنێ.",
                        "تەنگاڤکرنا یاریزانێن دی یان بکارهینانا پەیڤێن نەجوان د ناڤ و پڕۆفایلاندا.",
                        "پێکۆلکرن بۆ تێکدان یان ھێرشێن تەکنیکی بۆ سەر یاریێ."
                    ]
                },
                {
                    title: "٦. سنووردارکرنا بەرپرسیارەتیێ",
                    text: "پەیڤۆک خزمەتگوزاریێن خوە پێشکێش دکەت ب ڤی ڕەنگی یێ ھەی. ئەم بەرپرس نینین ژ چ کێشێن تەکنیکی, ژ دەستچوونا داتایان, یان ڕاگرتنا سێرڤەران."
                },
                {
                    title: "٧. دراڤێ خەیاڵی یێ ناڤ یاریێ",
                    text: "ھەمی جۆرێن دراڤی یان خالان یێن کو د ناڤ یاریێ دا دھێنە دان (وەکی فلس, دەرهەم, دینار) ب تنێ بۆ مەبەستا دەربازکرنا دەمی نە د ناڤ یاریێ دا و چ بھایەکێ ڕاستەقینە یێ ماددی نینە و نابیت ب پارێ ڕاستەقینە بھێنە فرۆشتن یان ئاڵوگۆڕکرن."
                },
                {
                    title: "٨. گوھۆڕینا مەرجان",
                    text: "مە ماف ھەیە ل ھەر دەمەکی ڤان مەرجان بگوھۆڕین. ئەم دێ تە ژ گوھۆڕینێن مەزن ئاگەھدار کەین.",
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
                            <p className="text-text-dim/60 text-xs font-bold uppercase tracking">{isRTL ? 'مەرجێن خزمەتگوزاریێ' : 'TERMS OF SERVICE'}</p>
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
                        <button onClick={() => handleNavigate('/privacy-policy', 'privacy')} className="text-mono-500 dark:text-white/50 hover:text-mono-900 dark:hover:text-white transition-colors">{lang === 'ku' ? 'سیاسەتا تایبەتمەندیێ' : 'Privacy Policy'}</button>
                        <span className="w-1 h-1 rounded-md bg-white/10"></span>
                        <button className="text-blue-600 dark:text-blue-400 font-bold pointer-events-none">{lang === 'ku' ? 'مەرجێن خزمەتگوزاریێ' : 'Terms of Service'}</button>
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

export default TermsOfService;


