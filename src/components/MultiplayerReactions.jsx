import React, { useState, useRef, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useMultiplayer } from '../context/MultiplayerContext';
import { useAudio } from '../context/AudioContext';
import { triggerHaptic } from '../utils/haptics';

const EMOJIS = ['😂', '😡', '👏', '🤯', '💔', '🧠'];
const QUICK_CHATS = [
  "چەوا بوو؟ 😜", 
  "تە پەقاند 💣", 
  "عافیەت بیت 🍽️", 
  "بۆخۆ بنڤە 🛌", 
  "دێ بابۆ دێ 🏃‍♂️", 
  "چ لێ هات 🤷‍♂️", 
  "خەوا من هات 😴", 
  "ئەلووو؟ 📞", 
  "ئەڤە چ بوو؟! 🤯", 
  "هـهـهـهـ 😂"
];

export default function MultiplayerReactions() {
  const { broadcastReaction } = useMultiplayer();
  const { playPopSound } = useAudio();
  const [isQuickChatOpen, setIsQuickChatOpen] = useState(false);
  const quickChatRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (quickChatRef.current && !quickChatRef.current.contains(e.target)) {
        setIsQuickChatOpen(false);
      }
    };
    if (isQuickChatOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isQuickChatOpen]);

  const handleSendReaction = (emoji) => {
    triggerHaptic(15);
    try { playPopSound(); } catch (_e) { /* ignore */ }
    broadcastReaction(emoji);
    setIsQuickChatOpen(false);
  };

  return (
    <>
      {/* SENDING UI: Vertical Emoji List on the right side */}
      <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-8002">
        
        {/* Quick Chat Menu & Toggle */}
        <div className="relative flex justify-center w-full" ref={quickChatRef}>
          <button
            onClick={() => {
              triggerHaptic(10);
              setIsQuickChatOpen(!isQuickChatOpen);
            }}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-lg transition-all ${
              isQuickChatOpen 
                ? 'bg-blue-600 text-white' 
                : 'bg-white/80 dark:bg-black/60 text-mono-700 dark:text-mono-200 border border-slate-200/50 dark:border-white/10 backdrop-blur-xl hover:scale-105'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              chat
            </span>
          </button>

          {/* Quick Chat Dropdown */}
          <AnimatePresence>
            {isQuickChatOpen && (
              <Motion.div
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute right-12 sm:right-14 top-1/2 -translate-y-1/2 w-48 max-h-62.5 overflow-y-auto overflow-x-hidden bg-white/90 dark:bg-black/90 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-mono-700 shadow-2xl py-2 scrollbar-hide flex flex-col"
              >
                {QUICK_CHATS.map((chat, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendReaction(chat)}
                    className="w-full text-right px-4 py-2.5 text-sm font-medium text-mono-800 dark:text-mono-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors active:bg-blue-100 dark:active:bg-blue-900/50 whitespace-nowrap"
                  >
                    {chat}
                  </button>
                ))}
              </Motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Existing Emoji List */}
        <div className="flex flex-col bg-white/70 dark:bg-black/60 backdrop-blur-xl py-1 px-0 rounded-md border border-slate-200/50 dark:border-white/10 pointer-events-auto shadow-xl transition-all duration-300">
          {EMOJIS.map((emoji, idx) => (
            <React.Fragment key={emoji}>
              {idx > 0 && <div className="h-px bg-slate-300/50 dark:bg-white/10 w-full" />}
              <button
                onClick={() => handleSendReaction(emoji)}
                className="flex items-center justify-center hover:scale-125 transition-transform active:scale-95 drop-shadow-md my-0.5"
                style={{
                  width: 'clamp(30px, 8vw, 44px)',
                  height: 'clamp(30px, 8vw, 44px)',
                  fontSize: 'clamp(18px, 5vw, 26px)'
                }}
              >
                {emoji}
              </button>
            </React.Fragment>
          ))}
        </div>
        
      </div>
    </>
  );
}

