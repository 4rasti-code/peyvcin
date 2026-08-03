import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const fallbackAds = [
  {
    id: 'fallback-1',
    is_fallback: true,
    title: 'ڕیکلاما خوە ل ڤێرێ بکە!',
    subtitle: 'بۆ زێدەکرنا ڕیکلاما بزنسێ خوە د ناڤ پەیڤۆکێ دا پەیوەندیێ ب مە بکە.',
    icon: 'campaign',
    link: 'https://t.me/AymanAlhelo',
    bgClass: 'bg-gradient-to-r from-purple-600 to-indigo-600',
    shadowClass: 'shadow-[0_5px_0_#4338ca]'
  },
  {
    id: 'fallback-2',
    is_fallback: true,
    title: 'بزنسێ خوە پێشبێخە!',
    subtitle: 'هەزاران یاریزان ڕۆژانە دێ ڕیکلاما تە بینن. جهێ خوە ڤەگرە.',
    icon: 'trending_up',
    link: 'https://t.me/AymanAlhelo',
    bgClass: 'bg-gradient-to-r from-emerald-500 to-teal-600',
    shadowClass: 'shadow-[0_5px_0_#047857]'
  }
];

const AdBanner = () => {
  const [dbAds, setDbAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const { data, error } = await supabase
          .from('advertisements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setDbAds(data);
        }
      } catch (err) {
        console.warn("Could not fetch ads, using fallback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  const displayAds = dbAds.length > 0 ? dbAds : fallbackAds;

  useEffect(() => {
    if (displayAds.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % displayAds.length);
      }, 3000); // 3 seconds per slide

      return () => clearInterval(interval);
    }
  }, [displayAds.length]);

  if (loading) return null;

  const slideVariants = {
    enter: { x: '-100%', opacity: 1 },
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: { zIndex: 0, x: '100%', opacity: 1 }
  };

  const currentAd = displayAds[currentIndex];

  return (
    <div className="col-span-2 relative mt-1 aspect-[2/1] w-full rounded-md overflow-hidden bg-mono-900" style={{ boxShadow: currentAd.is_fallback ? 'none' : '0 5px 0 rgba(0,0,0,0.5)' }}>
      <AnimatePresence initial={false}>
        <Motion.div
          key={currentAd.id}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "tween", duration: 0.4, ease: "easeInOut" }}
          className={`absolute inset-0 w-full h-full border-none outline-none ${currentAd.is_fallback ? currentAd.bgClass + ' ' + currentAd.shadowClass : ''}`}
        >
          {/* Badge */}
          <div className="absolute top-2 left-2 z-20 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-sm shadow-sm">
            <span className="text-[9px] text-white/90 font-black tracking-wider uppercase">سپۆنسەر</span>
          </div>

          {currentAd.is_fallback ? (
            <>
              <div className="relative z-10 flex items-center justify-between px-6 h-full">
                <div className="flex flex-col items-start text-right w-full">
                  <h3 className="text-lg font-black font-heading text-white truncate w-full">{currentAd.title}</h3>
                  <span className="text-[10px] font-medium font-rabar text-white/70 leading-relaxed max-w-[80%] whitespace-pre-wrap">{currentAd.subtitle}</span>
                </div>
                <div className="flex items-center justify-center relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                    <span className="material-symbols-outlined text-white text-[24px]">{currentAd.icon}</span>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
            </>
          ) : (
            <>
              <img 
                src={currentAd.image_url} 
                alt={currentAd.title || 'Ad'} 
                className="w-full h-full object-cover"
              />
              {currentAd.title && (
                <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-end p-3 pb-4 pointer-events-none">
                  <span className="text-white font-bold text-xs shadow-sm text-right font-rabar">{currentAd.title}</span>
                </div>
              )}
            </>
          )}
        </Motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdBanner;
