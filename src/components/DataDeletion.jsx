import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playBackSfx, playTabSfx } from '../utils/audio';



const DataDeletion = ({ onViewChange, onClose }) => {
    const [isKurdish, setIsKurdish] = useState(() => {
        return localStorage.getItem('policy_lang') !== 'en';
    });

    const handleLanguageChange = (isKurd) => {
        setIsKurdish(isKurd);
        localStorage.setItem('policy_lang', isKurd ? 'ku' : 'en');
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
            title: "Data Deletion Instructions",
            lastUpdated: "Last Updated: April 2, 2026",
            intro: "At Peyvok, we respect your privacy and provide a simple way to request the deletion of your personal data associated with our Facebook, Google, or Apple login and game platform.",
            section1Title: "1. How to Request Data Deletion",
            section1Text: "To delete your data from Peyvok, you can follow these steps:",
            steps: [
                "You can delete your account directly from within the game by going to Settings and tapping 'Delete Account'.",
                "Open your Facebook, Google, or Apple profile and go to 'Settings & Privacy' > 'Settings'.",
                "Look for 'Apps and Websites' and find 'Peyvok'.",
                "Click the 'Remove' button.",
                "Alternatively, you can send an email to support@peyvokgame.com with the subject 'Data Deletion Request' and include your User ID or the email associated with your account."
            ],
            section2Title: "2. What Data is Deleted?",
            section2Text: "Once a deletion request is processed, the following information will be permanently removed from our servers:",
            deletedItems: [
                "Your profile information (Nickname, Avatar URL)",
                "Game statistics (Level, XP, Coins, Stars)",
                "Daily streak and solved words history",
                "Any social connections or leaderboard rankings"
            ],
            section3Title: "3. Processing Time",
            section3Text: "Manual email requests are typically processed within 3-5 business days. Once deleted, this information cannot be recovered.",
            backButton: "Back to Game",
        },
        ku: {
            title: "ڕێنمایێن ژێبرنا داتایان",
            lastUpdated: "دووماھیک نووژەنکرن: ٢ نیسان، ٢٠٢٦",
            intro: "ل پەیڤۆک، ئەم ڕێزێ ل تایبەتمەندیا تە دگرین و ڕێکەکا ب ساناھی دابین دکەین بۆ داخوازکرنا ژێبرنا داتایێن تە یێن کەسی یێن کو ب پەیڤۆک و فەیسبۆک، گۆگل، یان ئەپڵی ڤە گرێداینە.",
            section1Title: "١. چەوا داخوازی ژێبرنا داتایان بکەی",
            section1Text: "بۆ ژێبرنا داتایێن خوە ژ پەیڤۆک، تو دشێی ڤان پێنگاڤان پەیڕەو بکەی:",
            steps: [
                "تو دشێی هژمارا خوە ڕاستەوخۆ ژ ناڤ یاریێ ل بەشێ ڕێکخستن (Settings) ژێببەی ب داگرتنا دوگمەیا ژێبرنا هژمارێ.",
                "پڕۆفایلی خوە یێ فەیسبووکی، گۆگلی یان ئەپڵی ڤەکە و هەرە 'Settings & Privacy' پاشان 'Settings'.",
                "ل 'Apps and Websites' بگەڕێ و 'پەیڤۆک' ببینە.",
                "کلیکێ ل سەر دوگمەیا 'Remove' بکە.",
                "یان ژی، تو دشێی ئیمەیلەکی بۆ support@peyvokgame.com بهنێری ب ناڤونیشانێ Data Deletion Request و ناسنامەیا خوە (User ID) یان ئیمەیلا خوە تێدا بنڤێسی."
            ],
            section2Title: "٢. کیژان زانیاری دێ هێنە ژێبرن؟",
            section2Text: "پشتی کو داخوازا ژێبرنێ دھێتە جێبەجێکرن، ئەڤ زانیاریێن خوارێ دێ ب ئێکجاری ژ سێرڤەرێن مە ھێنە ڕەشکرن:",
            deletedItems: [
                "زانیاریێن پرۆفایلێ تە (ناڤ، وێنە)",
                "ئامارێن یاریێ (ئاست، XP، پارە، ئامار، دەستکەفت)",
                "زانیاریێن ڕۆژانە و پەیڤێن تە یێن خەلاتکرین",
                "ھەر گرێدانەکا جڤاکی یان ڕیزبەندییا سەرکەفتیان"
            ],
            section3Title: "٣. دەمێ جێبەجێکرنێ",
            section3Text: "داخوازێن ب ڕێکا ئیمەیلێ ب گشتی د ناڤبەرا ٣-٥ ڕۆژێن کار دا دھێنە جێبەجێکرن. پشتی ژێبرنێ، ئەڤ زانیارییە ناھێنە ڤەگەڕاندن.",
            backButton: "ڤەگەڕە",
        }
    };

    const t = isKurdish ? content.ku : content.en;

    return (
        <div className={`min-h-screen bg-mono-white dark:bg-black text-mono-900 dark:text-mono-50 ${isKurdish ? 'font-rabar' : 'font-body'} selection:bg-mono-900/30 dark:selection:bg-mono-50/30 p-4 sm:p-8 md:p-12 relative`} dir={isKurdish ? 'rtl' : 'ltr'}>
            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="flex flex-col items-center justify-center mb-16 gap-8">
                    <div className="flex flex-col items-center justify-center group cursor-pointer" onClick={handleClose}>
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-mono-900 dark:text-white mb-1">{isKurdish ? 'پەیڤۆک' : 'Peyvok'}</h1>
                            <p className="text-text-dim/60 text-xs font-bold uppercase tracking">{isKurdish ? 'ژێبرنا داتایان' : 'DATA DELETION'}</p>
                        </div>
                    </div>

                    <div dir="ltr" className="flex bg-mono-100 dark:bg-black/40 p-1.5 rounded-md border border-mono-200 dark:border-white/5 backdrop-blur-md relative">
                        <div
                            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-mono-900 dark:bg-mono-50 rounded shadow-sm border border-mono-200 dark:border-white/10 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${!isKurdish ? 'left-1.5' : 'left-[50%]'}`}
                        />
                        <button
                            onClick={() => handleLanguageChange(false)}
                            className={`flex-1 relative z-10 px-6 py-2.5 rounded-md text-xs font-bold transition-colors duration-300 flex items-center justify-center gap-2 ${!isKurdish ? 'text-mono-50 dark:text-mono-900' : 'text-mono-500 dark:text-mono-400 hover:text-mono-900 dark:hover:text-mono-50'}`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => handleLanguageChange(true)}
                            className={`flex-1 relative z-10 px-6 py-2.5 rounded-md text-xs font-bold transition-colors duration-300 flex items-center justify-center gap-2 ${isKurdish ? 'text-mono-50 dark:text-mono-900' : 'text-mono-500 dark:text-mono-400 hover:text-mono-900 dark:hover:text-mono-50'}`}
                        >
                            <span>کوردی</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-mono-50 dark:bg-mono-900/50 backdrop-blur-2xl border border-mono-200 dark:border-white/5 rounded-md p-6 sm:p-10 relative overflow-hidden group text-start">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-mono-500/50 to-transparent opacity-30" />

                    <div className="space-y-8">
                        <p className="text-sm text-mono-800 dark:text-white/90 leading-relaxed font-normal transition-all duration-700">
                            {t.intro}
                        </p>

                        <section className="space-y-4 animate-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-medium text-mono-900 dark:text-white/90">{t.section1Title}</h3>
                            </div>
                            <div className="bg-white/5 border border-mono-200 dark:border-white/5 p-4 sm:p-6 rounded space-y-4">
                                <p className="text-sm text-mono-800 dark:text-white/90 leading-relaxed font-normal">{t.section1Text}</p>
                                <ul className="space-y-4">
                                    {t.steps.map((step, i) => (
                                        <li key={i} className="flex items-start gap-3 text-xs text-mono-800 dark:text-white/90 font-normal leading-relaxed">
                                            <span className="material-symbols-outlined text-mono-900 dark:text-mono-50 text-xl mt-1">check_circle</span>
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        <section className="space-y-4 animate-in slide-in-from-bottom-4 delay-100 duration-700">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-medium text-mono-900 dark:text-white/90">{t.section2Title}</h3>
                            </div>
                            <div className="bg-white/5 border border-mono-200 dark:border-white/5 p-4 sm:p-6 rounded space-y-4">
                                <p className="text-sm text-mono-800 dark:text-white/90 leading-relaxed font-normal">{t.section2Text}</p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {t.deletedItems.map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 bg-mono-50 dark:bg-black/20 p-4 rounded-md border border-mono-200 dark:border-white/5">
                                            <span className="material-symbols-outlined text-secondary text-xl">delete</span>
                                            <span className="text-xs font-normal text-mono-800 dark:text-white/90">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        <section className="space-y-4 animate-in slide-in-from-bottom-4 delay-200 duration-700">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-medium text-mono-900 dark:text-white/90">{t.section3Title}</h3>
                            </div>
                            <div className="bg-mono-50 dark:bg-mono-900 border border-mono-100 dark:border-mono-800 p-4 sm:p-6 rounded">
                                <p className="text-sm text-mono-800 dark:text-white/90 leading-relaxed font-normal">
                                    {t.section3Text}
                                </p>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-16 text-center space-y-8">
                    <div className="flex flex-wrap items-center justify-center gap-6 text-mono-800 dark:text-white/90 font-medium text-[11px] uppercase tracking-wider antialiased">
                        <button className="text-blue-600 dark:text-blue-400 font-bold pointer-events-none">{isKurdish ? 'ژێبرنا داتایان' : 'Data Deletion'}</button>
                        <span className="w-1 h-1 rounded-md bg-white/10"></span>
                        <button onClick={() => handleNavigate('/privacy-policy', 'privacy')} className="text-mono-500 dark:text-white/50 hover:text-mono-900 dark:hover:text-white transition-colors">{isKurdish ? 'سیاسەتا تایبەتمەندیێ' : 'Privacy Policy'}</button>
                        <span className="w-1 h-1 rounded-md bg-white/10"></span>
                        <button onClick={() => handleNavigate('/terms-of-service', 'terms')} className="text-mono-500 dark:text-white/50 hover:text-mono-900 dark:hover:text-white transition-colors">{isKurdish ? 'مەرجێن خزمەتگوزاریێ' : 'Terms of Service'}</button>
                    </div>

                    <button
                        onClick={handleClose}
                        className="bg-mono-900 text-mono-50 dark:bg-mono-50 dark:text-mono-900 px-6 py-3 rounded-md font-bold text-xs uppercase tracking-wide hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto mt-8"
                    >
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                        {t.backButton}
                    </button>

                    <footer className="mt-12 text-center text-mono-500 dark:text-white/50 text-xs font-normal uppercase tracking-wider antialiased opacity-90">
                        {isKurdish ? '© ٢٠٢٦ تیما پەیڤۆک • هاتیە دروستکرن بۆ کەلەپووری' : '© 2026 Peyvok Team • Built for Heritage'}
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default DataDeletion;
