import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { triggerHaptic } from '../utils/haptics';
import Avatar from './Avatar';

export default function BlockedUsersModal({ isOpen, onClose, user, handleToggleBlock }) {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      setLoading(true);
      try {
        const { data: blocks, error } = await supabase
          .from('blocks')
          .select('blocked_id')
          .eq('blocker_id', user.id);

        if (error) throw error;

        if (blocks && blocks.length > 0) {
          const ids = blocks.map(b => b.blocked_id);
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, nickname, avatar_url')
            .in('id', ids);

          if (profilesError) throw profilesError;
          setBlockedUsers(profiles || []);
        } else {
          setBlockedUsers([]);
        }
      } catch (err) {
        console.error("Error fetching blocked users:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && user?.id) {
      fetchBlockedUsers();
    }
  }, [isOpen, user?.id]);

  const handleUnblock = async (targetId) => {
    triggerHaptic(10);
    // currentStatus = true means they are currently blocked, so this will unblock them
    const success = await handleToggleBlock(targetId, true);
    if (success) {
      setBlockedUsers(prev => prev.filter(u => u.id !== targetId));
    } else {
      alert("شاشیەک ڕوویدا د ڕاکردنا بلۆکیدا");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <Motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-1100 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        onClick={onClose}
      >
        <Motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-[340px] max-h-[80vh] flex flex-col bg-mono-white dark:bg-mono-900 rounded-md p-6 border border-mono-200 dark:border-mono-800 shadow-2xl noise-grain font-rabar gap-5"
          onClick={e => e.stopPropagation()}
          dir="rtl"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-mono-900 dark:text-white">لیستا بلۆککریان</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-md bg-mono-100 dark:bg-mono-800 text-mono-500 hover:text-mono-900 dark:hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1 space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : blockedUsers.length === 0 ? (
              <div className="text-center py-8 text-mono-400 font-bold text-sm">
                کەس نەهاتیە بلۆک کرن
              </div>
            ) : (
              blockedUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-2 rounded-md bg-mono-50 dark:bg-white/5 border border-mono-200 dark:border-white/10">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Avatar src={u.avatar_url} size="sm" />
                    <span className="font-bold text-[13px] text-mono-900 dark:text-white truncate max-w-[120px]">{u.nickname}</span>
                  </div>
                  <button
                    onClick={() => handleUnblock(u.id)}
                    className="px-3 py-1.5 bg-mono-200 dark:bg-mono-800 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 rounded-md text-[11px] font-black transition-colors shrink-0"
                  >
                    لادانا بلۆکێ
                  </button>
                </div>
              ))
            )}
          </div>
        </Motion.div>
      </Motion.div>
    </AnimatePresence>,
    document.body
  );
}
