import React, { useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import Avatar from './Avatar';
import { playSwordComboSfx, playWhooshSfx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { toKuDigits } from '../utils/formatters';
import { NAME_FONTS } from '../constants/nameFonts';
import { NAME_STYLES } from '../constants/nameStyles';
import { BUNDLES } from '../constants/bundles';

export default function RoundIntro({ opponent, userAvatar, userNickname, userEquippedFont, userEquippedNameStyle, userEquippedBundle, userLevel, currentRound, roundMessage, previousWord }) {
  // Localization helper
  const getRoundOrdinal = (idx) => {
    const ordinals = ['ئێکێ', 'دوویێ', 'سێیێ'];
    if (idx < 3) return ordinals[idx];
    return toKuDigits(idx + 1);
  };

  // Trigger sounds on start and exit
  useEffect(() => {
    if (roundMessage) {
      playWhooshSfx();
      const sfxTimeout = setTimeout(() => {
        playSwordComboSfx();
        triggerHaptic([100, 100, 100]);
      }, 500);
      
      return () => {
        clearTimeout(sfxTimeout);
        // Play sounds on exit (when roundMessage becomes false)
        playWhooshSfx();
        setTimeout(() => {
          playSwordComboSfx();
        }, 300);
      };
    }
  }, [roundMessage]);

  return (
    <AnimatePresence>
      {roundMessage && (
        <Motion.div
          key="diagonal-arcade-intro"
          className="fixed inset-0 z-2000 overflow-hidden pointer-events-none"
        >
          {/* TOP HALF (RED) + OPPONENT */}
          <Motion.div
            initial={{ y: "-100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-0 left-0 w-full h-1/2 bg-red-600 z-10 flex flex-col items-center justify-center pointer-events-auto"
          >
            {/* OPPONENT INFO */}
            <Motion.div
              initial={{ y: -50, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="relative w-40 h-49 flex justify-center">
                {/* SVG Pin Pointing DOWN */}
                <svg viewBox="-5 -5 110 135" preserveAspectRatio="none" className="absolute inset-0 w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
                  <path 
                    d="M 50 120 L 15.6 78.9 A 45 45 0 1 1 84.4 78.9 Z" 
                    fill="#ef4444" 
                    stroke="#fca5a5" 
                    strokeWidth="3" 
                    strokeLinejoin="round" 
                  />
                </svg>
                
                <div 
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
                  style={{ top: '40.74%' }}
                >
                  <div className="relative p-1 rounded-full bg-linear-to-br from-red-500 to-red-700 shadow-xl">
                    <Avatar 
                      src={opponent?.avatar_url} 
                      size="xl" 
                      className="border-4 border-white/20 rounded-full" 
                      border={false} 
                      level={opponent?.level} 
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-red-700 text-white font-black px-5 py-1 rounded-full text-[13px] shadow-xl z-30 border border-white/30 whitespace-nowrap">
                    ھەڤڕک
                  </div>
                </div>
              </div>
              {(() => {
                const oppFont = NAME_FONTS[opponent?.equipped_font] || NAME_FONTS['default-ku'];
                const oppStyle = NAME_STYLES[opponent?.equipped_name_style] || {};
                const oppBundle = BUNDLES[opponent?.equipped_bundle] || BUNDLES['default'];
                
                const name = opponent?.nickname || 'ھەڤڕک';
                const nameLen = Math.max(name.length, 1);
                const wideFonts = ['press-start-2p', 'bangers', 'blunt-wide', 'digiface', 'digital', 'lcd', 'runiga', 'god-of-war', 'fungky-brow', 'ncl-halloween-danger', 'awesome-christmas'];
                const isWideFont = wideFonts.includes(opponent?.equipped_font);
                
                const baselineLen = isWideFont ? 4 : 7.5;
                const scaleFactor = Math.min(1.15, Math.max(0.25, baselineLen / nameLen));
                const baseSize = oppFont.style?.fontSize ? parseFloat(oppFont.style.fontSize) : 1.4;
                const dynamicFontSize = `${baseSize * scaleFactor}em`;

                return (
                  <div className="mt-2 px-6 py-1.5 rounded-2xl border border-white/20 shadow-xl max-w-[90%] flex justify-center bg-black bg-opacity-90 backdrop-blur-md">
                    <span 
                      dir="auto"
                      className={`font-black text-xl sm:text-2xl tracking-normal drop-shadow-md whitespace-nowrap block max-w-full overflow-hidden text-clip px-2 text-center mx-auto ${oppBundle.id !== 'default' ? (oppBundle.fontKurdish + ' ' + oppBundle.textStyle) : (oppStyle.class || 'text-white')}`}
                      style={{
                        ...(oppBundle.id !== 'default' ? {} : oppFont.style),
                        fontSize: dynamicFontSize
                      }}
                    >
                      {name}
                    </span>
                  </div>
                );
              })()}
            </Motion.div>
          </Motion.div>

          {/* BOTTOM HALF (BLUE) + YOU */}
          <Motion.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bottom-0 left-0 w-full h-1/2 bg-blue-600 z-10 flex flex-col items-center justify-center pointer-events-auto"
          >
            {/* YOU INFO */}
            <Motion.div
              initial={{ y: 50, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="relative w-40 h-49 flex justify-center">
                {/* SVG Pin Pointing UP */}
                <svg viewBox="-5 -5 110 135" preserveAspectRatio="none" className="absolute inset-0 w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
                  <path 
                    d="M 50 5 L 84.4 46.1 A 45 45 0 1 1 15.6 46.1 Z" 
                    fill="#3b82f6" 
                    stroke="#93c5fd" 
                    strokeWidth="3" 
                    strokeLinejoin="round" 
                  />
                </svg>
                
                <div 
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
                  style={{ top: '59.26%' }}
                >
                  <div className="relative p-1 rounded-full bg-linear-to-br from-blue-500 to-blue-700 shadow-xl">
                    <Avatar 
                      src={userAvatar} 
                      size="xl" 
                      className="border-4 border-white/20 rounded-full" 
                      border={false} 
                      level={userLevel} 
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-blue-700 text-white font-black px-5 py-1 rounded-full text-[13px] shadow-xl z-30 border border-white/30 whitespace-nowrap">
                    تۆ
                  </div>
                </div>
              </div>
              {(() => {
                const myFont = NAME_FONTS[userEquippedFont] || NAME_FONTS['default-ku'];
                const myStyle = NAME_STYLES[userEquippedNameStyle] || {};
                const myBundle = BUNDLES[userEquippedBundle] || BUNDLES['default'];
                
                const name = userNickname || 'یاریزان';
                const nameLen = Math.max(name.length, 1);
                const wideFonts = ['press-start-2p', 'bangers', 'blunt-wide', 'digiface', 'digital', 'lcd', 'runiga', 'god-of-war', 'fungky-brow', 'ncl-halloween-danger', 'awesome-christmas'];
                const isWideFont = wideFonts.includes(userEquippedFont);
                
                const baselineLen = isWideFont ? 4 : 7.5;
                const scaleFactor = Math.min(1.15, Math.max(0.25, baselineLen / nameLen));
                const baseSize = myFont.style?.fontSize ? parseFloat(myFont.style.fontSize) : 1.4;
                const dynamicFontSize = `${baseSize * scaleFactor}em`;

                return (
                  <div className="mt-2 px-6 py-1.5 rounded-2xl border border-white/20 shadow-xl max-w-[90%] flex justify-center bg-black bg-opacity-90 backdrop-blur-md">
                    <span 
                      dir="auto"
                      className={`font-black text-xl sm:text-2xl tracking-normal drop-shadow-md whitespace-nowrap block max-w-full overflow-hidden text-clip px-2 text-center mx-auto ${myBundle.id !== 'default' ? (myBundle.fontKurdish + ' ' + myBundle.textStyle) : (myStyle.class || 'text-white')}`}
                      style={{
                        ...(myBundle.id !== 'default' ? {} : myFont.style),
                        fontSize: dynamicFontSize
                      }}
                    >
                      {name}
                    </span>
                  </div>
                );
              })()}
            </Motion.div>
          </Motion.div>

          {/* ARCADE GRID OVERLAY (Optional) */}
          <Motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-20"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                transform: 'skewY(-5deg) scale(1.5)'
              }}
            />
          </Motion.div>

          {/* VS CENTER (CLEAN FULL-WIDTH CARD) */}
          <Motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.4 }}
            className="absolute top-1/2 left-0 w-full -translate-y-1/2 z-50 flex flex-col items-center justify-center pointer-events-auto shadow-2xl bg-mono-100 dark:bg-[#1a1f2e] border-y-[3px] border-mono-200 dark:border-mono-800"
          >
            <div className="w-full px-6 py-8 flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl sm:text-3xl font-black text-mono-900 dark:text-white font-rabar uppercase text-center flex flex-wrap justify-center items-center gap-2">
                {roundMessage === 'ROUND_DRAW' ? (
                  <>یەکسانبوون! <span className="text-amber-500">گەڕا نوی</span></>
                ) : (
                  <>گەڕا {getRoundOrdinal(currentRound)} <span className="text-amber-500">دەستپێکر</span></>
                )}
              </h2>
              
              {/* Previous Round Answer */}
              {previousWord && (
                <Motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                  className="mt-4 flex flex-col items-center justify-center border-t border-mono-200 dark:border-mono-800 pt-4 w-full max-w-sm"
                >
                  <span className="text-sm sm:text-base font-rabar text-mono-500 dark:text-mono-400 mb-1 text-center font-bold">بەرسڤا گەڕا پێشتر:</span>
                  <span className="text-3xl sm:text-4xl font-black font-rabar text-green-500 text-center">
                    {previousWord}
                  </span>
                </Motion.div>
              )}
            </div>
          </Motion.div>

        </Motion.div>
      )}
    </AnimatePresence>
  );
}
