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
      case 'hint_pack': return 'bg-[#FF9F1C] shadow-[0_4px_0_#E68A00] dark:bg-[#FF9F1C]/90 dark:shadow-[0_4px_0_rgba(230,138,0,0.8)]';
      case 'attractor_field': return 'bg-[#98A3F8] shadow-[0_4px_0_#7A85D9] dark:bg-[#98A3F8]/90 dark:shadow-[0_4px_0_rgba(122,133,217,0.8)]';
      case 'full_skip': return 'bg-[#A2E263] shadow-[0_4px_0_#85C14B] dark:bg-[#A2E263]/90 dark:shadow-[0_4px_0_rgba(133,193,75,0.8)]';
      default: return 'bg-mono-white shadow-[0_4px_0_#e5e5e5] dark:bg-mono-900 dark:shadow-[0_4px_0_#262626]';
    }
  };

  const dynamicClass = getDynamicStyles(item.id);

  return (
    <div className="flex items-stretch gap-3 w-full">
      {/* Info Card (Right Side in RTL) */}
      <div className={`flex-1 relative px-4 py-3 ${dynamicClass} rounded-[8px] flex items-center gap-3 overflow-visible transition-all mb-1`}>
        <div className="w-[44px] h-[44px] rounded-md bg-white/20 dark:bg-black/20 flex items-center justify-center text-white shrink-0 relative z-10 border border-white/30">
          {item.id === 'hint_pack' ? (
            <HintIcon className="w-7 h-7 drop-shadow-md" />
          ) : item.id === 'attractor_field' ? (
            <MagnetIcon className="w-7 h-7 drop-shadow-md" />
          ) : item.id === 'full_skip' ? (
            <SkipIcon className="w-7 h-7 drop-shadow-md" />
          ) : (
            <span className="material-symbols-outlined text-[24px] drop-shadow-md text-white">{item.icon}</span>
          )}
        </div>
        
        <div className="flex-1 text-right min-w-0 relative z-10 pr-1">
          <h3 className="text-[16px] font-black text-white dark:text-mono-50 mb-0.5 leading-tight truncate drop-shadow-sm">{item.name}</h3>
          <p className="text-[11px] font-bold text-white/90 dark:text-mono-200 leading-tight truncate">{item.description}</p>
        </div>
      </div>

      {/* Price Button (Left Side in RTL) */}
      <button
        onClick={() => { 
          if (canAfford) {
            triggerHaptic(10); 
            onRequestPurchase(item); 
          } else {
            triggerHaptic([50, 30, 50]);
          }
        }}
        className={`group flex-shrink-0 w-[95px] flex items-center justify-center gap-2 px-2 py-3 ${dynamicClass} rounded-[8px] transition-all duration-150 relative mb-1 border-2 border-white/30 dark:border-white/10 ${!canAfford ? 'opacity-80 active:translate-y-[4px] active:shadow-[0_0px_0_transparent] cursor-not-allowed' : 'active:translate-y-[4px] active:shadow-[0_0px_0_transparent] dark:active:shadow-[0_0px_0_transparent] hover:scale-[1.04] hover:brightness-110'}`}
      >
        <div className="flex flex-col items-center leading-none relative z-10">
          <span className="text-[17px] font-black text-white drop-shadow-sm">{toKuDigits(item.price || 0)}</span>
        </div>
        <div className={`w-5 h-5 flex items-center justify-center text-white drop-shadow-md relative z-10 group-hover:rotate-12 transition-transform duration-300 ${!canAfford ? 'grayscale opacity-60' : ''}`}>
          {item.currency === 'derhem' ? <DerhemIcon /> : item.currency === 'dinar' ? <DinarIcon /> : <FilsIcon />}
        </div>
      </button>
    </div>
  );
};


