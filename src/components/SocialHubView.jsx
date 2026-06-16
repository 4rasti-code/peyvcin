import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { triggerHaptic } from '../utils/haptics';
import Avatar from './Avatar';
import PublicProfileModal from './PublicProfileModal';
import { useInView } from 'react-intersection-observer';
import { toKuDigits } from '../utils/formatters';

// Custom Long Press Hook for WhatsApp-like gestures
function useLongPress(onLongPress, onClick, ms = 500) {
  const timerRef = useRef();
  const isMovedRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  const start = (e) => {
    isMovedRef.current = false;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startPosRef.current = { x: clientX, y: clientY };

    timerRef.current = setTimeout(() => {
      if (!isMovedRef.current) {
        onLongPress(e);
      }
    }, ms);
  };

  const clear = (e, shouldClick = false) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (shouldClick && !isMovedRef.current) {
      onClick?.(e);
    }
  };

  const move = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dist = Math.sqrt(
      Math.pow(clientX - startPosRef.current.x, 2) + Math.pow(clientY - startPosRef.current.y, 2)
    );
    if (dist > 10) isMovedRef.current = true;
  };

  return {
    onMouseDown: start,
    onMouseUp: (e) => clear(e, true),
    onMouseLeave: (e) => clear(e, false),
    onTouchStart: start,
    onTouchEnd: (e) => clear(e, true),
    onTouchMove: move,
    onMouseMove: move,
    onContextMenu: (e) => {
      e.preventDefault();
      onLongPress(e);
    }
  };
}

function MessageContextMenu({ m, x, y, isMe, onReact, onReply, onCopy, onDelete, onReport, onClose }) {
  return (
    <div 
      className="fixed inset-0 z-100 flex flex-col items-center justify-center p-4"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-transparent"
      />

      <Motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        className="relative z-10 w-full max-w-[220px]"
        style={{
          position: 'fixed',
          top: Math.max(10, Math.min(y - 20, window.innerHeight - 220)),
          ...(isMe 
            ? { right: Math.max(10, window.innerWidth - x - 40) }
            : { left: Math.max(10, x - 40) }
          ),
          transformOrigin: isMe ? 'top right' : 'top left'
        }}
      >
        {/* Reactions Header */}
        <div className="bg-mono-50/95 dark:bg-mono-900/95 backdrop-blur-xl border border-mono-200/50 dark:border-white/10 rounded-md mb-2 p-2 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar shadow-2xl">
          {['❤️', '😂', '👍', '🔥', '😮', '🙏'].map((emoji, idx) => (
            <Motion.button
              key={emoji}
              whileHover={{ scale: 1.3, y: -5 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.05 } }}
              onClick={() => { onReact(emoji); onClose(); }}
              className="w-8 h-8 flex items-center justify-center text-[18px] transition-colors cursor-pointer"
            >
              {emoji}
            </Motion.button>
          ))}
        </div>

        {/* Action List */}
        <div className="bg-mono-50/95 dark:bg-mono-900/95 backdrop-blur-xl border border-mono-200/50 dark:border-white/10 rounded-md p-1.5 flex flex-col gap-1 shadow-2xl">
          <button
            onClick={() => { onReply(m); onClose(); }}
            className="flex items-center justify-between w-full py-2 px-3 hover:bg-mono-100 dark:hover:bg-white/10 active:bg-mono-200 dark:active:bg-white/20 text-mono-900 dark:text-mono-200 transition-all rounded-md"
          >
            <span className="font-bold text-[13px]">بەرسڤدان</span>
            <span className="material-symbols-outlined text-[18px] text-mono-500">reply</span>
          </button>

          <div className="h-px bg-mono-200/50 dark:bg-white/5 mx-2" />

          <button
            onClick={() => { onCopy(m.content || m.text); onClose(); }}
            className="flex items-center justify-between w-full py-2 px-3 hover:bg-mono-100 dark:hover:bg-white/10 active:bg-mono-200 dark:active:bg-white/20 text-mono-900 dark:text-mono-200 transition-all rounded-md"
          >
            <span className="font-bold text-[13px]">ژبەرکرن</span>
            <span className="material-symbols-outlined text-[18px] text-mono-500">content_copy</span>
          </button>

          {isMe && (
            <>
              <div className="h-px bg-mono-200/50 dark:bg-white/5 mx-2" />
              <button
                onClick={() => { onDelete(m); onClose(); }}
                className="flex items-center justify-between w-full py-2 px-3 hover:bg-red-50 dark:hover:bg-red-500/10 active:bg-red-100 dark:active:bg-red-500/20 text-red-500 transition-all rounded-md"
              >
                <span className="font-bold text-[13px]">ژێبرن</span>
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </>
          )}

          {!isMe && onReport && (
            <>
              <div className="h-px bg-mono-200/50 dark:bg-white/5 mx-2" />
              <button
                onClick={() => { onReport(m); onClose(); }}
                className="flex items-center justify-between w-full py-2 px-3 hover:bg-orange-50 dark:hover:bg-orange-500/10 active:bg-orange-100 dark:active:bg-orange-500/20 text-orange-500 transition-all rounded-md"
              >
                <span className="font-bold text-[13px]">ڕاپۆرتکردن</span>
                <span className="material-symbols-outlined text-[18px]">flag</span>
              </button>
            </>
          )}
        </div>
      </Motion.div>
    </div>
  );
}


