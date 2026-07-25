import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useMultiplayer } from '../context/MultiplayerContext';
import { useAudio } from '../context/AudioContext';
import { triggerHaptic } from '../utils/haptics';

const EMOJIS = ['😂', '😡', '👏', '🤯', '💔', '🧠'];

export default function MultiplayerReactions() {
  const { broadcastReaction } = useMultiplayer();
  const { playPopSound } = useAudio();

  const handleSendReaction = (emoji) => {
    triggerHaptic(15);
    try { playPopSound(); } catch (_e) { /* ignore */ }
    broadcastReaction(emoji);
  };

  return (
    <>
      {/* 
        SENDING UI: Vertical Emoji List on the right side
      */}
      <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 flex flex-col bg-white/70 dark:bg-black/60 backdrop-blur-xl py-1 px-0 rounded-md border border-slate-200/50 dark:border-white/10 pointer-events-auto z-8002 shadow-xl transition-all duration-300">
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
    </>
  );
}
