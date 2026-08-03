import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

  {
    id: 'fallback-1',
    is_fallback: true,
    title: 'ڕیکلاما خوە ل ڤێرێ بکە!',
    subtitle: 'بۆ دانانا ڕیکلاما بزنسێ خوە ل ڤێرێ، نۆکە پەیوەندیێ ب مە بکە.',
    icon: 'campaign',
    bgClass: 'bg-mono-900 border border-white/5 overflow-hidden',
    shadowClass: 'shadow-lg',
    glowColor: 'bg-purple-500/20',
    iconColor: 'text-purple-400'
  },
  {
    id: 'fallback-2',
    is_fallback: true,
    title: 'بزنسێ خوە پێشبێخە!',
    subtitle: 'ئەڤ بۆشاییە یا تەرخانکریە بۆ ڕیکلامکرنا بزنس و کارێن وە.',
    icon: 'trending_up',
    bgClass: 'bg-mono-900 border border-white/5 overflow-hidden',
    shadowClass: 'shadow-lg',
    glowColor: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400'
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
    <div className="col-span-2 relative mt-1 aspect-2/1 w-full rounded-md overflow-hidden bg-mono-900" style={{ boxShadow: currentAd.is_fallback ? 'none' : '0 5px 0 rgba(0,0,0,0.5)' }}>
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
          <div className="absolute top-3 left-3 z-20 bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded border border-white/10 shadow-sm">
            <span className="text-[10px] text-white/90 font-bold tracking-widest uppercase drop-shadow-sm">سپۆنسەر</span>
          </div>

          {currentAd.is_fallback ? (
            <div className="relative w-full h-full flex items-center justify-between p-6 overflow-hidden">
              {/* Animated Glow Backdrops */}
              <div className={`absolute -top-12 -left-12 w-40 h-40 rounded-full blur-3xl ${currentAd.glowColor} animate-pulse`} />
              <div className={`absolute -bottom-12 -right-12 w-40 h-40 rounded-full blur-3xl ${currentAd.glowColor} animate-pulse`} style={{ animationDelay: '1.5s' }} />
              
              <div className="relative z-10 flex flex-col items-start text-right w-full pr-2">
                <h3 className="text-xl font-black font-heading text-white drop-shadow-md truncate w-full mb-1">{currentAd.title}</h3>
                <span className="text-xs font-medium font-rabar text-white/50 leading-relaxed max-w-[85%] whitespace-pre-wrap">{currentAd.subtitle}</span>
              </div>
              <div className="flex items-center justify-center relative shrink-0">
                <Motion.div 
                  animate={{ y: [0, -5, 0] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center backdrop-blur-xl border border-white/10 shadow-inner"
                >
                  <span className={`material-symbols-outlined text-[28px] drop-shadow-md ${currentAd.iconColor}`}>{currentAd.icon}</span>
                </Motion.div>
              </div>
              {/* Subtle glass overlay */}
              <div className="absolute inset-0 bg-linear-to-br from-white/[0.04] to-transparent pointer-events-none" />
            </div>
          ) : (
            <>
              <img 
                src={currentAd.image_url} 
                alt={currentAd.title || 'Ad'} 
                className="w-full h-full object-cover"
              />
              {currentAd.title && (
                <div className="absolute bottom-0 inset-x-0 h-1/2 bg-linear-to-t from-black/80 to-transparent flex items-end justify-end p-3 pb-4 pointer-events-none">
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
