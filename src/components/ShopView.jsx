import React, { useState, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../utils/haptics';
import { THEMES } from '../data/themes';
import { FilsIcon, DerhemIcon, DinarIcon, HintIcon, MagnetIcon, SkipIcon } from './CurrencyIcon';
import { toKuDigits } from '../utils/formatters';
import InventoryBar from './InventoryBar';
import { useUser } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';


const SHOP_ITEMS = {
  POWERUPS: [
    { id: 'hint_pack', name: 'ھاریکاری', description: 'پەیداکرنا پیتەکا راست', icon: 'lightbulb', price: 250, color: 'from-amber-400 to-orange-500', glow: 'shadow-amber-500/40', currency: 'fils' },
    { id: 'attractor_field', name: 'موگناتیس', description: 'دەرئێخستنا پیتێن شاش', icon: 'auto_fix_high', price: 500, color: 'from-purple-500 to-indigo-600', glow: 'shadow-purple-500/40', currency: 'fils' },
    { id: 'full_skip', name: 'دەربازبوون', description: 'دەربازبوونا ب تەمام ژ پەیڤێ', icon: 'fast_forward', price: 1000, color: 'from-blue-400 to-cyan-600', glow: 'shadow-blue-500/40', currency: 'fils' }
  ],
  SPECIALS: [
    { id: 'fils_pack_small', name: '٥٠٠ فلس', description: 'بڕەکا کێم ژ دراوی بۆ یاریێ', icon: 'payments', price_usd: 0.99, price_iqd: 1500, amount: 500, color: 'from-blue-400 to-indigo-500', glow: 'shadow-blue-500/30', type: 'currency' },
    { id: 'fils_pack_medium', name: '٢٥٠٠ فلس', description: 'پاکێجا ناڤین و ب مفاتر', icon: 'savings', price_usd: 2.99, price_iqd: 4500, amount: 2500, color: 'from-emerald-400 to-teal-600', glow: 'shadow-emerald-500/30', type: 'currency' },
    { id: 'fils_pack_large', name: '٧٥٠٠ فلس', description: 'مەزنترین بڕا دراوی بۆ یاریزانێن زیرەک', icon: 'account_balance_wallet', price_usd: 6.99, price_iqd: 10000, amount: 7500, color: 'from-amber-400 to-orange-600', glow: 'shadow-amber-500/40', type: 'currency' }
  ],
  AVATARS: []
};

const PowerUpCard = ({ item, onRequestPurchase, canAfford }) => {
  const getDynamicStyles = (id) => {
    switch (id) {
      case 'hint_pack': return 'bg-[#FF9F1C] dark:bg-[#FF9F1C]/80 border-[#E68A00] dark:border-[#FF9F1C]/20';
      case 'attractor_field': return 'bg-[#98A3F8] dark:bg-[#98A3F8]/80 border-[#7A85D9] dark:border-[#98A3F8]/20';
      case 'full_skip': return 'bg-[#A2E263] dark:bg-[#A2E263]/80 border-[#85C14B] dark:border-[#A2E263]/20';
      default: return 'bg-mono-white dark:bg-mono-900 border-mono-200 dark:border-mono-800';
    }
  };

  const dynamicClass = getDynamicStyles(item.id);

  return (
    <Motion.button
      layout
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => { 
        if (canAfford) {
          triggerHaptic(10); 
          onRequestPurchase(item); 
        } else {
          triggerHaptic([50, 30, 50]);
        }
      }}
      className={`group relative w-full px-5 py-4 ${dynamicClass} rounded-md border-b-4 flex items-center gap-4 overflow-visible transition-all shadow-md active:border-b-0 active:translate-y-[2px]`}
    >
      <div className="w-[48px] h-[48px] rounded-md bg-white/20 dark:bg-black/20 flex items-center justify-center text-white shrink-0 relative z-10 transition-transform group-hover:scale-110 duration-300 border border-white/30">
        {item.id === 'hint_pack' ? (
          <HintIcon className="w-8 h-8 drop-shadow-md" />
        ) : item.id === 'attractor_field' ? (
          <MagnetIcon className="w-8 h-8 drop-shadow-md" />
        ) : item.id === 'full_skip' ? (
          <SkipIcon className="w-8 h-8 drop-shadow-md" />
        ) : (
          <span className="material-symbols-outlined text-[24px] drop-shadow-md text-white">{item.icon}</span>
        )}
      </div>
      
      <div className="flex-1 text-right min-w-0 relative z-10 pr-1">
        <h3 className="text-[17px] font-black text-white dark:text-mono-50 mb-0.5 leading-tight truncate drop-shadow-sm">{item.name}</h3>
        <p className="text-[12px] font-bold text-white/90 dark:text-mono-200 leading-tight truncate">{item.description}</p>
      </div>

      <div className="flex flex-col items-center justify-center shrink-0 z-10 relative">
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition-all shadow-inner duration-300 ${!canAfford ? 'bg-black/20 text-white/50' : 'bg-white/20 dark:bg-black/30 text-white border border-white/20 group-hover:scale-105'}`}>
          <div className="flex flex-col items-center leading-none">
            <span className="text-[14px] font-black">{toKuDigits(item.price || 0)}</span>
          </div>
          <div className={`w-4 h-4 flex items-center justify-center ${!canAfford ? 'grayscale opacity-60' : ''}`}>
            {item.currency === 'derhem' ? <DerhemIcon /> : item.currency === 'dinar' ? <DinarIcon /> : <FilsIcon />}
          </div>
        </div>
      </div>
    </Motion.button>
  );
};


export default function ShopView({ fils, derhem, dinar: _dinar, magnetCount, hintCount, skipCount, onPurchase, onPurchaseAvatar, onEquipAvatar, ownedAvatars = ['default'], equippedAvatar = 'default' }) {
  const { playTabSound } = useAudio();
  const { user: _user, loadingAuth } = useUser();
  const bgRef = useRef(null);

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget || e.target.classList.contains('bg-trigger-zone')) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      bgRef.current?.pulse(x, y);
    }
  };

  const executePurchase = (payload) => {
    const { type, data } = payload;
    
    // Haptic immediately for instant feedback
    triggerHaptic(20); 

    if (type === 'powerup') {
       onPurchase(data);
    } else if (type === 'avatar') {
       onPurchaseAvatar(data.id, data.price, data.currency);
    } else if (type === 'theme') {
       onPurchase({ ...data, type: 'theme' });
    }
  };

  if (loadingAuth) {
    return (
      <div className="flex-1 w-full flex items-center justify-center bg-mono-white dark:bg-black transition-colors duration-500">
        <div className="w-12 h-12 border-4 border-mono-200 dark:border-white/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div 
      onClick={handleBackgroundClick}
      className="flex-1 w-full bg-mono-white dark:bg-black px-4 pt-6 pb-[120px] max-w-full flex flex-col gap-6 animate-in fade-in duration-700 overflow-x-hidden relative bg-trigger-zone transition-colors"
    >

      
      <div className="relative z-20 bg-mono-50 dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-md p-6 shadow-sm overflow-hidden group transition-colors duration-300">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-50" />
        <div className="relative z-10 flex flex-col items-center">
          <InventoryBar 
            magnetCount={magnetCount} 
            hintCount={hintCount} 
            skipCount={skipCount}
            isShop={true}
            className="scale-110"
          />
        </div>
      </div>

      <div className="relative z-20 bg-mono-white/5 dark:bg-mono-900/40 border border-mono-200/50 dark:border-mono-800/50 rounded-md p-3 shadow-sm flex flex-col gap-4 transition-colors duration-300">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4">
          {SHOP_ITEMS.POWERUPS.map(item => (
            <PowerUpCard key={item.id} item={item} onRequestPurchase={(i) => executePurchase({ data: i, type: 'powerup' })} canAfford={fils >= item.price} />
          ))}
        </div>
      </div>

      {/* Store Compliance Virtual Currency Disclaimer */}
      <div className="relative z-20 mt-6 px-4 py-3 bg-mono-100/50 dark:bg-mono-900/50 border border-mono-200 dark:border-mono-800 rounded-md text-center shadow-inner">
        <p className="text-[9px] sm:text-[10px] font-bold text-mono-500 dark:text-mono-400 leading-relaxed max-w-sm mx-auto">
          فلس، درهەم، و دینار دراڤێن خەیالی یێن ناڤ یاریێ نە و چ بهایەکێ ڕاستەقینە یان مادی نینە. ئەڤ یارییە چ پەیوەندی ب قومارێ و گۆڕینا دراڤی ب پارێ ڕاستەقینە ڤە نینە.
        </p>
      </div>
      </div>
    </div>
  );
}


