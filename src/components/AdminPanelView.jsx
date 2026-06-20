import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { triggerHaptic } from '../utils/haptics';

const AdminPanelView = ({ onBack }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyTexts, setReplyTexts] = useState({});
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data: reportsData, error: reportsError } = await supabase
        .from('reported_messages')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      if (!reportsData || reportsData.length === 0) {
        setReports([]);
        return;
      }

      const userIds = [...new Set(reportsData.map(r => r.reporter_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, nickname')
        .in('id', userIds);

      const profileMap = {};
      if (profilesData) {
        profilesData.forEach(p => profileMap[p.id] = p);
      }

      const merged = reportsData.map(r => ({
        ...r,
        profile: profileMap[r.reporter_id] || { nickname: 'نەناسراو' }
      }));

      setReports(merged);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplyChange = (id, text) => {
    setReplyTexts(prev => ({ ...prev, [id]: text }));
  };

  const handleSendReply = async (report) => {
    const text = replyTexts[report.id];
    if (!text || !text.trim()) return;

    try {
      setSendingId(report.id);
      triggerHaptic(10);

      // Send the message as the Bot
      const { error: msgError } = await supabase
        .from('messages')
        .insert([{
          content: text.trim(),
          user_id: '9a813c24-b662-477d-a74a-6f822d17bbf1', // System Bot ID
          user_nickname: 'پەیڤۆک',
          receiver_id: report.reporter_id,
          is_read: false
        }]);

      if (msgError) throw msgError;

      // Mark report as resolved
      const { error: resolveError } = await supabase
        .from('reported_messages')
        .update({ status: 'resolved' })
        .eq('id', report.id);

      if (resolveError) throw resolveError;

      // Remove from list
      setReports(prev => prev.filter(r => r.id !== report.id));
      setReplyTexts(prev => ({ ...prev, [report.id]: '' }));

    } catch (err) {
      console.error("Error sending reply:", err);
      alert('هەڵە: ' + (err.message || JSON.stringify(err)));
    } finally {
      setSendingId(null);
    }
  };

  const handleMarkResolved = async (reportId) => {
    try {
      triggerHaptic(10);
      const { error } = await supabase
        .from('reported_messages')
        .update({ status: 'resolved' })
        .eq('id', reportId);

      if (error) throw error;
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err) {
      console.error("Error marking resolved:", err);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#F9FAFB] dark:bg-[#121212] flex flex-col items-center select-none overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="w-full h-14 bg-white dark:bg-[#1C1C1E] border-b border-mono-200 dark:border-white/10 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { triggerHaptic(10); onBack(); }}
            className="w-8 h-8 rounded-full bg-mono-100 dark:bg-white/10 flex items-center justify-center text-mono-700 dark:text-white/70 active:scale-95"
          >
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
          <h1 className="font-bold text-lg text-mono-900 dark:text-white">پەنێڵی ئەدمین (پەیڤۆک)</h1>
        </div>
        <button 
          onClick={fetchReports}
          className="w-8 h-8 flex items-center justify-center text-primary active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">refresh</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 w-full max-w-md mx-auto overflow-y-auto p-4 flex flex-col gap-4">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-mono-500 dark:text-mono-400">
            <span className="material-symbols-outlined text-6xl mb-2 opacity-50">done_all</span>
            <p className="font-bold">هیچ ڕاپۆرت یان نامەیەکی نوێ نییە</p>
          </div>
        ) : (
          reports.map(report => {
            const isBotMessage = report.reason?.startsWith('[نامەیا بۆتی]: ');
            const displayReason = isBotMessage ? report.reason.replace('[نامەیا بۆتی]: ', '') : report.reason;

            return (
              <Motion.div 
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1C1C1E] rounded-xl border border-mono-200 dark:border-white/10 p-4 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-primary flex items-center gap-1 text-sm">
                      <span className="material-symbols-outlined text-base">account_circle</span>
                      {report.profile?.nickname}
                    </h3>
                    <div className="text-xs text-mono-400 mt-1" dir="ltr">
                      {new Date(report.created_at).toLocaleString('en-GB')}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isBotMessage && (
                      <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded font-bold">
                        نامە بۆ بۆت
                      </span>
                    )}
                    {!isBotMessage && (
                      <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] px-2 py-0.5 rounded font-bold">
                        ڕاپۆرت
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-mono-50 dark:bg-black/20 p-3 rounded-lg text-sm text-mono-800 dark:text-mono-200 border border-mono-100 dark:border-white/5 whitespace-pre-wrap">
                  {displayReason || 'بێ هۆکار'}
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <textarea
                    value={replyTexts[report.id] || ''}
                    onChange={(e) => handleReplyChange(report.id, e.target.value)}
                    placeholder="وەڵامەکەت لێرە بنووسە..."
                    className="w-full bg-mono-100 dark:bg-[#2C2C2E] border border-mono-200 dark:border-white/10 rounded-lg p-3 text-sm min-h-[80px] focus:outline-none focus:border-primary resize-y"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleMarkResolved(report.id)}
                      className="px-4 py-2 rounded-lg text-sm font-bold text-mono-500 bg-mono-100 dark:bg-white/5 active:scale-95"
                    >
                      سڕینەوە
                    </button>
                    <button
                      onClick={() => handleSendReply(report)}
                      disabled={sendingId === report.id || !replyTexts[report.id]?.trim()}
                      className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-primary disabled:opacity-50 active:scale-95 flex items-center gap-2"
                    >
                      {sendingId === report.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span className="material-symbols-outlined text-lg">send</span>
                      )}
                      ناردن
                    </button>
                  </div>
                </div>
              </Motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminPanelView;
