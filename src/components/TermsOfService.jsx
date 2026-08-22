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
                    text: "تو بەرپرسیاری ژ پاراستنا نھێنیا پێزانینێن چوونە ژوور (فەیسبۆک/گۆگل/دیسکۆرد/ئەپڵ).",
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
        <div className="fixed inset-0 z-120 flex items-center justify-center p-4 sm:p-6 transition-colors duration-500 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Backdrop */}
            <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
                className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            />

            {/* Modal Content */}
            <Motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-2xl h-[90vh] flex flex-col bg-[#636a7c] rounded-[18px] shadow-[inset_0_-8px_0_rgba(0,0,0,0.4),0_15px_35px_rgba(0,0,0,0.6)] relative font-rabar border-4 border-[#121316] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Inner 3D Highlight Layer (Tapered Top) */}
                <div 
                    className="absolute inset-0 rounded-[14px] border-2 border-t-white/80 border-x-transparent border-b-transparent pointer-events-none z-0"
                    style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 1%, black 15%, black 85%, transparent 99%)' }}
                ></div>
                
                {/* Inner 3D Shadow Layer (Bottom & Sides) */}
                <div className="absolute inset-0 rounded-[14px] border-2 border-b-black/40 border-x-black/20 border-t-transparent pointer-events-none z-0"></div>

                {/* Glassy Header Highlight */}
                <div className="absolute top-1.5 inset-x-1.5 h-7 bg-[#727888] pointer-events-none z-0 rounded-t-[8px]"></div>

                {/* Header */}
                <div className="w-full relative z-10 flex flex-col items-center justify-center pt-5 pb-3 shrink-0 gap-3">
                    <h2 
                        className="text-[26px] font-black text-white leading-none relative z-10 -translate-y-1 flex items-center gap-2" 
                        style={{ 
                            textShadow: `
                                -2px -2px 0 #1a1c23, 2px -2px 0 #1a1c23,
                                -2px  2px 0 #1a1c23, 2px  2px 0 #1a1c23,
                                -2px  0px 0 #1a1c23, 2px  0px 0 #1a1c23,
                                0px  2px 0 #1a1c23, 0px -2px 0 #1a1c23,
                                0px 5px 0px #1a1c23, 0px 5px 10px rgba(0,0,0,0.4)
                            `
                        }}
                    >
                        {current.title}
                    </h2>
                    
                    {/* Language Toggle - Clash Royale Tabs Style */}
                    <div dir="ltr" className="flex items-center justify-center gap-3 w-64 max-w-full px-4 mb-1">
                        <button
                            onClick={() => handleLanguageChange('en')}
                            className={`h-8 flex-1 font-black uppercase tracking-wider font-rabar text-[12px] transition-transform duration-100 flex items-center justify-center outline-none btn-clash-sm ${
                                lang === 'en'
                                ? 'btn-clash-sm-blue text-white z-20'
                                : 'btn-clash-sm-slate text-white/80 opacity-80 hover:opacity-100 z-10 scale-95'
                            }`}
                        >
                            <span className={`relative z-20 ${lang === 'en' ? 'drop-shadow-md' : ''}`}>English</span>
                        </button>
                        <button
                            onClick={() => handleLanguageChange('ku')}
                            className={`h-8 flex-1 font-black uppercase tracking-wider font-rabar text-[12px] transition-transform duration-100 flex items-center justify-center outline-none btn-clash-sm ${
                                lang === 'ku'
                                ? 'btn-clash-sm-blue text-white z-20'
                                : 'btn-clash-sm-slate text-white/80 opacity-80 hover:opacity-100 z-10 scale-95'
                            }`}
                        >
                            <span className={`relative z-20 ${lang === 'ku' ? 'drop-shadow-md' : ''}`}>کوردی</span>
                        </button>
                    </div>

                    <button
                        onClick={handleClose}
                        className="absolute right-3 top-3.5 w-8 h-8 rounded-[8px] bg-linear-to-b from-[#ff6b6b] to-[#d62020] hover:from-[#ff7a7a] hover:to-[#e62b2b] flex items-center justify-center text-white transition-all active:scale-95 shadow-[inset_0_2px_0_rgba(255,255,255,0.5),inset_0_-4px_0_#960f0f] border-[1.5px] border-[#181a20] z-20 overflow-hidden"
                    >
                        <div className="absolute top-0.5 inset-x-0.5 bottom-1 bg-white/20 pointer-events-none rounded-md"></div>
                        <svg viewBox="0 0 24 24" className="w-4 h-4 -translate-y-px relative z-10" style={{ filter: 'drop-shadow(0px 2px 0px rgba(0,0,0,0.3))' }}>
                            <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" stroke="#121316" strokeWidth="9" strokeLinecap="round" />
                            <line x1="18.5" y1="5.5" x2="5.5" y2="18.5" stroke="#121316" strokeWidth="9" strokeLinecap="round" />
                            <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" stroke="white" strokeWidth="5" strokeLinecap="round" />
                            <line x1="18.5" y1="5.5" x2="5.5" y2="18.5" stroke="white" strokeWidth="5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 self-stretch overflow-hidden flex flex-col mx-3 sm:mx-4 mb-4 relative z-0">
                    <div className="flex flex-col relative rounded-[10px] bg-[#e6ebf0] shadow-[0_4px_6px_rgba(0,0,0,0.2)] overflow-hidden h-full z-10">
                        {/* Inner White Box 3D Highlight */}
                        <div className="absolute inset-0 rounded-[10px] border-[2.5px] border-t-white/90 border-l-white/80 border-r-black/5 border-b-black/10 pointer-events-none z-20"></div>
                        
                        <div className="relative z-10 w-full h-full overflow-y-auto custom-scrollbar p-5 sm:p-6">
                            <p className={`text-[13px] text-[#4a5568] mb-6 leading-relaxed font-bold border-[#181a20] ${isRTL ? 'border-r-4 pr-4' : 'border-l-4 pl-4'}`}>
                                {current.intro}
                            </p>

                            <div className="space-y-6">
                                {current.sections.map((section, idx) => (
                                    <section key={idx} className="relative">
                                        <h3 className="text-[15px] font-black font-rabar text-[#181a20] mb-3 flex items-center gap-3">
                                            {section.title}
                                        </h3>
                                        <p className="text-[13px] font-bold text-[#4a5568] leading-relaxed mb-3">{section.text}</p>
                                        {section.list && (
                                            <ul className={`space-y-3 ${isRTL ? 'pr-6' : 'pl-6'}`}>
                                                {section.list.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-[12px] font-bold text-[#4a5568]">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#1e86ff] mt-1.5 shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.3)]"></div>
                                                        <span className="flex-1 leading-relaxed">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {section.email && (
                                            <a href={`mailto:${section.email}`} className="inline-block mt-3 text-[#1e86ff] font-bold text-[13px] hover:text-[#115ab5] transition-colors border-b-[1.5px] border-[#1e86ff]/50 pb-0.5">
                                                {section.email}
                                            </a>
                                        )}
                                    </section>
                                ))}
                            </div>

                            {/* Footer Links */}
                            <div className="mt-10 pt-6 border-t-[1.5px] border-[#a0a7b4]/30 text-center space-y-6">
                                <div className="flex flex-wrap items-center justify-center gap-4 text-[#4a5568] font-bold text-[11px] uppercase">
                                    <button onClick={() => handleNavigate('/data-deletion', 'deletion')} className="hover:text-[#181a20] transition-colors">{isRTL ? 'ژێبرنا داتایان' : 'Data Deletion'}</button>
                                    <span className="w-1 h-1 rounded-full bg-[#a0a7b4]"></span>
                                    <button onClick={() => handleNavigate('/privacy-policy', 'privacy')} className="hover:text-[#181a20] transition-colors">{isRTL ? 'سیاسەتا تایبەتمەندیێ' : 'Privacy Policy'}</button>
                                </div>
                                <p className="text-[10px] text-[#727888] font-bold uppercase opacity-80">
                                    {isRTL ? '© ٢٠٢٦ تیما پەیڤۆک • هاتیە دروستکرن بۆ کەلەپووری' : '© 2026 Peyvok Team • Built for Heritage'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Motion.div>
        </div>
    );
};

export default TermsOfService;


