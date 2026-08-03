import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const AdBanner = () => {
  const [ads, setAds] = useState([]);
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
          setAds(data);
        }
      } catch (err) {
        console.warn("Could not fetch ads, using fallback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
      }, 3000); // 3 seconds per slide

      return () => clearInterval(interval);
    }
  }, [ads.length]);

  if (loading) return null;

  const handleAdClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
  };

  // Fallback default ad if no ads are available
  if (ads.length === 0) {
    return (
      <div className="col-span-2 relative group mt-1">
        <Motion.button
          whileHover={{ scale: 0.98 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleAdClick('https://t.me/AymanAlhelo')} // Replace with your contact link
          className="w-full relative h-24 rounded-md overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_5px_0_#4338ca] border-none"
        >
          {/* Badge */}
          <div className="absolute top-2 left-2 z-20 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-sm">
            <span className="text-[9px] text-white/80 font-black tracking-wider uppercase">سپۆنسەر</span>
          </div>
          
          <div className="relative z-10 flex items-center justify-between px-6 h-full">
            <div className="flex flex-col items-start text-right w-full">
              <h3 className="text-lg font-black font-heading text-white truncate w-full">ڕیکلاما خوە ل ڤێرێ بکە!</h3>
              <span className="text-[10px] font-medium font-rabar text-white/70 leading-relaxed max-w-[80%] whitespace-pre-wrap">بۆ زێدەکرنا ڕیکلاما بزنسێ خوە د ناڤ پەیڤۆکێ دا پەیوەندیێ ب مە بکە.</span>
            </div>
            <div className="flex items-center justify-center relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                <span className="material-symbols-outlined text-white text-[24px]">campaign</span>
              </div>
            </div>
          </div>
          
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
        </Motion.button>
      </div>
    );
  }

  const currentAd = ads[currentIndex];

  return (
    <div className="col-span-2 relative mt-1 h-24 rounded-md overflow-hidden shadow-[0_5px_0_rgba(0,0,0,0.5)] bg-mono-900">
      <AnimatePresence mode="wait">
        <Motion.button
          key={currentAd.id}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={() => handleAdClick(currentAd.link_url)}
          className="absolute inset-0 w-full h-full border-none cursor-pointer outline-none"
        >
          {/* Badge */}
          <div className="absolute top-2 left-2 z-20 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-sm shadow-sm">
            <span className="text-[9px] text-white/90 font-black tracking-wider uppercase">سپۆنسەر</span>
          </div>

          <img 
            src={currentAd.image_url} 
            alt={currentAd.title || 'Ad'} 
            className="w-full h-full object-cover"
          />
          
          {/* Overlay gradient for readability if there is a title */}
          {currentAd.title && (
            <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-end p-3 pb-4 pointer-events-none">
              <span className="text-white font-bold text-xs shadow-sm text-right font-rabar">{currentAd.title}</span>
            </div>
          )}
        </Motion.button>
      </AnimatePresence>
    </div>
  );
};

export default AdBanner;