export default function ShopView({ fils, derhem, dinar: _dinar, magnetCount, hintCount, skipCount, onPurchase, onPurchaseAvatar, onEquipAvatar, ownedAvatars = ['default'], equippedAvatar = 'default' }) {
  const { playTabSound, playPurchaseSound } = useAudio();
  const { user: _user, loadingAuth } = useUser();
  const [activeTab, setActiveTab] = useState('powerups');
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
    if (playPurchaseSound) playPurchaseSound();

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
        <div className="flex p-1 bg-mono-100 dark:bg-black backdrop-blur-2xl rounded-md border border-mono-200 dark:border-mono-800 shadow-sm relative transition-colors duration-300">
        {['powerups', 'avatars'].map((tab) => (
          <button 
            key={tab}
            onClick={() => { 
                triggerHaptic(10); 
                playTabSound();
                setActiveTab(tab); 
            }} 
            className={`flex-1 flex items-center justify-center py-2 px-2 transition-all duration-300 relative z-10 font-rabar font-black text-[14px] tracking-normal ${
              activeTab === tab 
                ? 'text-mono-950 dark:text-mono-50' 
                : 'text-mono-600 hover:text-mono-900 dark:text-mono-400 dark:hover:text-mono-100'
            }`}
          >
            {activeTab === tab && (
              <Motion.div
                layoutId="shopActiveTab"
                className="absolute inset-0 bg-mono-white dark:bg-mono-800 rounded-sm shadow-sm z-[-1] transition-all duration-300"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
            {tab === 'powerups' ? 'ھاریکار' : 'ئێمۆجی'}
          </button>
        ))}
      </div>

      <Motion.div layout className="flex flex-col gap-5">
        <AnimatePresence mode="wait">
          {activeTab === 'powerups' && (
            <Motion.div key="powerups" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-4">
                {SHOP_ITEMS.POWERUPS.map(item => (
                  <PowerUpCard key={item.id} item={item} onRequestPurchase={(i) => executePurchase({ data: i, type: 'powerup' })} canAfford={fils >= item.price} />
                ))}
              </div>
            </Motion.div>
          )}
          {activeTab === 'avatars' && (
            <Motion.div key="avatars" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="flex flex-col gap-3">
              {SHOP_ITEMS.AVATARS.map(avatar => (
                <Motion.div
                  key={avatar.id}
                  className={`bg-mono-white dark:bg-mono-900 py-3 px-4 rounded-md border border-mono-200 dark:border-mono-800 flex items-center gap-3 transition-all shadow-sm ${ownedAvatars.includes(avatar.id) && equippedAvatar === avatar.id ? 'border-primary/50 ring-1 ring-primary/10' : ''}`}
                >
                  <div className="w-12 h-12 rounded-md bg-mono-100 dark:bg-white/10 border border-mono-200 dark:border-white/5 p-0.5 shrink-0 overflow-hidden relative group shadow-sm">
                    <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover rounded-[8px] animate-character-idle" />
                  </div>
                  <div className="flex-1 text-right min-w-0">
                    <h3 className="text-md font-bold text-mono-900 dark:text-mono-50 mb-0 truncate">{avatar.name}</h3>
                    <p className="text-[9px] font-bold text-mono-500 dark:text-mono-400 leading-tight truncate">{avatar.description}</p>
                  </div>
                  <div className="shrink-0 flex items-center">
                    {ownedAvatars.includes(avatar.id) ? (
                      <button
                        onClick={() => { triggerHaptic(10); onEquipAvatar(avatar.id); }}
                        className={`px-3 py-1 rounded-md font-bold text-[11px] transition-all ${equippedAvatar === avatar.id ? 'bg-primary text-white shadow-md' : 'bg-mono-100 dark:bg-white/10 text-mono-600 dark:text-mono-300 hover:bg-mono-200'}`}
                      >
                        {equippedAvatar === avatar.id ? 'چالاکە' : 'بکاربینە'}
                      </button>
                    ) : (
                      <div className="relative">
                        <button
                          onClick={() => { 
                            if ((avatar.currency === 'derhem' ? derhem : fils) >= avatar.price) {
                              triggerHaptic(10); 
                              executePurchase({ data: avatar, type: 'avatar' });
                            } else {
                              triggerHaptic([50, 30, 50]);
                            }
                          }}
                          className={`flex items-center gap-1.5 px-3.5 py-1 rounded-md transition-all shadow-sm ${((avatar.currency === 'derhem' ? derhem : fils) >= avatar.price) ? 'bg-mono-100 dark:bg-mono-800 text-mono-700 dark:text-mono-200 border border-mono-200 dark:border-mono-700' : 'bg-mono-100 dark:bg-mono-900 text-mono-400 dark:text-mono-500 border border-mono-200/50 dark:border-mono-800/50 cursor-not-allowed'}`}
                        >
                          <div className="flex flex-col items-center leading-none">
                            <span className="text-[11px] font-bold">{toKuDigits(avatar.price || 0)}</span>
                          </div>
                          <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                             {avatar.currency === 'derhem' ? <DerhemIcon /> : <FilsIcon />}
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </Motion.div>
              ))}
            </Motion.div>
          )}
        </AnimatePresence>
      </Motion.div>

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


