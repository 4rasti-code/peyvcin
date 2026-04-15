import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useGame } from '../context/GameContext';
import { triggerHaptic } from '../utils/haptics';
import Avatar from './Avatar';
import FlagBadge from './FlagBadge';
import PublicProfileModal from './PublicProfileModal';
import { useInView } from 'react-intersection-observer';

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
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4">
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
            className={`message-bubble px-4 py-2.5 rounded-2xl text-sm font-bold font-rabar break-words whitespace-pre-wrap transition-all relative cursor-pointer active:scale-[0.98] select-none ${isMe ? 'rounded-tr-none text-[#0f172a] border border-white/10' : 'bg-[#1e293b] text-slate-300 rounded-tl-none font-black opacity-90 shadow-md'}`}
            style={isMe ? { backgroundColor: 'rgb(203, 213, 225)' } : {}}
          >
            {m.content || m.text}
            
            <div className="flex items-center justify-end gap-1 mt-1">
              <div className={`text-[8px] font-black opacity-40 ${isMe ? 'text-slate-900' : 'text-slate-400'}`}>
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
  const { userNickname } = useGame();
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
  const [activeContextMenu, setActiveContextMenu] = useState(null); // { message, x, y, isPrivate }
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const typingTimeoutRef = useRef(null);
  const typingChannelRef = useRef(null);
  const scrollRef = useRef(null);

  // --- Realtime Listeners ---
  useEffect(() => {
    if (!user?.id) return;

    const globalSub = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchGlobalMessages();
      })
      .subscribe();

    const socialSub = supabase
      .channel('public:friendships')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friendships'
      }, () => fetchFriendsData())
      .subscribe();

    const privateMsgSub = supabase
      .channel('public:private_messages')
      .on('postgres_changes', {
        event: '*', 
        schema: 'public',
        table: 'private_messages'
      }, (payload) => {
        if (payload.new.sender_id === user.id || payload.new.recipient_id === user.id) {
          fetchPrivateConversations();
          if (selectedChat && (payload.new.sender_id === selectedChat.id || payload.new.recipient_id === selectedChat.id)) {
            fetchPrivateChatHistory(selectedChat.id);
          }
        }
      })
      .subscribe();

    // typing-status channel
    const typingChannel = supabase.channel(`typing-${user.id}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (selectedChat && payload.sender_id === selectedChat.id) {
          setPartnerIsTyping(true);
        }
      })
      .on('broadcast', { event: 'stop' }, ({ payload }) => {
        if (selectedChat && payload.sender_id === selectedChat.id) {
          setPartnerIsTyping(false);
        }
      })
      .subscribe();
    
    typingChannelRef.current = typingChannel;

    return () => {
      supabase.removeChannel(globalSub);
      supabase.removeChannel(socialSub);
      supabase.removeChannel(privateMsgSub);
      supabase.removeChannel(typingChannel);
      typingChannelRef.current = null;
    };
  }, [user?.id, selectedChat]);

  useEffect(() => {
    fetchGlobalMessages();
    fetchFriendsData(); // Pre-load friends for correct status checks
    fetchPrivateConversations();

    const statusInterval = setInterval(() => {
      fetchFriendsData();
    }, 60000);

    return () => clearInterval(statusInterval);
  }, [user?.id]);

  useEffect(() => {
    if (activeTab === 'global') fetchGlobalMessages();
    if (activeTab === 'friends') fetchFriendsData();
    if (activeTab === 'private') fetchPrivateConversations();
  }, [activeTab]);

  useEffect(() => {
    setPartnerIsTyping(false); // Reset when switching chats
    if (selectedChat) fetchPrivateChatHistory(selectedChat.id);
  }, [selectedChat]);

  useEffect(() => {
    if (activeTab === 'global' || selectedChat) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [messages, chatMessages, activeTab, selectedChat]);

  // --- Data Fetching Logic ---

  const fetchGlobalMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, content, user_id, user_nickname, created_at, reply_to_id, reply_to_text, reactions')
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.warn("Global fetch error:", err);
    } finally {
      if (activeTab === 'global') setLoading(false);
    }
  };

  const fetchFriendsData = async () => {
    if (!user?.id) return;
    try {
      // Only set global loading if we have no friends data yet
      if (friends.length === 0 && pendingRequests.length === 0) setLoading(true);
      const { data: friendships, error: fError } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_id.eq.${user?.id},friend_id.eq.${user?.id}`);

      if (fError) throw fError;

      const profileIds = new Set();
      friendships.forEach(f => {
        profileIds.add(f.user_id);
        profileIds.add(f.friend_id);
      });

      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url, updated_at')
        .in('id', Array.from(profileIds));

      if (pError) throw pError;

      const profileMap = profiles.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

      const requests = [];
      const accepted = [];

      friendships.forEach(f => {
        const otherId = f.user_id === user?.id ? f.friend_id : f.user_id;
        const profile = profileMap[otherId];

        if (f.status === 'pending' && f.friend_id === user?.id) {
          requests.push({ ...f, sender: profileMap[f.user_id] });
        } else if (f.status === 'accepted') {
          accepted.push({ ...f, friend: profile });
        }
      });

      setPendingRequests(requests);
      setFriends(accepted);
    } catch (err) {
      console.warn("Friendships fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearchPlayers = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url, updated_at')
        .ilike('nickname', `%${query}%`)
        .neq('id', user?.id)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (friendId) => {
    try {
      triggerHaptic(15);
      const { error } = await supabase
        .from('friendships')
        .insert([{ user_id: user?.id, friend_id: friendId, status: 'pending' }]);
      if (error) throw error;
      alert("داخوازی ب سەرکەفتی هاتە هنارتن!");
      setSearchResults(p => p.filter(x => x.id !== friendId));
    } catch (err) {
      console.error("Friend request error:", err);
    }
  };

  const fetchPrivateConversations = async () => {
    if (!user?.id) return;
    try {
      // Only set global loading if we have no conversations yet
      if (privateChats.length === 0) setLoading(true);
      const { data, error } = await supabase
        .from('private_messages')
        .select('*')
        .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const convosMap = new Map();
      data.forEach(m => {
        const partnerId = m.sender_id == user?.id ? m.recipient_id : m.sender_id;
        if (!convosMap.has(partnerId)) {
          convosMap.set(partnerId, { lastMsg: m.content, time: m.created_at, partnerId });
        }
      });

      const partnerIds = Array.from(convosMap.keys());
      if (partnerIds.length === 0) {
        setPrivateChats([]);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url, updated_at')
        .in('id', partnerIds);

      const enriched = (profiles || []).map(p => ({
        ...p,
        ...convosMap.get(p.id)
      })).sort((a, b) => new Date(b.time) - new Date(a.time));

      setPrivateChats(enriched);
    } catch (err) {
      console.warn("Private convo fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrivateChatHistory = async (partnerId) => {
    if (!user?.id || !partnerId) return;
    try {
      const { data, error } = await supabase
        .from('private_messages')
        .select('id, content, sender_id, recipient_id, created_at, is_read, reactions')
        .or(`and(sender_id.eq.${user?.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user?.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setChatMessages(data || []);

      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error("Chat history fetch error:", err);
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
          setTimeout(() => supabase.removeChannel(outboundChannel), 1000);
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
    const currentUserId = user.id;
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
          sender_id: currentUserId,
          recipient_id: partnerId,
          reply_to_id: replyingTo?.id,
          reply_to_text: replyingTo?.content || replyingTo?.text,
          created_at: new Date().toISOString(),
          id: 'temp-' + Date.now()
        };
        setChatMessages(prev => [...prev, tempMsg]);
        setReplyingTo(null); // Clear reply state after sending

        const { error } = await supabase
          .from('private_messages')
          .insert([{
            content: msgContent,
            text: msgContent,
            sender_id: currentUserId,
            recipient_id: partnerId,
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
      alert(`ئاریشەیەک د هنارتنا نامەیێ دا هەبوو:\n\nMessage: ${errorMsg}\nCode: ${errorCode}\n\nتکایە دڵنیابە کو دەستهەڵاتێن Supabase دروستن.`);
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
        const idx = users.indexOf(user.id);
        if (idx > -1) users.splice(idx, 1);
        else users.push(user.id);
        
        if (users.length === 0) delete reactions[emoji];
        else reactions[emoji] = users;
        return { ...m, reactions };
      }
      return m;
    });

    if (isPrivate) setChatMessages(prev => updateLocalState(prev));
    else setMessages(prev => updateLocalState(prev));

    try {
      // Fetch message to check ownership - Only select the column that existing in the table
      const columns = isPrivate ? 'reactions, sender_id' : 'reactions, user_id';
      const { data: msg, error: fetchError } = await supabase.from(table).select(columns).eq('id', msgId).single();
      if (fetchError) throw fetchError;

      // Prevent reacting to own messages
      const ownerId = isPrivate ? msg.sender_id : msg.user_id;
      if (ownerId === user.id) {
        console.warn("You cannot react to your own message.");
        // Revert optimistic UI
        if (isPrivate) setChatMessages(prev => updateLocalState(prev));
        else setMessages(prev => updateLocalState(prev));
        return;
      }

      let reactions = msg?.reactions || {};
      const users = reactions[emoji] || [];
      const userIndex = users.indexOf(user.id);
      
      if (userIndex > -1) users.splice(userIndex, 1);
      else users.push(user.id);
      
      if (users.length === 0) delete reactions[emoji];
      else reactions[emoji] = users;
      
      await supabase.from(table).update({ reactions }).eq('id', msgId);
    } catch (err) {
      console.error("Database sync failed for reaction:", err);
      // Revert is handled by the next realtime sync/fetch
    }
  };

  const { handleToggleBlock: toggleBlockInContext } = useGame();

  const handleToggleBlock = async (currentStatus) => {
    if (!selectedPlayer || !user?.id) return;
    const success = await toggleBlockInContext(selectedPlayer.id, currentStatus);
    if (success) {
      if (!currentStatus) alert("یاریزان هاتە بلۆککرن!");
      else alert("بلۆک هاتە لابرن!");
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
            { id: 'global', label: 'جیهانی', icon: 'public' },
            { id: 'private', label: 'نامە', icon: 'chat' },
            { id: 'friends', label: 'هەڤال', icon: 'group', badge: pendingRequests.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { triggerHaptic(10); setActiveTab(tab.id); setSelectedChat(null); }}
              className={`flex-1 py-2.5 rounded-sm flex items-center justify-center gap-2 transition-all relative z-10 ${activeTab === tab.id ? 'text-white font-black' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span className="text-xs font-black">{tab.label}</span>
              {tab.badge > 0 && (
                <span className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-none border border-slate-300" />
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative no-scrollbar">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0f172a] z-10">
            <div className="w-10 h-10 border-4 border-slate-800 border-t-slate-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Global Chat View */}
        {activeTab === 'global' && (
          <div className="p-4 space-y-4">
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
            <div ref={scrollRef} />
          </div>
        )}

        {/* Friends View - Muted Slate */}
        {activeTab === 'friends' && (
          <div className="p-4 space-y-6">
            <div className="relative group">
              <span className="material-symbols-outlined absolute right-3 top-3.5 text-slate-500">search</span>
              <input
                type="text"
                placeholder="گەڕیان ل هەڤالێن نوو..."
                value={searchQuery}
                onChange={(e) => handleSearchPlayers(e.target.value)}
                className="w-full bg-[#1e294b]/20 border border-white/5 rounded-2xl py-3.5 pr-11 pl-4 text-sm font-bold font-rabar focus:border-slate-500 outline-none transition-none"
              />
              {searching && <div className="absolute left-4 top-4 w-4 h-4 border-2 border-slate-700 border-t-slate-300 rounded-full animate-spin" />}
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3 p-3 bg-[#1e293b]/50 rounded-2xl border border-white/5">
                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">ئەنجامێن ئەڤێ هاتینە دیتن</h3>
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
                          هەڤال
                        </div>
                      ) : isPending ? (
                        <div className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg font-black text-[10px]">داخوازی یا هاتییە هنارتن</div>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAddFriend(res.id); }} 
                          className="px-3 py-1.5 bg-slate-700 text-white rounded-lg font-black text-[10px]"
                        >
                          زێدە بکە
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {pendingRequests.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">داخوازێن هەڤالینیێ</h3>
                {pendingRequests.map(req => (
                  <div key={req.id} className="flex items-center gap-3 p-3 bg-[#1e293b] rounded-2xl border border-white/5">
                    <Avatar src={req.sender?.avatar_url} lastActive={req.sender?.updated_at} showStatus={true} size="sm" />
                    <div className="flex-1 text-right">
                      <div className="font-black text-sm">{req.sender?.nickname}</div>
                    </div>
                    <button onClick={() => handleAcceptRequest(req.id)} className="px-4 py-2 bg-slate-700 text-white rounded-xl font-black text-xs">قەبوولکرن</button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase text-slate-600 tracking-widest px-2">هەڤالێن تە</h3>
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
                  <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => { triggerHaptic(10); setSelectedPlayer(f.friend); }}>
                    <Avatar src={f.friend?.avatar_url} lastActive={f.friend?.updated_at} showStatus={true} size="sm" />
                    <div className="flex-1 text-right">
                      <div className="font-black text-sm group-hover:text-primary transition-colors">{f.friend?.nickname}</div>
                    </div>
                  </div>
                  <button onClick={() => { triggerHaptic(10); setActiveTab('private'); setSelectedChat(f.friend); }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-primary hover:text-slate-950 transition-all">
                    <span className="material-symbols-outlined text-xl">chat</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Private Chat View - Muted Restore */}
        {activeTab === 'private' && (
          <div className="h-full flex flex-col">
            {selectedChat ? (
              <div className="flex-1 flex flex-col h-full bg-[#0f172a]">
                <div className="p-3 bg-[#1e293b] border-b border-white/5 flex items-center gap-3">
                  <button onClick={() => setSelectedChat(null)} className="material-symbols-outlined text-white/40">arrow_back</button>
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => { triggerHaptic(10); setSelectedPlayer(selectedChat); }}>
                    <Avatar src={selectedChat.avatar_url} lastActive={selectedChat.updated_at} showStatus={true} size="sm" />
                    <span className="font-black text-sm hover:text-primary transition-colors">{selectedChat.nickname}</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                  {chatMessages.map((m, idx) => (
                    <MessageItem 
                      key={m.id || idx}
                      m={m}
                      isMe={m.sender_id === user?.id}
                      currentUserId={user?.id}
                      onSeen={async (id) => {
                        if (m.sender_id !== user?.id && !m.is_read) {
                          await supabase
                            .from('private_messages')
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
                  
                  <div ref={scrollRef} />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col p-4 space-y-3">
                {privateChats.length === 0 && !loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-40 space-y-4">
                    <span className="material-symbols-outlined text-6xl">forum</span>
                    <div className="text-center">
                      <div className="font-black text-lg">هیچ نامەیەک نینە</div>
                      <div className="text-xs font-bold font-rabar">دەستپێبکە ب نڤێسینا نامەیەکێ بۆ هەڤالێن خۆ</div>
                    </div>
                    <button
                      onClick={() => setActiveTab('friends')}
                      className="px-6 py-2 bg-[#0a192f] rounded-xl text-xs font-black border border-white/5"
                    >
                      دیتنا هەڤالان
                    </button>
                  </div>
                ) : (
                  privateChats.map(chat => (
                    <div
                      key={chat.id}
                      className="flex items-center gap-4 p-4 bg-[#0a192f] rounded-2xl border border-white/5 hover:bg-[#0f2a4a] cursor-pointer transition-none group"
                    >
                      <div className="flex items-center gap-3 flex-1 overflow-hidden" onClick={() => setSelectedChat(chat)}>
                        <div onClick={(e) => { e.stopPropagation(); triggerHaptic(10); setSelectedPlayer(chat); }}>
                          <Avatar src={chat.avatar_url} lastActive={chat.updated_at} showStatus={true} size="md" />
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[10px] font-black text-slate-500">
                              {new Date(chat.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="font-black text-sm truncate ml-2 group-hover:text-primary transition-colors">{chat.nickname}</span>
                          </div>
                          <div className="text-xs font-bold font-rabar text-slate-400 truncate opacity-70">
                            {chat.lastMsg || 'نامەک ل ڤێرێیە'}
                          </div>
                        </div>
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
            isMe={activeContextMenu.message.sender_id === user?.id || activeContextMenu.message.user_id === user?.id}
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
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[200] bg-emerald-500 text-white px-4 py-2 rounded-full text-xs font-black shadow-xl flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">check_circle</span>
            هاتە ژبەرتنکرن
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
                className="px-4 py-2 bg-slate-900/80 border-b border-white/5 flex items-center justify-between gap-3 overflow-hidden"
              >
                <div className="flex-1 min-w-0 border-r-4 border-primary/50 pr-3 py-1">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">بەرسڤدانا نامەیێ</p>
                  <p className="text-xs text-slate-400 truncate">{replyingTo.content || replyingTo.text}</p>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-3 pb-8 flex gap-2 items-center">
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`w-11 h-11 flex items-center justify-center rounded-full transition-all shadow-lg shrink-0 ${newMessage.trim() ? 'bg-[#00a884] text-white scale-100' : 'bg-slate-800 text-slate-500 opacity-50 scale-95'}`}
              title="هنارتن"
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
        </div>
      )}
    </div>
  );
}
