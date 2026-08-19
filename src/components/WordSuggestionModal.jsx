import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { triggerHaptic } from '../utils/haptics';
import { useUser } from '../context/AuthContext';

const WordSuggestionModal = ({ isOpen, onClose, user }) => {
  const { userNickname } = useUser();
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!word.trim()) {
      setError('هیڤیە پەیڤەکێ بنڤێسە.');
      return;
    }

    if (!definition.trim()) {
      setError('هیڤیە پێناسەیا پەیڤێ بنڤێسە.');
      return;
    }

    try {
      triggerHaptic(10);
      setIsSubmitting(true);
      setError(null);

      // Insert into word_suggestions
      const { error: insertError } = await supabase
        .from('word_suggestions')
        .insert([{
          word: word.trim(),
          definition: definition.trim() || null,
          suggested_by: user?.id || null,
          suggested_by_name: userNickname || 'نەناسراو',
          status: 'pending'
        }]);

      if (insertError) throw insertError;

      triggerHaptic(30);
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (err) {
      console.error('Word suggestion submission error:', err);
      setError('ئاریشەیەک چێبوو د هنارتنێ دا: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setWord('');
    setDefinition('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-4 sm:p-6 pb-safe pt-safe" dir="rtl">
      {/* Backdrop */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={isSubmitting ? undefined : handleClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <Motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-sm bg-white dark:bg-mono-900 border border-mono-200 dark:border-white/10 rounded-[20px] p-5 sm:p-6 shadow-2xl flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black font-rabar text-mono-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500">lightbulb</span>
            پێشنیارکرنا پەیڤێ
          </h2>
          <button 
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-md bg-mono-100 dark:bg-white/10 flex items-center justify-center text-mono-500 hover:text-mono-900 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <div className="w-14 h-14 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">check_circle</span>
            </div>
            <p className="font-bold text-mono-900 dark:text-white text-center">پێشنیارا تە ب سەرکەفتیانە هاتە هنارتن!</p>
            <p className="text-xs text-mono-500 text-center font-medium">سوپاس بۆ هاریکاریا تە بۆ زەنگینکرنا یاریێ.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1.5 mt-2">
              <p className="text-[11px] text-mono-500 dark:text-mono-400 mb-2 font-medium">
                پەیڤا خوە پێشنیار بکە، دا کو ل یاریێ بهێتە زێدەکرن
              </p>
              <label className="text-xs font-bold text-mono-600 dark:text-mono-400">پەیڤا نوی *</label>
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="پەیڤێ بنڤێسە..."
                className="w-full bg-mono-50 dark:bg-black/20 border border-mono-200 dark:border-white/10 rounded-md p-3 text-sm text-mono-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs font-bold text-mono-600 dark:text-mono-400">پێناسەیا پەیڤێ *</label>
              <textarea
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                placeholder="پێناسە یان ڕامانا پەیڤێ بنڤێسە..."
                className="w-full bg-mono-50 dark:bg-black/20 border border-mono-200 dark:border-white/10 rounded-md p-3 text-sm min-h-20 text-mono-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-2.5 rounded-md">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !word.trim() || !definition.trim()}
              className="w-full py-3.5 mt-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md font-black text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_0_#d97706] disabled:opacity-50 disabled:shadow-[0_4px_0_#d97706] active:translate-y-1 active:shadow-none"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  هنارتنا پەیڤێ
                </>
              )}
            </button>
          </>
        )}
      </Motion.div>
    </div>
  );
};

export default React.memo(WordSuggestionModal);
