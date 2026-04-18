import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useGame } from '../context/GameContext';
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

function MessageContextMenu({ m, x, y, isMe, onReact, onReply, onCopy, onClose }) {
  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        className="relative z-10 w-full max-w-[280px]"
        style={{ 
          position: 'fixed',
          top: Math.min(y, window.innerHeight - 300), 
          left: Math.max(20, Math.min(x - 140, window.innerWidth - 300)),
          transformOrigin: isMe ? 'bottom right' : 'bottom left'
        }}
      >
        {/* Reactions Header */}
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl mb-2 p-1.5 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          {['❤️', '😂', '👍', '🔥', '😮', '🙏'].map((emoji, idx) => (
            <motion.button 
              key={emoji}
              whileHover={{ scale: 1.3, y: -5 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.05 } }}
              onClick={() => { onReact(emoji); onClose(); }}
              className="w-10 h-10 flex items-center justify-center text-xl"
            >
              {emoji}
            </motion.button>
          ))}
        </div>

        {/* Action List */}
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl p-1 flex flex-col divide-y divide-white/5">
          <button 
            onClick={() => { onReply(m); onClose(); }}
            className="flex items-center justify-between w-full p-3.5 hover:bg-white/5 text-slate-200 transition-colors first:rounded-t-xl"
          >
            <span className="font-bold text-sm">بەرسڤدان</span>
            <span className="material-symbols-outlined text-[20px] text-slate-500">reply</span>
          </button>
          
          <button 
            onClick={() => { onCopy(m.content || m.text); onClose(); }}
            className="flex items-center justify-between w-full p-3.5 hover:bg-white/5 text-slate-200 transition-colors last:rounded-b-xl"
          >
            <span className="font-bold text-sm">ژبەرتنکرن</span>
            <span className="material-symbols-outlined text-[20px] text-slate-500">content_copy</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function MessageItem({ m, isMe, onSeen, onLongPress, currentUserId, showNickname = false }) {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView && !isMe && !m.is_read && onSeen) {
      onSeen(m.id);
    }
  }, [inView, isMe, m.id, m.is_read, onSeen]);

  const bind = useLongPress((e) => {
    triggerHaptic(20);
    const rect = e.target.closest('.message-bubble')?.getBoundingClientRect();
    onLongPress(m, rect?.left + rect?.width/2, rect?.top);
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex flex-col ${isMe ? 'items-start' : 'items-end'} group max-w-full`}
    >
      {showNickname && (
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{m.user_nickname || 'یاریکەر'}</span>
        </div>
      )}

      {/* Quoted Message (Reply) */}
      {m.reply_to_text && (
        <div className={`mb-1 max-w-[70%] text-[10px] p-2 rounded-xl bg-white/5 border-r-4 border-primary/40 text-white/50 italic line-clamp-1 truncate ${isMe ? 'mr-2' : 'ml-2'}`}>
          {m.reply_to_text}
        </div>
      )}

      <div className={`relative max-w-[85%] flex items-center gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="relative group/bubble flex flex-col items-end">
          <div
            {...bind}
            className={`message-bubble px-4 py-2.5 rounded-2xl text-sm font-bold font-rabar break-words whitespace-pre-wrap transition-all relative cursor-pointer active:scale-[0.98] select-none shadow-sm ${isMe ? 'rounded-tr-none text-white' : 'bg-[#1e293b]/95 text-slate-100 rounded-tl-none border border-white/5'}`}
            style={isMe ? { backgroundColor: '#0284c7', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.2)' } : {}}
          >
            {m.content || m.text}
            
            <div className="flex items-center justify-end gap-1 mt-1">
              <div className={`text-[8px] font-black opacity-60 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                {new Date(m.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </div>
              {isMe && (
                <div className="flex items-center">
                  {m.is_read ? (
                    <span className="material-symbols-outlined text-[14px] text-blue-500 font-bold" style={{ fontSize: '14px' }}>done_all</span>
                  ) : m.id?.startsWith?.('temp-') ? (
                    <span className="material-symbols-outlined text-[14px] text-slate-500 font-bold opacity-40" style={{ fontSize: '14px' }}>done</span>
                  ) : (
                    <span className="material-symbols-outlined text-[14px] text-slate-500 font-bold" style={{ fontSize: '14px' }}>done_all</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Reactions Display - Transparent */}
          {m.reactions && Object.keys(m.reactions).length > 0 && (
            <div className={`flex flex-wrap gap-2 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
              {Object.entries(m.reactions).map(([emoji, users]) => (
                <div
                  key={emoji}
                  className={`flex items-center gap-1 text-[11px] font-black transition-all ${users.includes(currentUserId) ? 'text-primary drop-shadow-[0_0_5px_rgba(var(--primary-rgb),0.5)]' : 'text-slate-400/80'}`}
                >
                  <span>{emoji}</span>
                  <span className={users.includes(currentUserId) ? 'opacity-100' : 'opacity-60'}>{users.length}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}


export default function SocialHubView({
  user,
  onBack,
  initialChatPartner = null,
  initialTab = null,
  onViewMessages,
  onViewFriends,
  onKeyboardToggle
}) {
  const { userNickname, playNotifSound, playTabSound, playBubblePopSound, handleToggleBlock: toggleBlockInContext } = useGame();
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
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [pendingSentIds, setPendingSentIds] = useState(new Set());
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [newGlobalCount, setNewGlobalCount] = useState(0);
  const typingTimeoutRef = useRef(null);
  const typingChannelRef = useRef(null);
  const scrollRef = useRef(null);

  const fetchGlobalMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, content, user_id, user_nickname, created_at, reply_to_id, reply_to_text, reactions')
        .is('receiver_id', null)
        .order('created_at', { ascending: true })
        .limit(500);
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.warn("Global fetch error:", err);
    } finally {
      if (activeTab === 'global') setLoading(false);
    }
  }, [activeTab]);

  const fetchFriendsData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data: friendships, error: fError } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_id.eq.${user?.id},friend_id.eq.${user?.id}`);
      if (fError) throw fError;
      const profileIds = new Set();
      friendships.forEach(f => { profileIds.add(f.user_id); profileIds.add(f.friend_id); });
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url, updated_at')
        .in('id', Array.from(profileIds));
      if (pError) throw pError;
      const profileMap = profiles.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
      const uniqueRelationships = new Map();
      friendships.forEach(f => {
        const otherId = f.user_id === user?.id ? f.friend_id : f.user_id;
        const profile = profileMap[otherId];
        if (!profile) return;
        const existing = uniqueRelationships.get(otherId);
        if (!existing || f.status === 'accepted' || (f.status === 'pending' && f.friend_id === user?.id && existing.status !== 'accepted')) {
          uniqueRelationships.set(otherId, { ...f, friendData: profile });
        }
      });
      const requests = [];
      const accepted = [];
      const sentPendingList = new Set();
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
      console.warn("Friendships fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchPrivateConversations = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`user_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .not('receiver_id', 'is', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const unread = data.filter(m => m.receiver_id === user?.id && !m.is_read).length;
      setUnreadMessageCount(unread);
      const convosMap = new Map();
      data.forEach(m => {
        const partnerId = m.user_id == user?.id ? m.receiver_id : m.user_id;
        if (!convosMap.has(partnerId)) {
          convosMap.set(partnerId, { lastMsg: m.content, time: m.created_at, partnerId });
        }
      });
      const partnerIds = Array.from(convosMap.keys());
      if (partnerIds.length === 0) { setPrivateChats([]); return; }
      const { data: profiles } = await supabase.from('profiles').select('id, nickname, avatar_url, updated_at').in('id', partnerIds);
      const enriched = (profiles || []).map(p => ({ ...p, ...convosMap.get(p.id) })).sort((a, b) => new Date(b.time) - new Date(a.time));
      setPrivateChats(enriched);
    } catch (err) {
      console.warn("Private convo fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchPrivateChatHistory = useCallback(async (partnerId) => {
    if (!user?.id || !partnerId) return;
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
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const globalSub = supabase.channel('public:messages:global').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'receiver_id=is.null' }, (payload) => {
      if (payload.new.user_id !== user?.id) {
        playNotifSound();
        if (activeTab !== 'global') setNewGlobalCount(prev => prev + 1);
      }
      fetchGlobalMessages();
    }).subscribe();
    const socialSub = supabase.channel('public:friendships').on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => fetchFriendsData()).subscribe();
    const privateMsgSub = supabase.channel('private:messages').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
      const isPrivate = payload.new.receiver_id !== null;
      const involvesMe = payload.new.user_id === user?.id || payload.new.receiver_id === user?.id;
      if (isPrivate && involvesMe) {
        if (payload.eventType === 'INSERT' && payload.new.user_id !== user?.id) {
          playNotifSound();
        }
        fetchPrivateConversations();
        if (selectedChat && (payload.new.user_id === selectedChat.id || payload.new.receiver_id === selectedChat.id)) fetchPrivateChatHistory(selectedChat.id);
      }
    }).subscribe();
    const typingChannel = supabase.channel(`typing-${user?.id}`).on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (selectedChat && payload.sender_id === selectedChat.id) setPartnerIsTyping(true);
    }).on('broadcast', { event: 'stop' }, ({ payload }) => {
      if (selectedChat && payload.sender_id === selectedChat.id) setPartnerIsTyping(false);
    }).subscribe();
    typingChannelRef.current = typingChannel;
    return () => {
      supabase.removeChannel(globalSub);
      supabase.removeChannel(socialSub);
      supabase.removeChannel(privateMsgSub);
      supabase.removeChannel(typingChannel);
    };
  }, [user?.id, selectedChat, activeTab, fetchGlobalMessages, fetchFriendsData, fetchPrivateConversations, fetchPrivateChatHistory, playNotifSound]);

  useEffect(() => {
    fetchGlobalMessages();
    fetchFriendsData();
    fetchPrivateConversations();
    const statusInterval = setInterval(fetchFriendsData, 60000);
    return () => clearInterval(statusInterval);
  }, [user?.id, fetchGlobalMessages, fetchFriendsData, fetchPrivateConversations]);

  useEffect(() => {
    if (activeTab === 'global') { fetchGlobalMessages(); setNewGlobalCount(0); }
    if (activeTab === 'friends') fetchFriendsData();
    if (activeTab === 'private') fetchPrivateConversations();
  }, [activeTab, fetchGlobalMessages, fetchFriendsData, fetchPrivateConversations]);

  useEffect(() => {
    setPartnerIsTyping(false);
    if (selectedChat) fetchPrivateChatHistory(selectedChat.id);
  }, [selectedChat, fetchPrivateChatHistory]);

  useEffect(() => {
    if (activeTab === 'global' || selectedChat) {
      // Immediate scroll for new messages, smooth for tab switches
      const behavior = (messages.length > 0 || chatMessages.length > 0) ? 'auto' : 'smooth';
      scrollRef.current?.scrollIntoView({ behavior, block: 'end' });
    }
  }, [messages.length, chatMessages.length, activeTab, selectedChat]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearchPlayers = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const { data, error } = await supabase.from('profiles').select('id, nickname, avatar_url, updated_at').ilike('nickname', `%${query}%`).neq('id', user?.id).limit(10);
      if (error) throw error;
      setSearchResults(data || []);
    } catch (err) { console.error("Search error:", err); } finally { setSearching(false); }
  };

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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id) return;

    const msgContent = newMessage.trim();
    const currentUserId = user?.id;
    triggerHaptic(15);

    // Clear input immediately for better UX
    setNewMessage('');

    try {
      if (activeTab === 'global') {
        const payload = {
          content: msgContent,
          user_id: currentUserId,
          user_nickname: userNickname || 'یاریزان',
          reply_to_id: replyingTo?.id,
          reply_to_text: replyingTo?.content || replyingTo?.text
        };

        // Optimistic update for Global
        setMessages(prev => [...prev, { ...payload, created_at: new Date().toISOString(), id: 'temp-' + Date.now() }]);
        setReplyingTo(null); // Clear reply state

        const { error } = await supabase.from('messages').insert([{
          ...payload,
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
      alert(`ئاریشەیەک د ھنارتنا نامەیێ دا ھەبوو:\n\nMessage: ${errorMsg}\nCode: ${errorCode}\n\nتکایە دڵنیابە کو دەستھەڵاتێن Supabase دروستن.`);
      // On failure, we could restore the message to the box
      setNewMessage(msgContent);
    }
  };

  const handleReact = async (msgId, emoji, isPrivate = false) => {
    if (!user?.id) return;
    triggerHaptic(10);
    const table = 'messages';
    
    // Optimistic UI update
    const updateLocalState = (prev) => prev.map(m => {
      if (m.id === msgId) {
        const reactions = { ...(m.reactions || {}) };
        const users = [...(reactions[emoji] || [])];
        const idx = users.indexOf(user?.id);
        if (idx > -1) users.splice(idx, 1);
        else users.push(user?.id);
        
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
      const userIndex = users.indexOf(user?.id);
      
      if (userIndex > -1) users.splice(userIndex, 1);
      else users.push(user?.id);
      
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
    <div className="flex flex-col h-full bg-[#0f172a] text-white overflow-hidden" dir="rtl">
      {/* Header - Social Center Branding */}
      <div
        className="px-4 pb-4 flex items-center justify-center border-b border-white/5 bg-[#1e293b]"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
      >
        <h2 className="text-xl font-black font-rabar text-slate-300">ناڤەندا جڤاکی</h2>
      </div>

      {/* Tabs - Sharp Segmented Style with Shadow */}
      <div className="px-4 py-3">
        <div className="flex p-1 bg-slate-300 rounded-sm relative shadow-2xl shadow-black/60">
          {[
            { id: 'global', label: 'جیھانی', icon: 'public', badge: newGlobalCount },
            { id: 'private', label: 'نامە', icon: 'chat', badge: unreadMessageCount },
            { id: 'friends', label: 'ھەڤال', icon: 'group', badge: pendingRequests.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { 
                triggerHaptic(10); 
                playBubblePopSound();
                setActiveTab(tab.id); 
                setSelectedChat(null); 
              }}
              className={`flex-1 py-2.5 rounded-sm flex items-center justify-center gap-2 transition-all relative z-10 ${activeTab === tab.id ? 'text-white font-black' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span className="text-xs font-black">{tab.label}</span>
              {tab.badge > 0 && (
                <span className="absolute -top-1 right-2 min-w-[16px] h-4 bg-red-500 rounded-full border border-white/20 flex items-center justify-center px-1 shadow-lg ring-2 ring-slate-300">
                  <span className="text-[10px] text-white font-black leading-none">
                    {toKuDigits(tab.badge > 99 ? '99+' : tab.badge)}
                  </span>
                </span>
              )}
            </button>
          ))}
          {/* Sliding Active Background - Sharp Edges */}
          <div
            className="absolute top-1 bottom-1 transition-all duration-300 ease-out bg-[#1e293b] rounded-sm z-0"
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
          <div className="absolute inset-0 flex items-center justify-center bg-[#0f172a] z-10">
            <div className="w-10 h-10 border-4 border-slate-800 border-t-slate-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Global Chat View */}
        {activeTab === 'global' && (
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
            style={{ 
              backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url('/chat_wallpaper.png')",
              backgroundRepeat: 'repeat',
              backgroundSize: '400px',
              backgroundAttachment: 'local'
            }}
          >
            <AnimatePresence initial={false}>
              {messages.map((m, idx) => (
                <MessageItem
                  key={m.id || idx}
                  m={m}
                  isMe={m.user_id === user?.id}
                  currentUserId={user?.id}
                  showNickname={true}
                  onLongPress={(msg, x, y) => setActiveContextMenu({ message: msg, x, y, isPrivate: false })}
                />
              ))}
            </AnimatePresence>
            <div ref={scrollRef} className="h-4" />
          </div>
        )}

        {/* Friends View - Scrollable */}
        {activeTab === 'friends' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
            <div className="relative group">
              <span className="material-symbols-outlined absolute right-3 top-3.5 text-slate-500">search</span>
              <input
                type="text"
                placeholder="گەڕیان ل ھەڤالێن نوو..."
                value={searchQuery}
                onChange={(e) => handleSearchPlayers(e.target.value)}
                className="w-full bg-[#1e294b]/20 border border-white/5 rounded-2xl py-3.5 pr-11 pl-4 text-sm font-bold font-rabar focus:border-slate-500 outline-none transition-none"
              />
              {searching && <div className="absolute left-4 top-4 w-4 h-4 border-2 border-slate-700 border-t-slate-300 rounded-full animate-spin" />}
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3 p-3 bg-[#1e293b]/50 rounded-2xl border border-white/5">
                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">ئەنجامێن ئەڤێ ھاتینە دیتن</h3>
                {searchResults.map(res => {
                  const isFriend = friends.some(f => f.friend?.id === res.id);
                  const isPending = pendingRequests.some(r => r.sender?.id === res.id || r.friend_id === res.id);
                  
                  return (
                    <div key={res.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-none group cursor-pointer">
                      <div className="flex items-center gap-3 flex-1" onClick={() => { triggerHaptic(10); setSelectedPlayer(res); }}>
                        <Avatar src={res.avatar_url} lastActive={res.updated_at} showStatus={true} size="sm" />
                        <div className="flex-1 text-right">
                          <div className="font-black text-sm group-hover:text-primary transition-colors">{res.nickname}</div>
                        </div>
                      </div>
                      
                      {isFriend ? (
                        <div className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg font-black text-[10px] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                          ھوین ھەڤالن
                        </div>
                      ) : (isPending || pendingSentIds.has(res.id)) ? (
                        <div className="px-3 py-1.5 bg-slate-800 text-slate-400 border border-white/5 rounded-full font-black text-[10px] opacity-50 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
                          چاڤەڕێبە
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAddFriend(res.id); }} 
                          className="px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-full font-black text-[10px] flex items-center gap-1 hover:bg-emerald-400 active:scale-95 transition-all"
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
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">داخوازێن ھەڤالینیێ</h3>
                {pendingRequests.map(req => (
                  <div key={req.id} className="flex items-center gap-3 p-3 bg-[#1e293b] rounded-2xl border border-white/5">
                    <Avatar src={req.sender?.avatar_url} lastActive={req.sender?.updated_at} showStatus={true} size="sm" />
                    <div className="flex-1 text-right">
                      <div className="font-black text-sm">{req.sender?.nickname}</div>
                    </div>
                    <button onClick={() => handleAcceptRequest(req.id)} className="px-4 py-2 bg-slate-700 text-white rounded-xl font-black text-xs">پەژراندن</button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase text-slate-600 tracking-widest px-2">ھەڤالێن تە</h3>
              {friends
                .sort((a, b) => {
                  const activeA = new Date(a.friend?.updated_at || 0);
                  const activeB = new Date(b.friend?.updated_at || 0);
                  const isOnlineA = (new Date() - activeA) < 3 * 60 * 1000;
                  const isOnlineB = (new Date() - activeB) < 3 * 60 * 1000;
                  if (isOnlineA && !isOnlineB) return -1;
                  if (!isOnlineA && isOnlineB) return 1;
                  return activeB - activeA; // Secondary sort by last active
                })
                .map(f => (
                <div key={f.id} className="flex items-center gap-3 p-3 bg-[#1e293b] rounded-2xl border border-white/5 group">
                  <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => { triggerHaptic(10); playBubblePopSound(); setSelectedPlayer(f.friend); }}>
                    <Avatar src={f.friend?.avatar_url} lastActive={f.friend?.updated_at} showStatus={true} size="sm" />
                    <div className="flex-1 text-right">
                      <div className="font-black text-sm group-hover:text-primary transition-colors">{f.friend?.nickname}</div>
                    </div>
                  </div>
                  <button onClick={() => { triggerHaptic(10); playBubblePopSound(); setActiveTab('private'); setSelectedChat(f.friend); }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-primary hover:text-slate-950 transition-all">
                    <span className="material-symbols-outlined text-xl">chat</span>
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
              <div className="flex-1 flex flex-col overflow-hidden bg-[#0f172a]">
                <div className="shrink-0 p-3 bg-[#1e293b] border-b border-white/5 flex items-center gap-3 shadow-lg z-10">
                  <button onClick={() => { playBubblePopSound(); setSelectedChat(null); }} className="material-symbols-outlined text-white/40">arrow_back</button>
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => { triggerHaptic(10); playBubblePopSound(); setSelectedPlayer(selectedChat); }}>
                    <Avatar src={selectedChat.avatar_url} lastActive={selectedChat.updated_at} showStatus={true} size="sm" />
                    <span className="font-black text-sm hover:text-primary transition-colors">{selectedChat.nickname}</span>
                  </div>
                </div>
                <div 
                  className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
                  style={{ 
                    backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url('/chat_wallpaper.png')",
                    backgroundRepeat: 'repeat',
                    backgroundSize: '400px',
                    backgroundAttachment: 'local'
                  }}
                >
                  {chatMessages.map((m, idx) => (
                    <MessageItem 
                      key={m.id || idx}
                      m={m}
                      isMe={m.user_id === user?.id}
                      currentUserId={user?.id}
                      onSeen={async (id) => {
                        if (m.user_id !== user?.id && !m.is_read) {
                          await supabase
                            .from('messages')
                            .update({ is_read: true })
                            .eq('id', id);
                        }
                      }}
                      onLongPress={(msg, x, y) => setActiveContextMenu({ message: msg, x, y, isPrivate: true })}
                    />
                  ))}
                  
                  {partnerIsTyping && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, x: -10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      className="flex items-center gap-2 mb-4"
                    >
                      <div className="bg-slate-800/80 px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                        </div>
                        <span className="text-[10px] font-black text-slate-400">دنڤیسیت...</span>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={scrollRef} className="h-4" />
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {privateChats.length === 0 && !loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-40 space-y-4">
                    <span className="material-symbols-outlined text-6xl">forum</span>
                    <div className="text-center">
                      <div className="font-black text-lg">ھیچ نامەیەک نینە</div>
                      <div className="text-xs font-bold font-rabar">دەستپێبکە ب نڤێسینا نامەیەکێ بۆ ھەڤالێن خۆ</div>
                    </div>
                    <button
                      onClick={() => setActiveTab('friends')}
                      className="px-6 py-2 bg-[#0a192f] rounded-xl text-xs font-black border border-white/5"
                    >
                      دیتنا ھەڤالان
                    </button>
                  </div>
                ) : (
                  privateChats.map(chat => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className="flex items-center justify-between gap-4 p-3 bg-slate-200 rounded-[12px] border border-white/10 hover:bg-slate-300 cursor-pointer transition-all group relative active:scale-[0.98]"
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
                          <span className="font-black text-sm text-slate-900 group-hover:text-primary transition-colors truncate w-full text-left">
                            {chat.nickname}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs font-bold font-rabar text-slate-600 opacity-80 w-full justify-start">
                            <span className="material-symbols-outlined text-[14px]">chat</span>
                            <span className="truncate">{chat.lastMsg || 'نامەک ل ڤێرێیە'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Time and Indicator */}
                      <div className="flex flex-col items-end justify-center min-w-[50px] pr-1">
                        <span className="text-[10px] font-bold text-slate-500 opacity-80 mb-1">
                          {new Date(chat.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {chat.unreadCount > 0 && (
                          <div className="w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
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
          />
        )}
      </AnimatePresence>

      {/* Copy Success Toast */}
      <AnimatePresence>
        {showCopySuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-200 bg-emerald-500 text-white px-4 py-2 rounded-full text-xs font-black shadow-xl flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">check_circle</span>
            ھاتە ژبەرتنکرن
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area - WhatsApp Pill Style Swapped */}
      {(activeTab === 'global' || selectedChat) && (
        <div className="bg-slate-950 border-t border-white/5 relative z-[45]">
          {/* Reply Preview Box */}
          <AnimatePresence>
            {replyingTo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 py-2 bg-slate-900/80 border-b border-white/5 flex items-center justify-between gap-3 overflow-"
              >
                <div className="flex-1 min-w-0 border-r-4 border-primary/50 pr-3 py-1">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">بەرسڤدانا نامەیێ</p>
                  <p className="text-xs text-slate-400 truncate">{replyingTo.content || replyingTo.text}</p>
                </div>
                <button
                  onClick={() => { playBubblePopSound(); setReplyingTo(null); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-3 pb-6 flex gap-2 items-center">
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`w-11 h-11 flex items-center justify-center rounded-full transition-all shadow-lg shrink-0 ${newMessage.trim() ? 'bg-[#00a884] text-white scale-100' : 'bg-slate-800 text-slate-500 opacity-50 scale-95'}`}
              title="ھنارتن"
            >
              <span className="material-symbols-outlined font-black text-xl">send</span>
            </button>
            <textarea
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
              className="flex-1 bg-slate-800/80 border-none rounded-2xl px-5 py-3 text-sm font-bold font-rabar focus:ring-1 focus:ring-white/10 transition-none outline-none resize-none overflow-y-auto no-scrollbar text-slate-200"
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
              <motion.div 
                animate={{ 
                  width: [40, 50, 40],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="h-1.5 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                style={{ width: '45px' }}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