const GameResultRenderer = ({ text }) => {
  const lines = text.trim().split('\n');
  const title = lines[0]; // e.g., "تەماشەی ئەنجامێن من بکەن!"
  const gridLines = lines.slice(1).filter(l => l.trim().length > 0);

  return (
    <div className="flex flex-col gap-2 my-1 cursor-default" onClick={e => e.stopPropagation()}>
      <div className="text-sm font-black text-center text-primary dark:text-sky-400 mb-1">{title}</div>
      <div className="flex flex-col gap-[3px] items-center">
        {gridLines.map((line, rIdx) => {
          const blocks = line.split(' ').filter(b => b.trim().length > 0);
          return (
            <div key={rIdx} className="flex gap-[3px] justify-center">
              {blocks.map((block, cIdx) => {
                const hasCorrect = block.includes('🟩');
                const hasWrongPos = block.includes('🟨');
                const hasAbsent = block.includes('⬛') || block.includes('⬜');

                const letter = block.replace(/[🟩🟨⬛⬜]/gu, '').trim();
                const isEmpty = letter === '';

                let bgColor = "bg-transparent border-[#E5E5E5] dark:border-[#373737]";
                let textColor = "text-black dark:text-white";

                if (isEmpty) {
                  bgColor = "bg-transparent border-[#E5E5E5] dark:border-[#373737]";
                } else if (hasCorrect) {
                  bgColor = "bg-[#6aaa64] dark:bg-[#538d4e] border-[#6aaa64] dark:border-[#538d4e]";
                  textColor = "text-white";
                } else if (hasWrongPos) {
                  bgColor = "bg-[#c9b458] dark:bg-[#b59f3b] border-[#c9b458] dark:border-[#b59f3b]";
                  textColor = "text-white";
                } else if (hasAbsent) {
                  bgColor = "bg-[#D4D4D4] dark:bg-[#262626] border-[#A3A3A3] dark:border-[#4b4b4b]";
                  textColor = "text-mono-900 dark:text-white";
                }

                return (
                  <div key={cIdx} className={`w-[22px] h-[22px] rounded-[3px] flex items-center justify-center font-bold text-[10px] ${bgColor} ${textColor} border-[1.5px] uppercase leading-none`}>
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

function MessageItem({ m, isMe, onSeen, onLongPress, onReactionLongPress, currentUserId, currentUserNickname, showNickname = false }) {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true
  });

  const isDeleted = m.content === 'ئەڤ نامەیە هاتە ژێبرن' || m.content === '🚫 ئەڤ نامەیە هاتە ژێبرن';

  const msgContent = m.content || m.text || '';
  const isMentioned = !isMe && currentUserNickname && msgContent.includes(`@${currentUserNickname}`);

  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = text.split(/(@\S+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="font-bold text-primary px-0.5 bg-primary/10 rounded">{part}</span>;
      }
      return part;
    });
  };

  useEffect(() => {
    if (inView && !isMe && !m.is_read && onSeen) {
      onSeen(m.id);
    }
  }, [inView, isMe, m.id, m.is_read, onSeen]);

  const bind = useLongPress((e) => {
    if (isDeleted) return;
    triggerHaptic(20);
    const rect = e.target.closest('.message-bubble')?.getBoundingClientRect();
    onLongPress(m, rect?.left + rect?.width / 2, rect?.top);
  });

  return (
    <Motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex flex-col ${isMe ? 'items-start' : 'items-end'} group max-w-full`}
    >
      {showNickname && (
        <div className="flex items-center gap-1.5 mb-1 px-1">
          {m.user_avatar && m.user_avatar !== 'default' ? (
            <Avatar src={m.user_avatar} size="xs" border={false} className="w-[18px]! h-[18px]! text-[10px]! shadow-sm" />
          ) : (
            <div className="w-[18px] h-[18px] rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-[9px] font-black text-primary uppercase shrink-0 shadow-sm border border-primary/20">
              {(m.user_nickname || 'ی')[0]}
            </div>
          )}
          <span className="text-[9px] font-black text-mono-500 uppercase">{m.user_nickname || 'یاریکەر'}</span>
        </div>
      )}

      {/* Quoted Message (Reply) */}
      {m.reply_to_text && !isDeleted && (
        <div className={`mb-1 max-w-[70%] text-[10px] p-2 rounded-xl bg-mono-100/50 dark:bg-white/5 border-r-4 border-primary/40 text-mono-600 dark:text-white/50 italic line-clamp-1 truncate ${isMe ? 'mr-2' : 'ml-2'}`}>
          {m.reply_to_text}
        </div>
      )}

      <div className={`group/msg relative max-w-[85%] flex items-center gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`} onContextMenu={(e) => e.preventDefault()}>
        <div className="relative group/bubble flex flex-col items-end">
          <div
            {...bind}
            onContextMenu={(e) => {
              if (isDeleted) return;
              e.preventDefault();
              onLongPress(m, e.clientX, e.clientY);
            }}
            className={`message-bubble px-3 py-1.5 pt-2 rounded-md text-[13px] font-rabar font-light break-all whitespace-pre-wrap transition-all relative cursor-pointer active:scale-[0.98] select-none shadow-sm ${isMe
                ? 'bg-mono-900 text-white dark:bg-mono-800 dark:text-white rounded-tr-none border border-mono-700/50'
                : 'bg-white text-mono-900 dark:bg-mono-900 dark:text-white rounded-tl-none border border-mono-200 dark:border-mono-800'
              } ${isDeleted ? 'opacity-60 italic' : ''} ${isMentioned ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-mono-900 shadow-md shadow-primary/20' : ''}`}
          >
            {/* Chevron Button inside bubble (WhatsApp Web Style) */}
            {!isDeleted && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLongPress(m, e.clientX, e.clientY);
                }}
                className={`absolute top-0.5 flex opacity-20 hover:opacity-100 transition-opacity w-6 h-6 items-center justify-center rounded-full bg-white/80 dark:bg-black/50 text-mono-500 hover:text-mono-900 dark:text-mono-400 dark:hover:text-white backdrop-blur-sm shadow-sm z-10 ${isMe ? 'left-0.5' : 'right-0.5'}`}
              >
                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
              </button>
            )}

              {isDeleted ? 'ئەڤ نامەیە هاتە ژێبرن' : (
                ((m.content || m.text).includes('ئەنجام') && ((m.content || m.text).includes('🟩') || (m.content || m.text).includes('🟨') || (m.content || m.text).includes('⬛') || (m.content || m.text).includes('⬜')))
                  ? <GameResultRenderer text={m.content || m.text} />
                  : renderFormattedText(m.content || m.text)
              )}

            <div className="flex items-center justify-end gap-1 mt-1">
              <div className={`text-[10px] font-bold opacity-70 ${isMe ? 'text-mono-200' : 'text-mono-500 dark:text-mono-400'}`}>
                {new Date(m.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </div>
              {isMe && !isDeleted && (
                <div className="flex items-center">
                  {m.is_read ? (
                    <span className="material-symbols-outlined text-[14px] text-primary font-bold" style={{ fontSize: '14px' }}>done_all</span>
                  ) : m.id?.startsWith?.('temp-') ? (
                    <span className="material-symbols-outlined text-[14px] text-mono-300 font-bold opacity-40" style={{ fontSize: '14px' }}>done</span>
                  ) : (
                    <span className="material-symbols-outlined text-[14px] text-mono-300 font-bold" style={{ fontSize: '14px' }}>done_all</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Reactions Display - Transparent */}
          {m.reactions && Object.keys(m.reactions).length > 0 && !isDeleted && (
            <div className={`flex flex-wrap gap-2 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`} onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              {Object.entries(m.reactions).map(([emoji, users]) => {
                return (
                  <div
                    key={emoji}
                    className={`group relative flex items-center gap-1 text-[11px] font-black transition-all cursor-help select-none ${users.some(u => (typeof u === 'string' ? u : u.id) === currentUserId) ? 'text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]' : 'text-mono-500/80 hover:text-mono-700 dark:hover:text-mono-300'}`}
                    onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onReactionLongPress?.(m, emoji, e.clientX, e.clientY);
                    }}
                  >
                    <span className="text-[13px] leading-none drop-shadow-sm pointer-events-none">{emoji}</span>
                    <span className="text-[10px] tabular-nums mt-0.5 pointer-events-none">{users.length}</span>
                    
                    {/* Custom Tooltip for Desktop Hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2.5 py-1.5 bg-mono-900 dark:bg-mono-100 text-mono-50 dark:text-mono-900 text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all scale-95 group-hover:scale-100 z-100 shadow-lg border border-white/10 dark:border-black/10 hidden md:block">
                      {users.map(u => typeof u === 'string' ? 'یاریکەر' : u.name).join('، ')}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-mono-900 dark:border-t-mono-100"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Motion.div>
  );
}


export default function SocialHubView({
  onBack,
  initialChatPartner = null,
  initialTab = null,
  onViewMessages: _onViewMessages,
  onViewFriends: _onViewFriends,
  onKeyboardToggle
}) {
  const {
    user,
    userNickname,
    userAvatar,
    handleToggleBlock: toggleBlockInContext,
    loadingAuth,
    onlineUsers
  } = useUser();
  const {
    playNotifSound,
    playMessageSound: _playMessageSound,
    playMessageSentSound,
    playTabSound,
    playBubblePopSound
  } = useAudio();
  const [activeTab, setActiveTab] = useState(initialTab || (initialChatPartner ? 'private' : 'global'));
  const [messages, setMessages] = useState([]);
  const [privateChats, setPrivateChats] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(initialChatPartner);
  const [chatMessages, setChatMessages] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [partnerIsTyping, setPartnerIsTyping] = useState(false);
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [activeReactionModal, setActiveReactionModal] = useState(null); // { message, activeTab }
  const [reactionUsers, setReactionUsers] = useState({}); // { id: nickname }
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [pendingSentIds, setPendingSentIds] = useState(new Set());
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [newGlobalCount, setNewGlobalCount] = useState(0);
  const typingTimeoutRef = useRef(null);
  const typingChannelRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const isSearchingRef = useRef(false);
  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);
  
  const activeTabRef = useRef(activeTab);
  const selectedChatRef = useRef(selectedChat);
  
  // Fetch real names for old string IDs or missing names in reactions
  useEffect(() => {
    if (!activeReactionModal?.message?.reactions) return;
    
    const fetchMissingNames = async () => {
      const missingIds = [];
      Object.values(activeReactionModal.message.reactions).forEach(users => {
        users.forEach(u => {
          const id = typeof u === 'string' ? u : u.id;
          // Check for undefined strictly to avoid re-fetching nulls
          if (id && reactionUsers[id] === undefined) {
            missingIds.push(id);
          }
        });
      });
      
      if (missingIds.length > 0) {
        const { data } = await supabase.from('profiles').select('id, nickname, avatar_url').in('id', missingIds);
        
        setReactionUsers(prev => {
          const newMap = { ...prev };
          // Mark all requested IDs as null first to prevent infinite fetch loop if not found
          missingIds.forEach(id => {
            if (newMap[id] === undefined) newMap[id] = null;
          });
          
          if (data) {
            data.forEach(p => {
              newMap[p.id] = { nickname: p.nickname || null, avatar_url: p.avatar_url || null };
            });
          }
          return newMap;
        });
      }
    };
    fetchMissingNames();
  }, [activeReactionModal?.message?.reactions, reactionUsers]);

  useEffect(() => { 
    activeTabRef.current = activeTab; 
    window.activeChatTab = activeTab;
    localStorage.setItem('activeChatTab', activeTab);
  }, [activeTab]);
  
  useEffect(() => { 
    selectedChatRef.current = selectedChat; 
    window.activeChatId = selectedChat?.id || null;
    if (selectedChat?.id) {
      localStorage.setItem('activeChatId', selectedChat.id);
    } else {
      localStorage.removeItem('activeChatId');
    }
    return () => { 
      window.activeChatId = null; 
      localStorage.removeItem('activeChatId');
    };
  }, [selectedChat]);

  const fetchGlobalMessages = useCallback(async (signal = null) => {
    if (loading && messages.length > 0) return;
    try {
      let query = supabase
        .from('messages')
        .select('id, content, user_id, user_nickname, created_at, reply_to_id, reply_to_text, reactions, sender:profiles!user_id(avatar_url)')
        .is('receiver_id', null)
        .order('created_at', { ascending: false }) // Fetch descending so we get latest 50
        .limit(50);

      if (signal) query = query.abortSignal(signal);

      const { data, error } = await query;
      
      if (error) {
        if (error.name === 'AbortError' || error.message?.includes('aborted')) throw error;
        // Fallback if join syntax fails
        query = supabase.from('messages').select('id, content, user_id, user_nickname, created_at, reply_to_id, reply_to_text, reactions').is('receiver_id', null).order('created_at', { ascending: false }).limit(50);
        if (signal) query = query.abortSignal(signal);
        const fallbackRes = await query;
        if (fallbackRes.error) throw fallbackRes.error;
        const userIds = [...new Set(fallbackRes.data.map(m => m.user_id))];
        const { data: profiles } = await supabase.from('profiles').select('id, avatar_url').in('id', userIds);
        const avatarMap = {};
        if (profiles) profiles.forEach(p => avatarMap[p.id] = p.avatar_url);
        fallbackRes.data.forEach(m => m.user_avatar = avatarMap[m.user_id] || 'default');
        setMessages(fallbackRes.data.reverse()); // Reverse to show ascending in UI
        return;
      }

      if (data) {
        data.forEach(m => {
          m.user_avatar = m.sender?.avatar_url || 'default';
        });
        setMessages(data.reverse()); // Reverse to show ascending in UI
      } else {
        setMessages([]);
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.message?.includes('aborted')) return;
      console.warn("Global fetch error:", err);
    } finally {
      if (activeTab === 'global') setLoading(false);
    }
  }, [activeTab, loading, messages.length]);

  const fetchFriendsData = useCallback(async (signal = null) => {
    if (!user?.id) return;
    try {
      let fQuery = supabase
        .from('friendships')
        .select(`
          *,
          user_data:profiles!user_id(id, nickname, avatar_url, updated_at),
          friend_data:profiles!friend_id(id, nickname, avatar_url, updated_at)
        `)
        .or(`user_id.eq.${user?.id},friend_id.eq.${user?.id}`);

      if (signal) fQuery = fQuery.abortSignal(signal);

      const { data: friendships, error: fError } = await fQuery;
      
      let finalFriendships = friendships;
      
      if (fError) {
        if (fError.name === 'AbortError' || fError.message?.includes('aborted')) throw fError;
        // Fallback for missing join relations
        console.warn("Using friends fallback", fError);
        let fbQuery = supabase.from('friendships').select('*').or(`user_id.eq.${user?.id},friend_id.eq.${user?.id}`);
        if (signal) fbQuery = fbQuery.abortSignal(signal);
        const fallbackRes = await fbQuery;
        if (fallbackRes.error) throw fallbackRes.error;
        
        const profileIds = new Set();
        fallbackRes.data.forEach(f => { profileIds.add(f.user_id); profileIds.add(f.friend_id); });
        const { data: profiles } = await supabase.from('profiles').select('id, nickname, avatar_url, updated_at').in('id', Array.from(profileIds));
        const profileMap = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
        
        finalFriendships = fallbackRes.data.map(f => ({
          ...f,
          user_data: profileMap[f.user_id],
          friend_data: profileMap[f.friend_id]
        }));
      }

      const requests = [];
      const accepted = [];
      const sentPendingList = new Set();
      const uniqueRelationships = new Map();
      
      finalFriendships.forEach(f => {
        const isUserMe = f.user_id === user?.id;
        const otherId = isUserMe ? f.friend_id : f.user_id;
        const profileData = isUserMe ? f.friend_data : f.user_data;
        
        if (!profileData) return;
        
        const existing = uniqueRelationships.get(otherId);
        if (!existing || f.status === 'accepted' || (f.status === 'pending' && f.friend_id === user?.id && existing.status !== 'accepted')) {
          uniqueRelationships.set(otherId, { ...f, friendData: profileData });
        }
      });

      uniqueRelationships.forEach(rel => {
        if (rel.status === 'pending') {
          if (rel.friend_id === user?.id) requests.push({ ...rel, sender: rel.friendData });
          else sentPendingList.add(rel.friend_id);
        } else if (rel.status === 'accepted') {
          accepted.push({ ...rel, friend: rel.friendData });
        }
      });
      
      setPendingRequests(requests);
      setFriends(accepted);
      setPendingSentIds(sentPendingList);
    } catch (err) {
      if (err.name === 'AbortError' || err.message?.includes('aborted')) return;
      console.warn("Friendships fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchPrivateConversations = useCallback(async (signal = null) => {
    if (loadingAuth || !user?.id || user.id === 'undefined') return;
    try {
      let query = supabase.rpc('get_user_conversations', { current_user_id: user.id });
      if (signal) query = query.abortSignal(signal);

      const { data, error } = await query;
      
      if (error) {
        if (error.name === 'AbortError' || error.message?.includes('aborted')) throw error;
        console.warn("WhatsApp RPC failed, falling back to basic fetch:", error);
        const fallbackQuery = supabase.from('messages').select('*').or(`user_id.eq.${user?.id},receiver_id.eq.${user?.id}`).not('receiver_id', 'is', null).order('created_at', { ascending: false }).limit(200);
        const { data: fallbackData, error: fErr } = await (signal ? fallbackQuery.abortSignal(signal) : fallbackQuery);
        if (fErr) throw fErr;
        let unread = fallbackData.filter(m => m.receiver_id === user?.id && !m.is_read).length;
        setUnreadMessageCount(unread);
        const convosMap = new Map();
        fallbackData.forEach(m => {
          const partnerId = m.user_id == user?.id ? m.receiver_id : m.user_id;
          if (!convosMap.has(partnerId)) {
            convosMap.set(partnerId, { lastMsg: m.content, time: m.created_at, partnerId, unreadCount: 0 });
          }
          if (m.receiver_id === user?.id && !m.is_read) {
            convosMap.get(partnerId).unreadCount++;
          }
        });
        const partnerIds = Array.from(convosMap.keys());
        if (partnerIds.length === 0) { setPrivateChats([]); return; }
        const { data: profiles } = await supabase.from('profiles').select('id, nickname, avatar_url, updated_at').in('id', partnerIds);
        const enriched = (profiles || []).map(p => ({ ...p, ...convosMap.get(p.id) })).sort((a, b) => new Date(b.time) - new Date(a.time));
        setPrivateChats(enriched);
        return;
      }
      
      let unread = 0;
      const formatted = (data || []).map(row => {
        unread += Number(row.unread_count);
        return {
          id: row.partner_id,
          nickname: row.nickname,
          avatar_url: row.avatar_url,
          lastMsg: row.last_message,
          time: row.last_message_time,
          unreadCount: Number(row.unread_count)
        };
      });
      
      setUnreadMessageCount(unread);
      setPrivateChats(formatted);
    } catch (err) {
      if (err.name === 'AbortError' || err.message?.includes('aborted')) return;
      console.warn("Private convo fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadingAuth]);

  const fetchPrivateChatHistory = useCallback(async (partnerId) => {
    if (loadingAuth || !user?.id || user.id === 'undefined' || !partnerId) return;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, content, user_id, receiver_id, created_at, is_read, reactions')
        .or(`and(user_id.eq.${user?.id},receiver_id.eq.${partnerId}),and(user_id.eq.${partnerId},receiver_id.eq.${user?.id})`)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setChatMessages(data || []);
    } catch (err) {
      console.error("Chat history fetch error:", err);
    }
  }, [user?.id, loadingAuth]);

  useEffect(() => {
    if (!user?.id) return;
    const globalSub = supabase.channel('public:messages:global').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'receiver_id=is.null' }, (payload) => {
      if (payload.new.user_id !== user?.id) {
        playNotifSound();
        if (activeTabRef.current !== 'global') setNewGlobalCount(prev => prev + 1);
      }
      fetchGlobalMessages();
    }).subscribe();
    
    const socialSub = supabase.channel('public:friendships').on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => fetchFriendsData()).subscribe();
    
    const privateMsgSub = supabase.channel('private:messages').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
      const isPrivate = payload.new.receiver_id !== null;
      const involvesMe = payload.new.user_id === user?.id || payload.new.receiver_id === user?.id;
      if (isPrivate && involvesMe) {
        if (payload.eventType === 'INSERT' && payload.new.user_id !== user?.id) {
          const isCurrentlyViewingChat = activeTabRef.current === 'private' && selectedChatRef.current?.id === payload.new.user_id;
          if (!isCurrentlyViewingChat) {
            playNotifSound();
          }
        }
        fetchPrivateConversations();
        if (selectedChatRef.current && (payload.new.user_id === selectedChatRef.current.id || payload.new.receiver_id === selectedChatRef.current.id)) {
          fetchPrivateChatHistory(selectedChatRef.current.id);
        }
      }
    }).subscribe();
    
    const typingChannel = supabase.channel(`typing-${user?.id}`).on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (selectedChatRef.current && payload.sender_id === selectedChatRef.current.id) setPartnerIsTyping(true);
    }).on('broadcast', { event: 'stop' }, ({ payload }) => {
      if (selectedChatRef.current && payload.sender_id === selectedChatRef.current.id) setPartnerIsTyping(false);
    }).subscribe();
    
    typingChannelRef.current = typingChannel;
    
    return () => {
      supabase.removeChannel(globalSub);
      supabase.removeChannel(socialSub);
      supabase.removeChannel(privateMsgSub);
      supabase.removeChannel(typingChannel);
    };
  }, [user?.id, fetchGlobalMessages, fetchFriendsData, fetchPrivateConversations, fetchPrivateChatHistory, playNotifSound]);

  useEffect(() => {
    const controller = new AbortController();
    fetchGlobalMessages(controller.signal);
    fetchFriendsData(controller.signal);
    fetchPrivateConversations(controller.signal);
    // Removed the 60s setInterval polling, relying strictly on realtime!
    return () => {
      controller.abort();
    };
  }, [user?.id, fetchGlobalMessages, fetchFriendsData, fetchPrivateConversations]);

  useEffect(() => {
    const controller = new AbortController();
    if (activeTab === 'global') { fetchGlobalMessages(controller.signal); setNewGlobalCount(0); }
    if (activeTab === 'friends') fetchFriendsData(controller.signal);
    if (activeTab === 'private') fetchPrivateConversations(controller.signal);
    return () => controller.abort();
  }, [activeTab, fetchGlobalMessages, fetchFriendsData, fetchPrivateConversations]);

  useEffect(() => {
    setPartnerIsTyping(false);
    if (selectedChat) fetchPrivateChatHistory(selectedChat.id);
  }, [selectedChat, fetchPrivateChatHistory]);

  useEffect(() => {
    if (activeTab === 'global' || selectedChat) {
      if (messagesContainerRef.current) {
        // Immediate scroll for new messages, smooth for tab switches
        const behavior = (messages.length > 0 || chatMessages.length > 0) ? 'auto' : 'smooth';
        messagesContainerRef.current.scrollTo({ top: messagesContainerRef.current.scrollHeight, behavior });
      }
    }
  }, [messages.length, chatMessages.length, activeTab, selectedChat]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearchPlayers = useCallback(async (query) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    if (loadingAuth || !user?.id || user.id === 'undefined' || isSearchingRef.current) return;

    // 1. Debounce Logic: Wait 500ms before firing request
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      isSearchingRef.current = true;
      try {
        let queryBuilder = supabase.from('profiles').select('id, nickname, avatar_url, updated_at').ilike('nickname', `%${query}%`);
        queryBuilder = queryBuilder.neq('id', user.id);
        const { data, error } = await queryBuilder.limit(10);
        if (error) throw error;
        setSearchResults(data || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearching(false);
        isSearchingRef.current = false;
        searchTimeoutRef.current = null;
      }
    }, 500);
  }, [user?.id, loadingAuth]);

  const handleAddFriend = async (friendId) => {
    try {
      if (!user?.id || pendingSentIds.has(friendId)) return;
      triggerHaptic(15);
      setPendingSentIds(prev => new Set([...prev, friendId]));
      const { error } = await supabase.from('friendships').insert([{ user_id: user.id, friend_id: friendId, status: 'pending' }]);
      if (error) { if (error.code === '23505') return; throw error; }
    } catch (err) {
      console.error("Friend request error:", err);
      setPendingSentIds(prev => { const next = new Set(prev); next.delete(friendId); return next; });
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      triggerHaptic(20);
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId);
      if (error) throw error;
      fetchFriendsData();
    } catch (err) {
      console.error("Error accepting friend request:", err);
    }
  };


  const sendTypingStatus = async (isTyping) => {
    if (!selectedChat || !user?.id) return;
    try {
      // Use a dedicated outbound channel for the current partner
      const outboundChannel = supabase.channel(`typing-${selectedChat.id}`);
      outboundChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await outboundChannel.send({
            type: 'broadcast',
            event: isTyping ? 'typing' : 'stop',
            payload: { sender_id: user.id }
          });
          // Cleanup outbound channel shortly after sending
          setTimeout(() => {
            if (outboundChannel) supabase.removeChannel(outboundChannel);
          }, 1000);
        }
      });
    } catch (e) {
      console.warn("Typing broadcast failed:", e);
    }
  };

  const handleInputChange = (val) => {
    setNewMessage(val);

    // Typing status logic
    if (selectedChat && activeTab === 'private') {
      if (val.length > 0) {
        // If first character or timeout was active
        if (!typingTimeoutRef.current) {
          sendTypingStatus(true);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Set new timeout to stop typing after 2 seconds
        typingTimeoutRef.current = setTimeout(() => {
          sendTypingStatus(false);
          typingTimeoutRef.current = null;
        }, 2000);
      } else {
        // Explicitly stop if field cleared
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
          sendTypingStatus(false);
        }
      }
    }
  };

  const handleDeleteMessage = async (msg) => {
    if (!user?.id || msg.user_id !== user.id) return;
    try {
      const { error } = await supabase
        .from('messages')
        .update({ content: 'ئەڤ نامەیە هاتە ژێبرن' })
        .eq('id', msg.id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update UI optimistically
      if (activeTab === 'global') {
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, content: 'ئەڤ نامەیە هاتە ژێبرن' } : m));
      } else if (selectedChat) {
        setChatMessages(prev => prev.map(m => m.id === msg.id ? { ...m, content: 'ئەڤ نامەیە هاتە ژێبرن' } : m));
      }
    } catch (e) {
      console.error("Error deleting message:", e);
    }
  };

  const handleReport = async (msg) => {
    // Optimistically hide the message
    const updateLocalState = (prev) => prev.filter(m => m.id !== msg.id);
    if (activeContextMenu?.isPrivate) {
      setChatMessages(prev => updateLocalState(prev));
    } else {
      setMessages(prev => updateLocalState(prev));
    }
    
    // Insert into reported_messages table
    try {
      await supabase.from('reported_messages').insert([{
        message_id: msg.id,
        reporter_id: user?.id
      }]);
    } catch (err) {
      console.error("Failed to report message:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id) return;

    const msgContent = newMessage.trim();
    const currentUserId = user?.id;
    triggerHaptic(15);
    playMessageSentSound();

    // Clear input immediately for better UX
    setNewMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      if (activeTab === 'global') {
        const payload = {
          content: msgContent,
          user_id: currentUserId,
          user_nickname: userNickname || 'یاریزان',
          user_avatar: userAvatar,
          reply_to_id: replyingTo?.id,
          reply_to_text: replyingTo?.content || replyingTo?.text
        };

        // Optimistic update for Global
        setMessages(prev => [...prev, { ...payload, created_at: new Date().toISOString(), id: 'temp-' + Date.now() }]);
        setReplyingTo(null); // Clear reply state

        const { error } = await supabase.from('messages').insert([{
          content: payload.content,
          user_id: payload.user_id,
          user_nickname: payload.user_nickname,
          reply_to_id: payload.reply_to_id,
          reply_to_text: payload.reply_to_text
        }]);
        if (error) {
          console.error("Global send error:", error);
          throw error;
        }
        fetchGlobalMessages();
      } else if (selectedChat) {
        const partnerId = selectedChat.id;

        // Optimistic update for Private
        const tempMsg = {
          content: msgContent,
          user_id: currentUserId,
          receiver_id: partnerId,
          reply_to_id: replyingTo?.id,
          reply_to_text: replyingTo?.content || replyingTo?.text,
          created_at: new Date().toISOString(),
          id: 'temp-' + Date.now()
        };
        setChatMessages(prev => [...prev, tempMsg]);
        setReplyingTo(null); // Clear reply state after sending

        const { error } = await supabase
          .from('messages')
          .insert([{
            content: msgContent,
            user_id: currentUserId,
            receiver_id: partnerId,
            reply_to_id: tempMsg.reply_to_id,
            reply_to_text: tempMsg.reply_to_text,
            is_read: false
          }]);

        if (error) {
          console.error("Private send error:", error);
          throw error;
        }

        // Refresh history to get real DB data (IDs, etc)
        fetchPrivateChatHistory(partnerId);
        // Also refresh conversations list to update last message
        fetchPrivateConversations();
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      const errorMsg = err.message || "ئاریشەکا نەدیار";
      const errorCode = err.code || "unknown";
      alert(`ئاریشەیەک د ھنارتنا نامەیێ دا ھەبوو:\n\nMessage: ${errorMsg}\nCode: ${errorCode}\n\nهێڤییە دڵنیابە کو دەستھەڵاتێن Supabase دروستن.`);
      // On failure, we could restore the message to the box
      setNewMessage(msgContent);
    }
  };

  const handleReact = async (msgId, emoji, isPrivate = false) => {
    if (!user?.id) return;
    triggerHaptic(10);
    const table = isPrivate ? 'private_messages' : 'messages';

    // Optimistic UI update
    const updateLocalState = (prev) => prev.map(m => {
      if (m.id === msgId) {
        const reactions = { ...(m.reactions || {}) };
        const users = [...(reactions[emoji] || [])];
        const idx = users.findIndex(u => (typeof u === 'string' ? u : u.id) === user?.id);
        if (idx > -1) users.splice(idx, 1);
        else users.push({ id: user?.id, name: userNickname || 'یاریکەر' });

        if (users.length === 0) delete reactions[emoji];
        else reactions[emoji] = users;
        return { ...m, reactions };
      }
      return m;
    });

    if (isPrivate) setChatMessages(prev => updateLocalState(prev));
    else setMessages(prev => updateLocalState(prev));

    try {
      // Fetch message to check ownership
      const columns = 'reactions, user_id';
      const { data: msg, error: fetchError } = await supabase.from(table).select(columns).eq('id', msgId).single();
      if (fetchError) throw fetchError;

      // Prevent reacting to own messages
      const ownerId = msg.user_id;
      if (ownerId === user?.id) {
        console.warn("You cannot react to your own message.");
        // Revert optimistic UI
        if (isPrivate) setChatMessages(prev => updateLocalState(prev));
        else setMessages(prev => updateLocalState(prev));
        return;
      }

      let reactions = msg?.reactions || {};
      const users = reactions[emoji] || [];
      const userIndex = users.findIndex(u => (typeof u === 'string' ? u : u.id) === user?.id);

      if (userIndex > -1) users.splice(userIndex, 1);
      else users.push({ id: user?.id, name: user?.nickname || 'یاریکەر' });

      if (users.length === 0) delete reactions[emoji];
      else reactions[emoji] = users;

      await supabase.from(table).update({ reactions }).eq('id', msgId);
    } catch (err) {
      console.error("Database sync failed for reaction:", err);
      // Revert is handled by the next realtime sync/fetch
    }
  };


  const handleToggleBlock = async (currentStatus) => {
    if (!selectedPlayer || !user?.id) return;
    const success = await toggleBlockInContext(selectedPlayer.id, currentStatus);
    if (success) {
      if (!currentStatus) alert("یاریزان ھاتە بلۆککرن!");
      else alert("بلۆک ھاتە لابرن!");
      setSelectedPlayer(null); // Close modal after action
    }
  };

  return (
    <div className="flex flex-col h-full bg-mono-white dark:bg-black text-mono-900 dark:text-mono-50 overflow-hidden transition-colors duration-500" dir="rtl">
      {/* Header - Social Center Branding */}
      <div
        className="px-4 pb-4 flex items-center justify-center border-b border-mono-200 dark:border-mono-800 bg-mono-white dark:bg-mono-900 transition-colors duration-500"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
      >
        <h2 className="text-xl font-black font-rabar text-mono-900 dark:text-mono-100">ناڤەندا جڤاکی</h2>
      </div>

      {/* Tabs - Sharp Segmented Style with Shadow */}
      <div className="px-4 py-3">
        <div className="flex p-1 bg-mono-100 dark:bg-mono-900 rounded-md relative shadow-sm border border-mono-200 dark:border-mono-800 transition-colors duration-300">
          {[
            { id: 'global', label: 'جیھانی', icon: 'public', badge: newGlobalCount },
            { id: 'private', label: 'نامە', icon: 'chat', badge: unreadMessageCount },
            { id: 'friends', label: 'ھەڤال', icon: 'group', badge: pendingRequests.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic(10);
                playTabSound();
                setActiveTab(tab.id);
                setSelectedChat(null);
              }}
              className={`flex-1 py-2.5 rounded-sm flex items-center justify-center gap-2 transition-all relative z-10 ${activeTab === tab.id ? 'text-mono-50 font-black dark:text-mono-50' : 'text-mono-600 hover:text-mono-900 dark:text-mono-400 dark:hover:text-mono-100'}`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span className="text-xs font-black">{tab.label}</span>
              {tab.badge > 0 && (
                <span className="absolute -top-1 right-2 min-w-[16px] h-4 bg-red-500 rounded-full border border-white/20 flex items-center justify-center px-1 ring-2 ring-mono-200 dark:ring-mono-800">
                  <span className="text-[10px] text-white font-black leading-none">
                    {toKuDigits(tab.badge > 99 ? '99+' : tab.badge)}
                  </span>
                </span>
              )}
            </button>
          ))}
          {/* Sliding Active Background - Sharp Edges */}
          <div
            className="absolute top-1 bottom-1 transition-all duration-300 ease-out bg-black dark:bg-mono-800 rounded-sm z-0 shadow-md"
            style={{
              width: 'calc(33.33% - 4px)',
              right: activeTab === 'global' ? '4px' : activeTab === 'private' ? '33.33%' : '66.66%'
            }}
          />
        </div>
      </div>

      {/* Main Content Area - Layout Engine */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-mono-white dark:bg-black z-10 transition-colors duration-500">
            <div className="w-10 h-10 border-4 border-mono-200 dark:border-mono-800 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {/* Global Chat View */}
        {activeTab === 'global' && (
          <div className="flex-1 relative overflow-hidden bg-mono-50 dark:bg-black/50 transition-colors duration-500">
            {/* Delicate Texture Overlay */}
            <div
              className="absolute inset-0 opacity-[0.06] dark:opacity-[0.1] pointer-events-none grayscale"
              style={{
                backgroundImage: "url('/chat_wallpaper.png')",
                backgroundRepeat: 'repeat',
                backgroundSize: '450px'
              }}
            />

            <div
              ref={messagesContainerRef}
              className="relative z-10 flex-1 h-full overflow-y-auto p-4 space-y-4 no-scrollbar"
            >
              <AnimatePresence initial={false}>
                {messages.map((m, idx) => (
                  <MessageItem
                    key={m.id || idx}
                    m={m}
                    isMe={m.user_id === user?.id}
                    currentUserId={user?.id}
                    currentUserNickname={userNickname}
                    showNickname={true}
                    onLongPress={(msg, x, y) => setActiveContextMenu({ message: msg, x, y, isPrivate: false })}
                    onReact={handleReact}
                    onReactionLongPress={(msg, emoji, x, y) => setActiveReactionModal({ message: msg, activeTab: emoji, x, y, isPrivate: false })}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Friends View - Scrollable */}
        {activeTab === 'friends' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
            <div className="relative group">
              <span className="material-symbols-outlined absolute right-3 top-3.5 text-mono-500">search</span>
              <input
                type="text"
                id="player-search"
                name="player-search"
                aria-label="Search for players"
                placeholder="گەڕیان ل ھەڤالێن نوو..."
                value={searchQuery}
                onChange={(e) => handleSearchPlayers(e.target.value)}
                className="w-full bg-mono-100 dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-md py-3.5 pr-11 pl-4 text-sm font-bold font-rabar focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300 text-mono-900 dark:text-mono-50"
              />
              {searching && <div className="absolute left-4 top-4 w-4 h-4 border-2 border-mono-300 dark:border-mono-700 border-t-primary rounded-full animate-spin" />}
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3 p-3 bg-mono-50 dark:bg-mono-900/50 rounded-md border border-mono-200 dark:border-mono-800">
                <h3 className="text-[10px] font-black uppercase text-mono-500  px-1">ئەنجامێن ئەڤێ ھاتینە دیتن</h3>
                {searchResults.map(res => {
                  const isFriend = friends.some(f => f.friend?.id === res.id);
                  const isPending = pendingRequests.some(r => r.sender?.id === res.id || r.friend_id === res.id);

                  return (
                    <div key={res.id} className="flex items-center gap-3 p-2 hover:bg-mono-100 dark:hover:bg-white/5 rounded-md transition-all group cursor-pointer">
                      <div className="flex items-center gap-3 flex-1" onClick={() => { triggerHaptic(10); setSelectedPlayer(res); }}>
                        <Avatar src={res.avatar_url} lastActive={res.updated_at} isOnline={onlineUsers?.has(res.id)} showStatus={true} size="sm" />
                        <div className="flex-1 text-right">
                          <div className="font-black text-sm group-hover:text-primary transition-colors text-mono-900 dark:text-mono-100">{res.nickname}</div>
                        </div>
                      </div>

                      {isFriend ? (
                        <div className="px-3 py-1.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-md font-black text-[10px] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                          ھوین ھەڤالن
                        </div>
                      ) : (isPending || pendingSentIds.has(res.id)) ? (
                        <div className="px-3 py-1.5 bg-mono-100 dark:bg-mono-800 text-mono-400 dark:text-mono-500 border border-mono-200 dark:border-mono-700 rounded-md font-black text-[10px] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
                          چاڤەڕێبە
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAddFriend(res.id); }}
                          className="px-3 py-1.5 bg-emerald-500 text-white rounded-md font-black text-[10px] flex items-center gap-1 hover:bg-emerald-600 active:scale-95 transition-all"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                          ببە ھەڤاڵ
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {pendingRequests.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase text-mono-500  px-2">داخوازێن ھەڤالینیێ</h3>
                {pendingRequests.map(req => (
                  <div key={req.id} className="flex items-center gap-3 p-3 bg-mono-white dark:bg-mono-900 rounded-md border border-mono-200 dark:border-mono-800 shadow-sm transition-colors duration-300">
                    <Avatar src={req.sender?.avatar_url} lastActive={req.sender?.updated_at} isOnline={onlineUsers?.has(req.sender?.id)} showStatus={true} size="sm" />
                    <div className="flex-1 text-right">
                      <div className="font-black text-sm text-mono-900 dark:text-mono-100">{req.sender?.nickname}</div>
                    </div>
                    <button onClick={() => handleAcceptRequest(req.id)} className="px-4 py-2 bg-emerald-500 text-white rounded-md font-black text-[10px] uppercase hover:bg-emerald-600 active:scale-95 transition-all">پەژراندن</button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase text-mono-600 dark:text-mono-400  px-2">ھەڤالێن تە</h3>
              {friends
                .sort((a, b) => {
                  const activeA = new Date(a.friend?.updated_at || 0);
                  const activeB = new Date(b.friend?.updated_at || 0);
                  const isOnlineA = onlineUsers?.has(a.friend?.id);
                  const isOnlineB = onlineUsers?.has(b.friend?.id);
                  if (isOnlineA && !isOnlineB) return -1;
                  if (!isOnlineA && isOnlineB) return 1;
                  return activeB - activeA; // Secondary sort by last active
                })
                .map(f => (
                  <div key={f.id} className="flex items-center gap-3 p-2 bg-mono-white dark:bg-mono-900 rounded-md border border-mono-200 dark:border-mono-800 group hover:border-primary/30 transition-all shadow-sm">
                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => { triggerHaptic(10); playBubblePopSound(); setSelectedPlayer(f.friend); }}>
                      <Avatar src={f.friend?.avatar_url} lastActive={f.friend?.updated_at} isOnline={onlineUsers?.has(f.friend?.id)} showStatus={true} size="sm" />
                      <div className="flex-1 text-right">
                        <div className="font-black text-sm text-mono-900 dark:text-mono-100 group-hover:text-primary transition-colors">{f.friend?.nickname}</div>
                      </div>
                    </div>
                    <button onClick={() => { triggerHaptic(10); playBubblePopSound(); setActiveTab('private'); setSelectedChat(f.friend); }} className="w-10 h-10 flex items-center justify-center rounded-md bg-mono-100 dark:bg-mono-800 text-mono-600 dark:text-mono-300 hover:bg-primary hover:text-white transition-all">
                      <span className="material-symbols-outlined text-[20px] font-bold">chat</span>
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Private Chat View - Complex Layout Support */}
        {activeTab === 'private' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedChat ? (
              <div className="flex-1 flex flex-col overflow-hidden bg-mono-50 dark:bg-black">
                <div className="shrink-0 p-3 bg-mono-white dark:bg-mono-900 border-b border-mono-200 dark:border-mono-800 flex items-center gap-3 z-10 shadow-sm transition-colors duration-300">
                  <button onClick={() => { playBubblePopSound(); setSelectedChat(null); }} className="material-symbols-outlined text-mono-400 hover:text-mono-900 dark:text-mono-500 dark:hover:text-mono-100">arrow_back</button>
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => { triggerHaptic(10); playBubblePopSound(); setSelectedPlayer(selectedChat); }}>
                    <Avatar src={selectedChat.avatar_url} lastActive={selectedChat.updated_at} isOnline={onlineUsers?.has(selectedChat.id)} showStatus={true} size="sm" />
                    <div className="flex flex-col items-start">
                      <span className="font-black text-sm hover:text-primary transition-colors text-mono-900 dark:text-mono-100">{selectedChat.nickname}</span>
                      <span className="text-[10px] text-mono-500 dark:text-mono-400 font-medium">
                        {onlineUsers?.has(selectedChat.id) ? 'ئۆنلاینە' : (() => {
                          if (!selectedChat.updated_at) return 'ئۆفلاین';
                          const diff = Math.floor((new Date() - new Date(selectedChat.updated_at)) / 1000);
                          if (diff < 60) return 'کۆتا بینین چەند چرکەیەک پێش ئێستا';
                          if (diff < 3600) return `کۆتا بینین ${Math.floor(diff / 60)} خولەک پێش ئێستا`;
                          if (diff < 86400) return `کۆتا بینین ${Math.floor(diff / 3600)} کاتژمێر پێش ئێستا`;
                          return `کۆتا بینین ${Math.floor(diff / 86400)} ڕۆژ پێش ئێستا`;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 relative overflow-hidden bg-mono-50 dark:bg-mono-900 transition-colors duration-500">
                  {/* Delicate Texture Overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.06] dark:opacity-[0.12] pointer-events-none grayscale invert dark:invert-0"
                    style={{
                      backgroundImage: "url('/chat_wallpaper.png')",
                      backgroundRepeat: 'repeat',
                      backgroundSize: '450px'
                    }}
                  />

                  <div
                    ref={messagesContainerRef}
                    className="relative z-10 flex-1 h-full overflow-y-auto p-4 space-y-4 no-scrollbar"
                  >
                    {chatMessages.map((m, idx) => (
                      <MessageItem
                        key={m.id || idx}
                        m={m}
                        isMe={m.user_id === user?.id}
                        currentUserId={user?.id}
                        currentUserNickname={userNickname}
                        onSeen={async (id) => {
                          if (m.user_id !== user?.id && !m.is_read) {
                            await supabase
                              .from('messages')
                              .update({ is_read: true })
                              .eq('id', id);
                          }
                        }}
                        onLongPress={(msg, x, y) => setActiveContextMenu({ message: msg, x, y, isPrivate: true })}
                        onReact={(msgId, emoji) => handleReact(msgId, emoji, true)}
                        onReactionLongPress={(msg, emoji, x, y) => setActiveReactionModal({ message: msg, activeTab: emoji, x, y, isPrivate: true })}
                      />
                    ))}

                    {partnerIsTyping && (
                      <Motion.div
                        initial={{ opacity: 0, scale: 0.8, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        className="flex items-center gap-2 mb-4"
                      >
                        <div className="bg-mono-100/80 dark:bg-mono-800/80 px-4 py-2 rounded-md border border-mono-200 dark:border-mono-700 flex items-center gap-2 shadow-sm">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                          </div>
                          <span className="text-[10px] font-black text-mono-500 dark:text-mono-400">دنڤیسیت...</span>
                        </div>
                      </Motion.div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {privateChats.length === 0 && !loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-40 space-y-4">
                    <span className="material-symbols-outlined text-6xl text-mono-400">forum</span>
                    <div className="text-center">
                      <div className="font-black text-lg text-mono-900 dark:text-mono-50">ھیچ نامەیەک نینە</div>
                      <div className="text-xs font-bold font-rabar text-mono-500">دەستپێبکە ب نڤێسینا نامەیەکێ بۆ ھەڤالێن خوە</div>
                    </div>
                    <button
                      onClick={() => setActiveTab('friends')}
                      className="px-6 py-2 bg-mono-100 dark:bg-mono-900 rounded-md text-xs font-black border border-mono-200 dark:border-mono-800 shadow-sm"
                    >
                      دیتنا ھەڤالان
                    </button>
                  </div>
                ) : (
                  privateChats.map(chat => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className="flex items-center justify-between gap-4 p-3 bg-mono-white dark:bg-mono-900 rounded-md border border-mono-200 dark:border-mono-800 hover:bg-mono-50 dark:hover:bg-mono-800/50 cursor-pointer transition-all group relative active:scale-[0.98] shadow-sm"
                    >
                      {/* Left Group: Avatar + Content */}
                      <div className="flex flex-1 items-center justify-start gap-3 min-w-0">
                        {/* Avatar */}
                        <div className="shrink-0" onClick={(e) => { e.stopPropagation(); triggerHaptic(10); setSelectedPlayer(chat); }}>
                          <Avatar
                            src={chat.avatar_url}
                            lastActive={chat.updated_at}
                            showStatus={true}
                            size="md"
                            border={false}
                            className="transition-all"
                          />
                        </div>

                        {/* Name and Message */}
                        <div className="flex flex-col items-start min-w-0">
                          <span className="font-black text-sm text-mono-900 dark:text-mono-100 group-hover:text-primary transition-colors truncate w-full text-left">
                            {chat.nickname}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs font-bold font-rabar text-mono-500 dark:text-mono-400 w-full justify-start">
                            <span className="material-symbols-outlined text-[14px]">chat</span>
                            <span className="truncate">{chat.lastMsg || 'نامەک ل ڤێرێیە'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Time and Indicator */}
                      <div className="flex flex-col items-end justify-center min-w-[50px] pr-1">
                        <span className="text-[10px] font-bold text-mono-400 dark:text-mono-500 mb-1">
                          {new Date(chat.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {chat.unreadCount > 0 && (
                          <div className="w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                            {toKuDigits(chat.unreadCount)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Public Profile Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <PublicProfileModal
            profile={selectedPlayer}
            currentUser={user}
            isFriend={friends.some(f => f.friend?.id === selectedPlayer.id)}
            isPending={pendingRequests.some(r => r.sender?.id === selectedPlayer.id || r.friend_id === selectedPlayer.id)}
            onClose={() => setSelectedPlayer(null)}
            onToggleBlock={handleToggleBlock}
            onOpenChat={(player) => {
              setSelectedPlayer(null);
              setActiveTab('private');
              setSelectedChat(player);
            }}
            onActionComplete={() => {
              fetchFriendsData();
              fetchPrivateConversations();
            }}
          />
        )}
        {activeContextMenu && (
          <MessageContextMenu
            m={activeContextMenu.message}
            x={activeContextMenu.x}
            y={activeContextMenu.y}
            isMe={activeContextMenu.message.user_id === user?.id}
            onClose={() => setActiveContextMenu(null)}
            onReport={handleReport}
            onReact={(emoji) => handleReact(activeContextMenu.message.id, emoji, activeContextMenu.isPrivate)}
            onReply={(msg) => {
              triggerHaptic(10);
              setReplyingTo(msg);
            }}
            onCopy={(text) => {
              navigator.clipboard.writeText(text);
              triggerHaptic(50);
              setShowCopySuccess(true);
              setTimeout(() => setShowCopySuccess(false), 2000);
            }}
            onDelete={(msg) => handleDeleteMessage(msg)}
          />
        )}
      </AnimatePresence>

      {/* Copy Success Toast */}
      <AnimatePresence>
        {showCopySuccess && (
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-200 bg-emerald-500 text-white px-4 py-2 rounded-full text-xs font-black flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">check_circle</span>
            ھاتە ژبەرکرن
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Input Area - WhatsApp Pill Style Swapped */}
      {(activeTab === 'global' || selectedChat) && (
        <div className="bg-mono-white dark:bg-black border-t border-mono-200 dark:border-mono-800 relative z-45 transition-colors duration-300">
          {/* Reply Preview Box */}
          <AnimatePresence>
            {replyingTo && (
              <Motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 py-2 bg-mono-100/80 dark:bg-mono-900/80 border-b border-mono-200 dark:border-mono-800 flex items-center justify-between gap-3 overflow-hidden"
              >
                <div className="flex-1 min-w-0 border-r-4 border-primary/50 pr-3 py-1">
                  <p className="text-[10px] font-black text-primary uppercase  mb-0.5">بەرسڤدانا نامەیێ</p>
                  <p className="text-xs text-mono-600 dark:text-mono-400 truncate">{replyingTo.content || replyingTo.text}</p>
                </div>
                <button
                  onClick={() => { playBubblePopSound(); setReplyingTo(null); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-mono-200 dark:bg-mono-800 hover:bg-mono-300 dark:hover:bg-mono-700 text-mono-600 dark:text-mono-400 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </Motion.div>
            )}
          </AnimatePresence>

          <div className="p-3 pb-6 flex gap-2 items-center">
            <button
              onClick={handleSendMessage}
              onPointerDown={(e) => e.preventDefault()}
              disabled={!newMessage.trim()}
              className={`w-11 h-11 flex items-center justify-center rounded-md transition-all shrink-0 ${newMessage.trim() ? 'bg-[#00a884] text-white scale-100' : 'bg-mono-100 dark:bg-mono-800 text-mono-400 dark:text-mono-600 opacity-50 scale-95'}`}
              title="ھنارتن"
            >
              <span className="material-symbols-outlined font-black text-xl">send</span>
            </button>
            <textarea
              ref={textareaRef}
              rows="1"
              value={newMessage}
              onChange={(e) => {
                handleInputChange(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={selectedChat ? `نامەکێ بۆ ${selectedChat.nickname} بنڤێسە...` : "نامەکێ بنڤێسە..."}
              onFocus={() => onKeyboardToggle?.(true)}
              onBlur={() => onKeyboardToggle?.(false)}
              className="flex-1 bg-mono-100 dark:bg-mono-900 text-mono-900 dark:text-mono-50 placeholder-mono-500 border border-mono-200 dark:border-mono-800 rounded-md px-5 py-3 text-sm font-bold font-rabar focus:ring-1 focus:ring-primary/20 transition-colors duration-300 outline-none resize-none overflow-y-auto no-scrollbar"
            />
          </div>
          {/* Minimalist iOS-Style Home Indicator */}
          <div className="flex flex-col items-center pb-2 pt-1 transition-all">
            <button
              onClick={() => {
                triggerHaptic(10);
                onBack?.();
              }}
              className="px-8 py-2 focus:outline-none active:scale-95 transition-transform"
            >
              <Motion.div
                animate={{
                  width: [40, 50, 40],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="h-1.5 rounded-full bg-mono-900 dark:bg-mono-200"
                style={{ width: '45px' }}
              />
            </button>
          </div>
        </div>
      )}

      {/* Reaction Details Modal (WhatsApp Web Style Centered Card) */}
      <AnimatePresence>
        {activeReactionModal && activeReactionModal.message && activeReactionModal.message.reactions && (
          <div className="fixed inset-0 z-150 flex flex-col items-center justify-center p-4">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveReactionModal(null)}
              className="absolute inset-0 bg-transparent"
            />
            <Motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-[260px] bg-mono-50/95 dark:bg-mono-900/95 backdrop-blur-xl border border-mono-200/50 dark:border-white/10 rounded-md shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
              style={activeReactionModal.x && activeReactionModal.y ? {
                position: 'fixed',
                top: Math.max(20, Math.min(activeReactionModal.y, window.innerHeight - 300)),
                left: Math.max(20, Math.min(activeReactionModal.x - 130, window.innerWidth - 280)),
                transformOrigin: activeReactionModal.message.user_id === user?.id ? 'bottom right' : 'bottom left'
              } : {}}
            >
              <div className="flex flex-col p-3 pb-2 border-b border-mono-200 dark:border-mono-800 shrink-0">
                <h3 className="font-sans font-bold text-[13px] text-mono-600 dark:text-mono-300 mb-2 text-right w-full" dir="rtl">
                  {toKuDigits(Object.values(activeReactionModal.message.reactions).flat().length)} کارڤەدان
                </h3>
                
                {/* Tabs for Emojis */}
                <div className="flex items-center justify-start gap-1 overflow-x-auto no-scrollbar shrink-0" dir="rtl">
                  {Object.entries(activeReactionModal.message.reactions).map(([emoji, users]) => (
                    <button
                      key={emoji}
                      onClick={() => setActiveReactionModal(prev => ({ ...prev, activeTab: emoji }))}
                      className={`flex items-center justify-center gap-1.5 min-w-[48px] px-2 h-7 rounded-full font-bold text-[12px] whitespace-nowrap transition-colors border ${activeReactionModal.activeTab === emoji ? 'border-mono-300 dark:border-mono-600 bg-mono-100 dark:bg-mono-800 text-mono-900 dark:text-white' : 'border-transparent text-mono-500 hover:bg-mono-100 dark:hover:bg-mono-800'}`}
                    >
                      <span className="mt-0.5">{emoji}</span>
                      <span className="text-[11px] tabular-nums mt-0.5">{toKuDigits(users.length)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Users List */}
              <div className="p-2 overflow-y-auto no-scrollbar flex-1 max-h-[200px]" dir="rtl">
                {Object.entries(activeReactionModal.message.reactions)
                  .filter(([emoji]) => activeReactionModal.activeTab === 'all' || activeReactionModal.activeTab === emoji)
                  .flatMap(([emoji, users]) => users.map(u => ({ emoji, user: u })))
                  .map(({ emoji, user: u }, idx) => {
                    const id = typeof u === 'string' ? u : u.id;
                    const reactionData = reactionUsers[id];
                    const uName = typeof u !== 'string' ? u.name : null;
                    const name = reactionData?.nickname || (uName !== 'یاریکەر' ? uName : null) || 'یاریکەر';
                    const avatarUrl = reactionData?.avatar_url;
                    
                    const isMeReaction = id === user?.id;
                    
                    return (
                      <div 
                        key={idx} 
                        className={`flex items-center justify-between p-1.5 rounded-lg hover:bg-mono-50 dark:hover:bg-mono-800/50 transition-colors ${isMeReaction ? 'cursor-pointer' : ''}`}
                        onClick={isMeReaction ? (e) => {
                          e.stopPropagation();
                          handleReact(activeReactionModal.message.id, emoji, activeReactionModal.isPrivate);
                          
                          // Optimistically update the modal's local state so the reaction disappears
                          setActiveReactionModal(prev => {
                            if (!prev) return prev;
                            
                            const newReactions = { ...prev.message.reactions };
                            const usersArray = [...(newReactions[emoji] || [])];
                            
                            const userIdx = usersArray.findIndex(u => (typeof u === 'string' ? u : u.id) === user?.id);
                            if (userIdx > -1) {
                              usersArray.splice(userIdx, 1);
                            }
                            
                            if (usersArray.length === 0) {
                              delete newReactions[emoji];
                            } else {
                              newReactions[emoji] = usersArray;
                            }
                            
                            if (Object.keys(newReactions).length === 0) {
                              return null; // Close if no reactions left globally
                            }
                            
                            let newTab = prev.activeTab;
                            if (!newReactions[emoji] && prev.activeTab === emoji) {
                              newTab = 'all';
                            }
                            
                            return {
                              ...prev,
                              activeTab: newTab,
                              message: {
                                ...prev.message,
                                reactions: newReactions
                              }
                            };
                          });
                        } : undefined}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#f0f2f5] dark:bg-mono-800 flex items-center justify-center text-mono-500 dark:text-mono-400 font-black text-xs uppercase shrink-0 shadow-sm border border-black/5 dark:border-white/5 overflow-hidden">
                            {avatarUrl && avatarUrl !== 'default' ? (
                              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                            ) : (
                              name.charAt(0)
                            )}
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="font-sans font-medium text-mono-900 dark:text-mono-100 text-[12px]">
                              {isMeReaction ? 'تو' : name}
                            </span>
                            {isMeReaction && (
                              <span className="text-[10px] text-mono-500 dark:text-mono-400 mt-0.5">
                                ژێببە
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-6 h-6 flex items-center justify-center text-[15px]">
                          {emoji}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}


