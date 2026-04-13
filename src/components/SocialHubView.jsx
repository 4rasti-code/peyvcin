import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useGame } from '../context/GameContext';
import { triggerHaptic } from '../utils/haptics';
import Avatar from './Avatar';
import FlagBadge from './FlagBadge';

export default function SocialHubView({ 
  user, 
  onBack, 
  initialChatPartner = null,
  initialTab = null,
  onViewMessages,
  onViewFriends 
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
  const scrollRef = useRef(null);

  // --- Realtime Listeners ---
  useEffect(() => {
    if (!user?.id) return;

    const globalSub = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
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

    return () => {
      supabase.removeChannel(globalSub);
      supabase.removeChannel(socialSub);
    };
  }, [user?.id]);

  useEffect(() => {
    if (activeTab === 'global') fetchGlobalMessages();
    if (activeTab === 'friends') fetchFriendsData();
    if (activeTab === 'private') fetchPrivateConversations();
  }, [activeTab]);

  useEffect(() => {
    if (selectedChat) fetchPrivateChatHistory(selectedChat.id);
  }, [selectedChat]);

  // --- Data Fetching Logic (Simplified - No Joins) ---
  
  const fetchGlobalMessages = async () => {
    try {
      // Rule 1: Simplified - Just fetch the columns that exist in messages
      const { data, error } = await supabase
        .from('messages')
        .select('id, content, user_id, user_nickname, created_at')
        .order('created_at', { ascending: false })
        .limit(40);

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
      setLoading(true);
      
      // 1. Fetch only the core friendship rows
      const { data: friendships, error: fError } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_id.eq.${user?.id},friend_id.eq.${user?.id}`);

      if (fError) throw fError;

      // 2. Extract profile IDs we need to fetch separately
      const profileIds = new Set();
      friendships.forEach(f => {
        profileIds.add(f.user_id);
        profileIds.add(f.friend_id);
      });

      // 3. Fetch profiles in one batch
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url, updated_at')
        .in('id', Array.from(profileIds));

      if (pError) throw pError;

      const profileMap = profiles.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

      // 4. Map them locally
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
      console.warn("Friendships fetch simplified failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrivateConversations = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('private_messages')
        .select('sender_id, recipient_id')
        .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const partnerIds = [...new Set(data.map(m => m.sender_id === user?.id ? m.recipient_id : m.sender_id))];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url, updated_at')
        .in('id', partnerIds);

      setPrivateChats(profiles || []);
    } catch (err) {
      console.warn("Private conversation fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrivateChatHistory = async (partnerId) => {
    if (!user?.id || !partnerId) return;
    try {
      const { data, error } = await supabase
        .from('private_messages')
        .select('*')
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id) return;
    
    triggerHaptic(15);
    try {
      if (activeTab === 'global') {
        // Rule 2 & 3: Match Exact Table (content, user_id, user_nickname)
        const payload = { 
          content: newMessage, 
          user_id: user?.id, 
          user_nickname: userNickname || 'یاریکەر' 
        };
        
        const { error } = await supabase.from('messages').insert([payload]);
        if (error) {
          // Check if user_nickname exists, if not, try minimal insert
          if (error.code === '42703') {
            await supabase.from('messages').insert([{ content: newMessage, user_id: user?.id }]);
          } else {
            throw error;
          }
        }
        setNewMessage('');
        fetchGlobalMessages();
      } else if (selectedChat) {
        const { error } = await supabase
          .from('private_messages')
          .insert([{ content: newMessage, sender_id: user?.id, recipient_id: selectedChat.id }]);
        
        if (error) throw error;
        setNewMessage('');
        fetchPrivateChatHistory(selectedChat.id);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    triggerHaptic(20);
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', requestId);
    fetchFriendsData();
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
         <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined">arrow_forward_ios</span>
         </button>
         <h2 className="text-xl font-black font-rabar">ناوەندا جیهانی</h2>
         <div className="w-10 h-10" />
      </div>

      {/* Tabs */}
      <div className="flex p-2 gap-2 bg-slate-900/30">
        {[
          { id: 'global', label: 'چاتا گشتی', icon: 'public' },
          { id: 'private', label: 'نامە', icon: 'chat' },
          { id: 'friends', label: 'هەڤال', icon: 'group' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { triggerHaptic(10); setActiveTab(tab.id); setSelectedChat(null); }}
            className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all ${activeTab === tab.id ? 'bg-primary text-slate-950 font-black' : 'text-white/40 hover:text-white/60'}`}
          >
            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative no-scrollbar">
        {loading && (
           <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 z-10 backdrop-blur-sm">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
           </div>
        )}

        {activeTab === 'global' && (
          <div className="p-4 space-y-4">
             {messages.map((m, idx) => (
               <motion.div 
                 initial={{ opacity: 0, x: -10 }} 
                 animate={{ opacity: 1, x: 0 }} 
                 key={m.id || idx} 
                 className={`flex flex-col ${m.user_id === user?.id ? 'items-end' : 'items-start'}`}
               >
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-[10px] font-bold text-white/40">{m.user_nickname || 'یاریکەر'}</span>
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm font-bold font-rabar ${m.user_id === user?.id ? 'bg-primary text-slate-950 rounded-tr-none' : 'bg-white/5 border border-white/5 text-white rounded-tl-none'}`}>
                     {m.content}
                  </div>
               </motion.div>
             ))}
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="p-4 space-y-6">
            {pendingRequests.length > 0 && (
              <div className="space-y-3">
                 <h3 className="text-[10px] font-black uppercase text-primary tracking-widest px-2">داخوازێن هەڤالینیێ</h3>
                 {pendingRequests.map(req => (
                   <div key={req.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                      <Avatar src={req.sender?.avatar_url} size="sm" />
                      <div className="flex-1 text-right">
                         <div className="font-black text-sm">{req.sender?.nickname}</div>
                      </div>
                      <button onClick={() => handleAcceptRequest(req.id)} className="px-4 py-2 bg-primary text-slate-950 rounded-xl font-black text-xs">قەبوولکرن</button>
                   </div>
                 ))}
              </div>
            )}
            
            <div className="space-y-3">
               <h3 className="text-[10px] font-black uppercase text-white/30 tracking-widest px-2">هەڤالێن تە</h3>
               {friends.length === 0 && !loading && (
                 <div className="text-center py-12 opacity-30 text-xs font-bold font-rabar">هیچ هەڤالەک نینە</div>
               )}
               {friends.map(f => (
                 <div key={f.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                    <Avatar src={f.friend?.avatar_url} size="sm" />
                    <div className="flex-1 text-right">
                       <div className="font-black text-sm">{f.friend?.nickname}</div>
                    </div>
                    <button onClick={() => { setActiveTab('private'); setSelectedChat(f.friend); }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5">
                       <span className="material-symbols-outlined text-xl">chat</span>
                    </button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'private' && (
           <div className="h-full flex flex-col">
              {selectedChat ? (
                <div className="flex-1 flex flex-col h-full bg-slate-900/20">
                   <div className="p-3 bg-slate-900 border-b border-white/5 flex items-center gap-3">
                      <button onClick={() => setSelectedChat(null)} className="material-symbols-outlined text-white/40">arrow_back</button>
                      <Avatar src={selectedChat.avatar_url} size="sm" />
                      <span className="font-black text-sm">{selectedChat.nickname}</span>
                   </div>
                   <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                      {chatMessages.map((m, idx) => (
                        <div key={m.id || idx} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                           <div className={`px-4 py-2 rounded-2xl text-sm font-bold ${m.sender_id === user?.id ? 'bg-primary text-slate-950 rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                              {m.content}
                           </div>
                        </div>
                      ))}
                      <div ref={scrollRef} />
                   </div>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                   {privateChats.map(chat => (
                      <div key={chat.id} onClick={() => setSelectedChat(chat)} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 cursor-pointer transition-all">
                         <Avatar src={chat.avatar_url} size="sm" />
                         <span className="font-black text-sm">{chat.nickname}</span>
                      </div>
                   ))}
                </div>
              )}
           </div>
        )}
      </div>

      {/* Input Area */}
      {(activeTab === 'global' || selectedChat) && (
        <div className="p-4 pb-8 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 flex gap-2 items-center">
           <input 
             type="text" 
             value={newMessage}
             onChange={(e) => setNewMessage(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
             placeholder="نامەکێ بنڤێسە..."
             className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold font-rabar focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
           />
           <button 
             onClick={handleSendMessage}
             disabled={!newMessage.trim()}
             className={`w-12 h-12 flex items-center justify-center rounded-2xl shadow-lg transition-all ${newMessage.trim() ? 'bg-primary text-slate-950 scale-100' : 'bg-white/5 text-white/20 scale-95'}`}
           >
              <span className="material-symbols-outlined font-black">send</span>
           </button>
        </div>
      )}
    </div>
  );
}
