import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toKuDigits } from '../utils/formatters';

const gameModes = [
  { id: 'classic', title: 'کلاسیک' },
  { id: 'multiplayer', title: 'هەڤڕکی' },
  { id: 'riddle', title: 'مامک' },
  { id: 'fever', title: 'تایا پەیڤان' },
  { id: 'hard', title: 'دژوار' },
  { id: 'secret', title: 'پەیڤا نهێنی' }
];

export default function HowToPlayModal({ isOpen, onClose, initialMode = 'classic', isDark = true, showTabs = true }) {
  const [activeTab, setActiveTab] = useState(initialMode);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const renderClassicTutorial = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        
        <div className="space-y-4">
          <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>ئامانجا یاریێ:</p>
          <ul className="space-y-3">
            <li className="flex gap-2 text-sm leading-relaxed">
              <span className={isDark ? 'text-white/40' : 'text-slate-400'}>•</span>
              <span className={isDark ? 'text-white/70' : 'text-slate-700'}>ئامانجا یاریێ ئەوە تو پەیڤا ڤەشارتی د {toKuDigits(6)} بزاڤاندا ببینی.</span>
            </li>
            <li className="flex gap-2 text-sm leading-relaxed">
              <span className={isDark ? 'text-white/40' : 'text-slate-400'}>•</span>
              <span className={isDark ? 'text-white/70' : 'text-slate-700'}>مۆدێ پەیڤچن (کلاسیک) ژ وان پەیڤان پێکدهێن ئەوێن کو ژ {toKuDigits(2)} تا {toKuDigits(5)} پیتان پێکدهێن.</span>
            </li>
            <li className="flex gap-2 text-sm leading-relaxed">
              <span className={isDark ? 'text-white/40' : 'text-slate-400'}>•</span>
              <span className={isDark ? 'text-white/70' : 'text-slate-700'}>هەر بزاڤەک دێ پەیڤەکا {toKuDigits(2)} یان {toKuDigits(3)} یان {toKuDigits(4)} یان {toKuDigits(5)} پیتی بیت.</span>
            </li>
          </ul>
        </div>

        <p className={`text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
          پشتی هەر بزاڤەکێ، ڕەنگێن خانەیان دێ هێنە گوهۆڕین، داکو نیشان بدەت کا پەیڤا تە چەند نیزیکە ژ پەیڤا ڕاست.
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Correct Position */}
        <div className="space-y-3">
          <div className="flex gap-2">
            {['پ', 'ە', 'ی', 'ڤ', 'ا'].map((letter, i) => (
              <div 
                key={i} 
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-black text-lg border-2 
                  ${i === 0 ? 'bg-[#10b981] border-[#10b981] text-white' : (isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-800')}`}
              >
                {letter}
              </div>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
             پیتا <span className="text-[#10b981] font-bold">پ</span> د ناڤ پەیڤێدا هەیە و د جهێ خوە یێ ڕاست دایە.
          </p>
        </div>

        {/* Step 2: Wrong Position */}
        <div className="space-y-3">
          <div className="flex gap-2">
            {['و', 'ێ', 'ن', 'ە', 'ی'].map((letter, i) => (
              <div 
                key={i} 
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-black text-lg border-2 
                  ${i === 2 ? 'bg-[#facc15] border-[#facc15] text-white' : (isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-800')}`}
              >
                {letter}
              </div>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
             پیتا <span className="text-[#facc15] font-bold">ن</span> د ناڤ پەیڤێدا هەیە، بەلێ پا د جهەکێ دی داتە.
          </p>
        </div>

        {/* Step 3: Not in Word */}
        <div className="space-y-3">
          <div className="flex gap-2">
            {['س', 'ت', 'ێ', 'ر', 'ا'].map((letter, i) => (
              <div 
                key={i} 
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-black text-lg border-2 
                  ${i === 1 ? (isDark ? 'bg-white/20 border-white/20 text-white' : 'bg-slate-400 border-slate-400 text-white') : (isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-800')}`}
              >
                {letter}
              </div>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
             پیتا <span className={`${isDark ? 'text-white/40' : 'text-slate-600'} font-bold`}>ت</span> د ناڤ پەیڤێدا نینە.
          </p>
        </div>
      </div>

      <div className="pt-4 space-y-4">
        <p className={`text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
          پێدڤییە یاریزان وان ئاماژەیان بکاربهینن بۆ ڕاستڤەکرن و باشترکرنا بزاڤێن خوە تاکو پەیڤا ڤەشارتی ئاشکرا دکەن. ئامانجا سەرەکی ئەوە کو د ناڤ شەش بزاڤاندا پەیڤ بهێتە دیتن.
        </p>
        <p className={`text-sm font-black text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
          دەمەکێ خوەش دەرباز بکە و هەڤڕکییا خوە بکە بۆ دیتنا پەیڤێ ب زووترین دەم!
        </p>
      </div>
    </div>
  );

  const renderGenericTemplate = (modeId) => {
    const mode = gameModes.find(m => m.id === modeId);
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary-dark'}`}>
            <span className="material-symbols-outlined text-3xl">
              {modeId === 'multiplayer' ? 'swords' : 
               modeId === 'riddle' ? 'quiz' : 
               modeId === 'fever' ? 'bolt' : 
               modeId === 'hard' ? 'priority_high' : 'lock'}
            </span>
          </div>
          <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{mode?.title}</h3>
        </div>

        <p className={`text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
          یاسایێن ڤی مۆدێ یاریێ ل ڤێرە دێ هێنە نڤێسین. ڤی مۆدێ تایبەت یاریێ یێ جودایە و پێدڤی ب زیرەکیەکا جودا هەیە.
        </p>

        <div className={`p-5 rounded-3xl space-y-4 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
          <h4 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-500'}`}>یاسایێن سەرەکی</h4>
          <ul className="space-y-3">
            {[1, 2, 3].map(i => (
              <li key={i} className="flex gap-3">
                <span className="text-primary font-black">{toKuDigits(i)}.</span>
                <p className={`text-sm ${isDark ? 'text-white/70' : 'text-slate-600'}`}>خالا فێربوونێ یا {toKuDigits(i)} ل ڤێرە دێ هێتە دیارکرن بۆ یاریزانی.</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={`relative w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col rounded-[40px] border shadow-2xl ${isDark ? 'bg-[#0a0f1b] border-white/10' : 'bg-white border-slate-200'}`}
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-4 flex justify-center items-center">
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>دێ چاوا یاریێ کەی؟</h2>
          </div>

          {/* Scrollable Tabs - Conditional */}
          {showTabs && (
            <div className="px-6 border-b border-white/5">
              <div className="flex overflow-x-auto no-scrollbar gap-2 py-2 px-2 scroll-smooth">
                {gameModes.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setActiveTab(mode.id)}
                    className={`shrink-0 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all
                      ${activeTab === mode.id 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : (isDark ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-slate-50 text-slate-500 hover:bg-slate-100')}`}
                  >
                    {mode.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-8">
            {activeTab === 'classic' ? renderClassicTutorial() : renderGenericTemplate(activeTab)}
          </div>

          {/* Footer Action */}
          <div className={`p-8 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
            <button 
              onClick={onClose}
              className="w-full h-16 bg-primary text-white rounded-3xl font-black text-lg shadow-xl shadow-primary/20 active:scale-[0.98] transition-all hover:brightness-110"
            >
              تێگەهشتم
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
