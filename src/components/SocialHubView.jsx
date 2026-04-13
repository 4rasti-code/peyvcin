import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { triggerHaptic } from '../utils/haptics';
import Avatar from './Avatar';
import FlagBadge from './FlagBadge';
import { AVATARS, DEFAULT_AVATAR } from '../data/avatars';
import { toKuDigits } from '../utils/formatters';
import PublicProfileModal from './PublicProfileModal';

export default function SocialHubView({ 
  user, 
  onBack, 
  countryCode, 
  initialChatPartner = null,
  initialTab = null,
  onViewMessages,
  onViewFriends 
}) {
  const [activeTab, setActiveTab] = useState(initialTab || (initialChatPartner ? 'private' : 'global')); // 'global', 'private', 'friends'
  const [messages, setMessages] = useState([]);
  const [privateChats, setPrivateChats] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedChat, setSelectedChat] = useState(initialChatPartner);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [blockedIds, setBlockedIds] = useState([]);
  const [searchNickname, setSearchNickname] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [viewedProfile, setViewedProfile] = useState(null);
  const scrollRef = useRef(null);

  // --- 0. NOTIFICATION CLEARING LOGIC ---
  useEffect(() => {
    if (activeTab === 'private' || selectedChat) {
      onViewMessages?.();
    }
    if (activeTab === 'friends') {
      onViewFriends?.();
    }
  }, [activeTab, selectedChat, onViewMessages, onViewFriends]);

  // --- 0.5 FETCH BLOCKS LOGIC ---
  useEffect(() => {
    const fetchBlocks = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('blocks')
        .select('*')
        .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);
      
      if (data) {
        const ids = data.map(b => b.blocker_id === user.id ? b.blocked_id : b.blocker_id);
        setBlockedIds(ids);
      }
    };
    fetchBlocks();
  }, [user]);

  const handleToggleBlock = async (targetId, currentlyBlocked) => {
    triggerHaptic(20);
    if (currentlyBlocked) {
      await supabase.from('blocks').delete().eq('blocker_id', user.id).eq('blocked_id', targetId);
      setBlockedIds(prev => prev.filter(id => id !== targetId));
    } else {
      await supabase.from('blocks').insert({ blocker_id: user.id, blocked_id: targetId });
      setBlockedIds(prev => [...prev, targetId]);
      if (selectedChat?.id === targetId) setSelectedChat(null);
      // Remove any pending friendships visually just in case
      setFriends(prev => prev.filter(f => f.partner.id !== targetId));
      setPendingRequests(prev => prev.filter(p => p.sender?.id !== targetId));
    }
  };

  // --- 1. GLOBAL CHAT LOGIC ---
  useEffect(() => {
    if (activeTab === 'global') {
      fetchGlobalMessages();
      const channel = supabase
        .channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
          fetchGlobalMessages();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [activeTab]);

  const fetchGlobalMessages = async () => {
    // We query the VIEW instead of the table for automatic profile joining
    const { data, error } = await supabase
      .from('global_chat_v')
      .select('*')
      .limit(50);
    
    if (!error) {
      setMessages(data || []);
    }
    setLoading(false);
  };

  // --- 2. GLOBAL SOCIAL OBSERVER (Real-time Notifs) ---
  useEffect(() => {
    if (!user?.id) return;

    // Initial fetch for background state (counts)
    fetchPrivateConversations();
    fetchFriendsData();

    // Listen for NEW private messages or friendship requests
    const socialSub = supabase
      .channel(`social_sync:${user.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'private_messages',
        filter: `recipient_id=eq.${user.id}`
      }, () => fetchPrivateConversations())
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'friendships',
        filter: `friend_id=eq.${user.id}`
      }, () => fetchFriendsData())
      .subscribe();

    return () => {
      supabase.removeChannel(socialSub);
    };
  }, [user?.id]);

  const fetchFriendsData = async () => {
    if (!user?.id) return;
    // Fetch pending
    const { data: pending } = await supabase
      .from('friendships')
      .select('*, sender:user_id(id, nickname, avatar_url, country_code, is_kurdistan, updated_at)')
      .eq('friend_id', user.id)
      .eq('status', 'pending');
    
    // Fetch mutuals
    const { data: mutuals } = await supabase
      .from('friendships')
      .select('*, user:user_id(id, nickname, avatar_url, updated_at), friend:friend_id(id, nickname, avatar_url, updated_at)')
      .eq('status', 'accepted')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    setPendingRequests(pending || []);
    setFriends(mutuals || []);
    if (activeTab === 'friends') setLoading(false);
  };

  const handleAcceptRequest = async (requestId) => {
    triggerHaptic(20);
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', requestId);
    if (!error) fetchFriendsData();
  };

  // --- 3. PRIVATE CHAT LOGIC ---
  // --- 3. PRIVATE CHAT HISTORY OBSERVER ---
  useEffect(() => {
    if (activeTab === 'private' && selectedChat) {
      fetchChatHistory(selectedChat.id);
      
      const chatChannel = supabase
        .channel(`chat:${user.id}:${selectedChat.id}`)
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'private_messages',
            filter: `recipient_id=eq.${user.id}`
        }, () => fetchChatHistory(selectedChat.id))
        .subscribe();

      return () => { 
        if (chatChannel) supabase.removeChannel(chatChannel);
      };
    }
  }, [activeTab, selectedChat]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, chatMessages]);

  const normalizeKurdishText = (text) => {
    if (!text) return '';
    return text.trim()
      .replace(/ك/g, 'ک')
      .replace(/[يى]/g, 'ی');
  };

  const latestSearchRef = useRef(0);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearchUsers(searchNickname);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchNickname]);

  const handleSearchUsers = async (query) => {
    const rawQuery = query.trim();
    if (!rawQuery) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const currentId = ++latestSearchRef.current;
    const safeQuery = normalizeKurdishText(rawQuery);
    setIsSearching(true);
    setSearchError(null);
    
    try {
      console.log("Search Term:", rawQuery); 

      // 1. DIRECT FETCH: select('*') and no complex local filters to ensure it talks to DB correctly.
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('nickname', rawQuery) 
        .limit(10); 
      
      console.log("Query Results:", data, "Error:", error);
      
      if (currentId !== latestSearchRef.current) return;

      if (error) {
         setSearchError(error.message || 'هەلەیەک ڕوویدا د کاتی گەڕیانێدا');
         setSearchResults([]);
         return;
      }

      if (data && data.length > 0) {
        // Exclude self only on UI render level using pure filtering
        const filteredResults = data.filter(p => p.id !== user.id);
        setSearchResults(filteredResults);
        // Removed auto-popup logic as per user request
      } else {
        setSearchResults([]);
      }
    } catch (e) {
      console.warn("Search error:", e);
      setSearchError(e.message || 'هەلەیەک ڕوویدا');
    } finally {
      if (currentId === latestSearchRef.current) setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (targetId) => {
    triggerHaptic(15);
    const { error } = await supabase
      .from('friendships')
      .insert([{ user_id: user.id, friend_id: targetId, status: 'pending' }]);
    
    if (!error) {
      setSearchResults(prev => prev.filter(r => r.id !== targetId));
      if (viewedProfile?.id === targetId) {
         // Optionally close or just update state - for now we just clear results
      }
    }
  };

  const fetchPrivateConversations = async () => {
    setLoading(true);
    // Get unique list of users you've messaged
    const { data: sent } = await supabase.from('private_messages').select('recipient_id').eq('sender_id', user.id);
    const { data: received } = await supabase.from('private_messages').select('sender_id, is_read').eq('recipient_id', user.id);
    
    const partnerIds = [...new Set([...(sent || []).map(m => m.recipient_id), ...(received || []).map(m => m.sender_id)])];
    
    if (partnerIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, nickname, avatar_url, updated_at').in('id', partnerIds);
      const enriched = (profiles || []).map(p => ({
        ...p,
        unread: (received || []).some(m => m.sender_id === p.id && !m.is_read)
      }));
      setPrivateChats(enriched);
    }
    setLoading(false);
  };

  const fetchChatHistory = async (partnerId) => {
    const { data } = await supabase
      .from('private_messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    setChatMessages(data || []);
    
    // OPTIMISTICALLY CLEAR DOT LATER: we do it now locally
    setPrivateChats(prev => prev.map(p => p.id === partnerId ? { ...p, unread: false } : p));

    // Mark as read in DB
    const { error } = await supabase
      .from('private_messages')
      .update({ is_read: true })
      .eq('sender_id', partnerId)
      .eq('recipient_id', user.id)
      .eq('is_read', false);

    if (error) console.error("Error marking messages as read:", error);

    // Notify parent and sync
    onViewMessages?.();
    setLoading(false);
  };

  const sendGlobalOrPrivateAction = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    triggerHaptic(15);
    if (activeTab === 'global') {
      await supabase.from('messages').insert([{ content: newMessage, user_id: user?.id, user_nickname: user?.nickname || 'یاریکەر' }]);
      fetchGlobalMessages();
    } else if (selectedChat) {
      await supabase.from('private_messages').insert([{ content: newMessage, sender_id: user?.id, recipient_id: selectedChat.id }]);
      fetchChatHistory(selectedChat.id);
    }
    setNewMessage('');
  };

  return (
    <div className="flex-1 w-full max-w-full mx-auto flex flex-col relative overflow-hidden bg-slate-950/20" style={{ height: 'calc(100dvh - 210px)' }}>
      
      {/* Social Header */}
      <div className="px-4 py-3 flex flex-col border-b border-white/5 bg-slate-900/40 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center justify-between mb-4">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => { triggerHaptic(10); selectedChat ? setSelectedChat(null) : onBack(); }}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"
          >
            <span className="material-symbols-outlined text-white text-2xl">arrow_forward</span>
          </motion.button>
          
          <h2 className="text-xl font-black font-rabar text-white">
            {selectedChat ? selectedChat.nickname : (activeTab === 'global' ? 'چاتا گشتی' : activeTab === 'private' ? 'نامەیێن تایبەت' : 'هەڤالێن من')}
          </h2>
          
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40">
            <span className="material-symbols-outlined text-primary text-2xl">
              {activeTab === 'global' ? 'public' : activeTab === 'private' ? 'chat' : 'group'}
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        {!selectedChat && (
          <div className="flex bg-slate-800/50 p-1 rounded-lg border border-white/5">
            {[
              { id: 'global', label: 'گشتی', icon: 'public' },
              { id: 'private', label: 'نامه', icon: 'chat', hasNotif: privateChats.some(c => c.unread) },
              { id: 'friends', label: 'هەڤال', icon: 'group', hasNotif: pendingRequests.length > 0 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { triggerHaptic(10); setActiveTab(tab.id); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md font-black font-rabar text-[13px] transition-all relative ${
                  activeTab === tab.id ? 'bg-primary text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.hasNotif && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 rounded-full border-2 border-slate-900 shadow-sm flex items-center justify-center"
                  >
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  </motion.span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 scrollbar-hide flex flex-col"
      >
        <AnimatePresence mode="wait">
          {activeTab === 'global' && (
            <motion.div key="global" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
               {messages.filter(m => !blockedIds.includes(m.user_id)).map((msg, idx) => (
                 <ChatMessage msg={msg} isMe={msg.user_id === user.id} key={msg.id || idx} />
               ))}
            </motion.div>
          )}

          {activeTab === 'friends' && (
            <motion.div key="friends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
               {/* Search People */}
               <div className="space-y-4">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-xl pointer-events-none">search</span>
                    <input 
                      type="text" 
                      placeholder="بە ل ناڤێ هەڤالەکێ بگەڕە..." 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white font-rabar font-bold focus:outline-none focus:border-primary/50 transition-all text-right"
                      value={searchNickname}
                      onChange={(e) => setSearchNickname(e.target.value)}
                    />
                  </div>

                  {/* Search Results */}
                  <AnimatePresence mode="wait">
                    {isSearching ? (
                      <div className="text-center py-10 text-white/50"><span className="material-symbols-outlined animate-spin text-3xl">loop</span></div>
                    ) : searchError ? (
                      <div className="text-center py-10 text-red-400 font-bold">{searchError}</div>
                    ) : searchResults.filter(r => !blockedIds.includes(r.id)).length === 0 && searchNickname.trim().length > 0 ? (
                      <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5">
                        <span className="material-symbols-outlined text-4xl text-white/20 mb-2">search_off</span>
                        <p className="text-white/40 font-bold">Nav tunne</p>
                      </div>
                    ) : (
                      searchResults.filter(r => !blockedIds.includes(r.id)).length > 0 && (
                        <motion.div 
                          key="results"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-white/5 border border-white/10 rounded-2xl p-2 space-y-1 overflow-hidden"
                        >
                          <h5 className="text-[9px] font-black text-white/20 uppercase tracking-widest px-3 py-1">ئەنجامێن گەڕیانێ</h5>
                          {searchResults.filter(r => !blockedIds.includes(r.id)).map(res => (
                            <motion.div 
                              key={res.id} 
                              layout
                              className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5 bg-white/[0.02]"
                            >
                              <div 
                                className="flex items-center gap-3 cursor-pointer"
                                onClick={() => { triggerHaptic(10); setViewedProfile(res); }}
                              >
                                <Avatar src={res.avatar_url} updatedAt={res.updated_at} size="sm" border={false} />
                                <div className="flex flex-col">
                                  <span className="font-bold text-white text-sm font-rabarLeadingTight">{res.nickname}</span>
                                  <span className="text-[9px] text-slate-500 font-black">ئاست {res.level || 1}</span>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleSendFriendRequest(res.id)}
                                className="text-[10px] font-black bg-primary text-slate-950 px-4 py-2 rounded-xl active:scale-90 transition-all shadow-lg"
                              >
                                زێدە بکە
                              </button>
                            </motion.div>
                          ))}
                        </motion.div>
                      )
                    )}
                  </AnimatePresence>
               </div>

               {/* Pending Requests */}
               {pendingRequests.filter(req => req.sender && !blockedIds.includes(req.sender.id)).length > 0 && (
                 <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">داخوازیێن هەڤالینیێ</h4>
                    {pendingRequests.filter(req => req.sender && !blockedIds.includes(req.sender.id)).map(req => (
                      <div key={req.id} className="bg-white/5 border border-white/5 rounded-3xl p-4 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             <Avatar src={req.sender?.avatar_url} updatedAt={req.sender?.updated_at} size="sm" border={false} />
                            <span className="font-black text-white font-rabar">{req.sender?.nickname}</span>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => handleAcceptRequest(req.id)} className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center shadow-lg"><span className="material-symbols-outlined">check</span></button>
                            <button className="w-10 h-10 rounded-xl bg-white/5 text-slate-500 flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
                         </div>
                      </div>
                    ))}
                 </div>
               )}

               {/* Friends List */}
               <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">هەڤالێن من ({friends.filter(f => !blockedIds.includes(f.user_id === user.id ? f.friend_id : f.user_id)).length})</h4>
                  {friends.filter(f => !blockedIds.includes(f.user_id === user.id ? f.friend_id : f.user_id)).length === 0 ? (
                    <div className="text-center py-12 opacity-20"><span className="material-symbols-outlined text-5xl mb-2">supervisor_account</span><p className="font-bold">چ هەڤال نینن</p></div>
                  ) : (
                    friends.filter(f => !blockedIds.includes(f.user_id === user.id ? f.friend_id : f.user_id)).map(f => {
                      const friendData = f.user_id === user.id ? f.friend : f.user;
                      return (
                        <div key={f.id} className="bg-white/5 border border-white/10 rounded-[2rem] p-3 flex items-center justify-between hover:bg-white/[0.07] transition-all">
                           {/* Profile Zone */}
                           <div 
                             onClick={() => { triggerHaptic(10); setViewedProfile(friendData); }} 
                             className="flex items-center gap-4 cursor-pointer flex-1 pl-2"
                           >
                              <Avatar src={friendData.avatar_url} updatedAt={friendData.updated_at} size="md" border={false} />
                              <span className="font-black text-lg text-white font-rabar truncate">{friendData.nickname}</span>
                           </div>
                           
                           {/* Chat Zone */}
                           <button 
                             onClick={(e) => { 
                               e.stopPropagation(); // Prevent modal from opening
                               triggerHaptic(15); 
                               setSelectedChat(friendData); 
                               setActiveTab('private'); 
                             }} 
                             className="w-12 h-12 shrink-0 bg-white/5 hover:bg-primary/20 text-white/60 hover:text-primary rounded-2xl transition-all active:scale-90 active:bg-primary/30 flex items-center justify-center group"
                           >
                              <span className="material-symbols-outlined group-active:text-primary transition-colors">chat</span>
                           </button>
                        </div>
                      );
                    })
                  )}
               </div>
            </motion.div>
          )}

          {activeTab === 'private' && (
            <motion.div key="private" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
               {selectedChat ? (
                  <div className="space-y-5">
                     {chatMessages.map((msg, idx) => (
                       <ChatMessage msg={msg} isMe={msg.sender_id === user.id} key={msg.id || idx} isPrivate />
                     ))}
                  </div>
               ) : (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-2">نامەیێن تایبەت</h4>
                    {privateChats.map(chat => (
                        <div key={chat.id} onClick={() => { triggerHaptic(10); setSelectedChat(chat); }} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 transition-all cursor-pointer relative">
                          <div className="relative">
                              <Avatar src={chat.avatar_url} updatedAt={chat.updated_at} size="md" border={false} />
                              {chat.unread && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
                              )}
                          </div>
                          <div className="flex flex-col">
                              <span className="font-black text-lg text-white font-rabar leading-tight">{chat.nickname}</span>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                {chat.unread ? 'نامەکا نووی یا هاتی' : 'کلیک بکە بۆ ئاخفتنێ'}
                              </span>
                          </div>
                        </div>
                    ))}
                  </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Tray (Shown for Global or Active Private Chat) */}
      {(activeTab === 'global' || (activeTab === 'private' && selectedChat)) && (
         <div className="p-3 bg-slate-900/60 border-t border-white/5 backdrop-blur-lg">
           <form onSubmit={sendGlobalOrPrivateAction} className="flex gap-2.5 items-center">
             <motion.button 
                whileTap={{ scale: 0.9 }}
                type="submit"
                disabled={!newMessage.trim()}
                className="w-11 h-11 rounded-lg bg-primary text-slate-950 flex items-center justify-center shadow-lg disabled:opacity-20 transition-all font-black text-[20px]"
             >
               <span className="material-symbols-outlined">send</span>
             </motion.button>
             <input 
               id="chatMessageInput"
               name="chatMessage"
               type="text"
               autoComplete="off"
               autoCorrect="off"
               spellCheck="false"
               autoCapitalize="none"
               value={newMessage}
               onChange={(e) => setNewMessage(e.target.value)}
               placeholder="نامەکێ بنڤیسە..."
               dir="rtl"
               className="flex-1 bg-white/5 border border-white/10 rounded-lg py-3 px-5 font-bold font-rabar text-[14px] text-right text-white focus:bg-white/10 transition-all outline-none placeholder:text-slate-600"
             />
           </form>
         </div>
      )}
      {/* Profile Modal */}
      <AnimatePresence>
        {viewedProfile && (
          <PublicProfileModal 
            profile={viewedProfile}
            currentUser={user}
            onClose={() => setViewedProfile(null)}
            onMessage={() => {
              triggerHaptic(15);
              setSelectedChat(viewedProfile);
              setActiveTab('private');
              setViewedProfile(null);
            }}
            onToggleBlock={(currentlyBlocked) => handleToggleBlock(viewedProfile.id, currentlyBlocked)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ChatMessage({ msg, isMe, isPrivate }) {
  const displayName = isPrivate ? null : (msg.display_nickname || msg.user_nickname || 'یاریکەر');

  return (
    <div className={`flex flex-col ${isMe ? 'items-start' : 'items-end'} gap-1 mb-1 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      {!isMe && !isPrivate && (
        <div className="flex items-center gap-2 px-2">
           <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider font-rabar">{displayName}</span>
        </div>
      )}
      <div className={`px-4 py-3 rounded-md max-w-[80%] border shadow-sm ${
        isMe ? 'bg-primary text-slate-950 border-white/10' : 'bg-slate-800 text-white border-white/5'
      }`}>
        <p className="font-bold font-rabar text-[14px] leading-tight break-words whitespace-pre-wrap">{msg.content}</p>
        <div className="flex items-center justify-between mt-1 gap-4 opacity-40">
           <span className="text-[8px] font-black uppercase font-ui">
             {new Date(msg.created_at).toLocaleTimeString('ku-IQ', { hour: '2-digit', minute: '2-digit' })}
           </span>
        </div>
      </div>
    </div>
  );
}
