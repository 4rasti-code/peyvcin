import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../utils/haptics';
import { THEMES } from '../data/themes';
import { FilsIcon, DerhemIcon, ZerIcon } from './CurrencyIcon';
import PaymentGatewayModal from './PaymentGatewayModal';
import { toKuDigits } from '../utils/formatters';
import CurrencyDecrementEffect from './CurrencyDecrementEffect';
import InventoryBar from './InventoryBar';
import { useGame } from '../context/GameContext';
import FloatingLetterBackground from './FloatingLetterBackground';

const SHOP_ITEMS = {
  POWERUPS: [
    { id: 'attractor_field', name: 'موگناتیس', description: 'دەرئێخستنا پیتێن شاش', icon: 'auto_fix_high', price: 3000, color: 'from-purple-500 to-indigo-600', glow: 'shadow-purple-500/40', currency: 'fils' },
    { id: 'hint_pack', name: 'ھاریکاری', description: 'پەیداکرنا پیتەکا راست', icon: 'lightbulb', price: 1000, color: 'from-amber-400 to-orange-500', glow: 'shadow-amber-500/40', currency: 'fils' },
    { id: 'full_skip', name: 'دەربازبوون', description: 'دەربازبوونا ب تەمام ژ پەیڤێ', icon: 'fast_forward', price: 2000, color: 'from-blue-400 to-cyan-600', glow: 'shadow-blue-500/40', currency: 'fils' }
  ],
  SPECIALS: [
    { id: 'fils_pack_small', name: '٥٠٠ فلس', description: 'بڕەکا کێم ژ دراوی بۆ یاریێ', icon: 'payments', price_usd: 0.99, price_iqd: 1500, amount: 500, color: 'from-blue-400 to-indigo-500', glow: 'shadow-blue-500/30', type: 'currency' },
    { id: 'fils_pack_medium', name: '٢٥٠٠ فلس', description: 'پاکێجا ناڤین و ب مفاتر', icon: 'savings', price_usd: 2.99, price_iqd: 4500, amount: 2500, color: 'from-emerald-400 to-teal-600', glow: 'shadow-emerald-500/30', type: 'currency' },
    { id: 'fils_pack_large', name: '٧٥٠٠ فلس', description: 'مەزنترین بڕا دراوی بۆ یاریزانێن زیرەک', icon: 'account_balance_wallet', price_usd: 6.99, price_iqd: 10000, amount: 7500, color: 'from-amber-400 to-orange-600', glow: 'shadow-amber-500/40', type: 'currency' },
    { id: 'premium_bundle', name: 'پاکێجا زێڕین (Premium)', description: '١٠٠٠ فلس + ٣ موگناتیس + ٢ دەربازبوون + ١ ھاریکاری', icon: 'auto_awesome', price_usd: 4.99, price_iqd: 7500, color: 'from-yellow-400 to-orange-600', glow: 'shadow-yellow-500/50', type: 'package' }
  ],
  AVATARS: [
    { id: 'peshmerga', name: 'پێشمەرگە', description: 'رێبەرێ چەلەنگ و پارێزەر', image: '/src/assets/characters/peshmerga_guide.png', price: 500, currency: 'derhem', color: 'from-green-600 to-emerald-800' },
    { id: 'grandma', name: 'داپیرە', description: 'خودان ئەزموون و دانەپیر', image: '/src/assets/characters/wise_grandma.png', price: 250, currency: 'derhem', color: 'from-purple-500 to-indigo-700' },
    { id: 'gamer', name: 'یاریکەر', description: 'گەنجێ ژیر و شارەزا', image: '/src/assets/characters/young_gamer.png', price: 1000, currency: 'fils', color: 'from-blue-500 to-cyan-600' }
  ]
};

// Old HeaderStatusBar removed in favor of shared InventoryBar

const PowerUpCard = ({ item, onPurchase, canAfford, playPurchaseSound }) => {
  const [showEffect, setShowEffect] = useState(false);

  return (
    <motion.button
      layout
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => { 
        if (canAfford) {
          triggerHaptic(10); 
          playPurchaseSound?.();
          onPurchase(item); 
          setShowEffect(true);
          setTimeout(() => setShowEffect(false), 2000);
        } else {
          triggerHaptic([50, 30, 50]);
        }
      }}
      className="group relative w-full px-2 py-1 bg-white/95 rounded-md border border-slate-200/60 hover:bg-white flex items-center gap-2 overflow-visible transition-all shadow-sm"
    >
      <div className={`w-[40px] h-[40px] rounded-md bg-linear-to-br ${item.color} flex items-center justify-center text-white shrink-0 relative z-10 transition-transform group-hover:scale-105 duration-300 shadow-sm`}>
        <span className="material-symbols-outlined text-[18px] drop-shadow-sm">{item.icon}</span>
      </div>
      <div className="flex-1 text-right min-w-0 relative z-10 pr-1">
        <h3 className="text-[14px] font-black text-slate-900 mb-0 tracking-tight leading-tight truncate">{item.name}</h3>
        <p className="text-[9px] font-bold text-slate-500 leading-tight truncate">{item.description}</p>
      </div>
      <div className="flex flex-col items-center justify-center shrink-0 z-10 relative">
        <AnimatePresence>
          {showEffect && (
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -45, scale: 1.1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-4 right-0 pointer-events-none flex items-center gap-1.5 whitespace-nowrap z-120"
            >
              <span className="text-[#ef4444] font-black text-xl drop-shadow-[0_2px_10px_rgba(239,68,68,0.2)]">
                -{toKuDigits(item.price)}
              </span>
              <div className="w-5 h-5 flex items-center justify-center text-[#ef4444] scale-90">
                 {item.currency === 'derhem' ? <DerhemIcon /> : item.currency === 'zer' ? <ZerIcon /> : <FilsIcon />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all shadow-sm ${!canAfford ? 'bg-slate-100/80 border border-slate-200 opacity-40' : 'bg-emerald-500 text-white group-hover:scale-105'}`}>
          <div className="flex flex-col items-center leading-none">
            <span className={`text-[13px] font-black ${!canAfford ? 'text-slate-400' : 'text-white'}`}>{toKuDigits(item.price || 0)}</span>
          </div>
          <div className={`w-3.5 h-3.5 flex items-center justify-center ${!canAfford ? 'opacity-40 grayscale' : ''}`}>
            {item.currency === 'derhem' ? <DerhemIcon /> : item.currency === 'zer' ? <ZerIcon /> : <FilsIcon />}
          </div>
        </div>
      </div>
    </motion.button>
  );
};

const SpecialOfferCard = ({ item, onOpenGateway, playPurchaseSound }) => (
  <motion.button
    layout
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => { triggerHaptic(10); playPurchaseSound?.(); onOpenGateway(item); }}
    className="group relative w-full p-6 sm:p-7 rounded-md bg-linear-to-br from-amber-400 via-amber-500 to-orange-600 border border-amber-300 shadow-lg flex flex-col gap-4 overflow-hidden mb-6"
  >
    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 skew-x-12" />
    
    <div className="flex items-center justify-between w-full relative z-10">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-md bg-white/20 flex items-center justify-center text-white border border-white/40 shadow-inner group-hover:scale-105 transition-transform duration-500">
           <span className="material-symbols-outlined text-[40px] drop-shadow-md">auto_awesome</span>
        </div>
        
        <div className="text-right">
          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-sm">پاکێجا زێڕین</h3>
          <p className="text-[11px] font-bold text-white/80 tracking-widest uppercase mt-0.5">پێشنیارا تایبەت</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center bg-white/20 px-4 py-2 rounded-md border border-white/30 shadow-md">
         <span className="text-xl sm:text-2xl font-black text-white leading-none">${toKuDigits(item.price_usd || 0)}</span>
         <span className="text-[10px] font-bold text-white/70 mt-1">{toKuDigits(item.price_iqd || 0)} دینار</span>
      </div>
    </div>

    <div className="flex items-center bg-white/10 p-3.5 rounded-md border border-white/20 relative z-10 w-full text-right">
       <span className="text-[12px] font-bold text-white leading-relaxed block w-full">{item.description}</span>
    </div>
  </motion.button>
);

export default function ShopView({ fils, derhem, zer, magnetCount, hintCount, skipCount, currentTheme, onPurchase, onPurchaseAvatar, onEquipAvatar, onEquipTheme, unlockedThemes = [], ownedAvatars = ['default'], equippedAvatar = 'default', playPurchaseSound }) {
  const { playTabSound } = useGame();
  const [activeTab, setActiveTab] = useState('powerups');
  const [gatewayOpen, setGatewayOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showAvatarEffect, setShowAvatarEffect] = useState(null);
  const [showThemeEffect, setShowThemeEffect] = useState(null);
  const bgRef = useRef(null);

  const handleBackgroundClick = (e) => {
    // Pulse on background void clicks
    if (e.target === e.currentTarget || e.target.classList.contains('bg-trigger-zone')) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      bgRef.current?.pulse(x, y);
    }
  };

  const openGateway = (offer) => {
    setSelectedOffer({ ...offer, usd: offer.price_usd, iqd: offer.price_iqd });
    setGatewayOpen(true);
  };

  const handleGatewayComplete = () => {
    if (selectedOffer) {
       onPurchase(selectedOffer);
    }
  };

  return (
    <div 
      onClick={handleBackgroundClick}
      className="flex-1 w-full bg-[#020617] px-4 pt-6 pb-[120px] max-w-full flex flex-col gap-6 animate-in fade-in duration-700 overflow-x- relative bg-trigger-zone"
    >
      <FloatingLetterBackground ref={bgRef} />
      
      <InventoryBar 
        magnetCount={magnetCount} 
        hintCount={hintCount} 
        skipCount={skipCount}
        isShop={true}
        className="mb-4"
      />

      <div className="flex p-1 bg-slate-100/95 backdrop-blur-2xl rounded border-2 border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative">
        {['powerups', 'avatars', 'themes'].map((tab) => (
          <button 
            key={tab}
            onClick={() => { 
                triggerHaptic(10); 
                playTabSound();
                setActiveTab(tab); 
            }} 
            className={`flex-1 flex items-center justify-center py-2 px-2 transition-all duration-500 relative z-10 font-rabar font-black text-[14px] ${
              activeTab === tab 
                ? 'text-white' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="shopActiveTab"
                className="absolute inset-0 bg-[#1e293b] rounded-sm shadow-[0_4px_12px_rgba(30,41,59,0.3)] z-[-1]"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
            {tab === 'powerups' ? 'ھاریکار' : tab === 'avatars' ? 'پەیڤچن' : 'نیشان'}
          </button>
        ))}
      </div>

      <motion.div layout className="flex flex-col gap-5">
        <AnimatePresence mode="wait">
          {activeTab === 'powerups' && (
            <motion.div key="powerups" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex flex-col gap-5">
              <SpecialOfferCard item={SHOP_ITEMS.SPECIALS.find(s => s.id === 'premium_bundle')} onOpenGateway={openGateway} playPurchaseSound={playPurchaseSound} />
              <div className="grid grid-cols-1 gap-4">
                {SHOP_ITEMS.POWERUPS.map(item => (
                  <PowerUpCard key={item.id} item={item} onPurchase={onPurchase} canAfford={fils >= item.price} playPurchaseSound={playPurchaseSound} />
                ))}
              </div>
            </motion.div>
          )}
          {activeTab === 'avatars' && (
            <motion.div key="avatars" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="flex flex-col gap-3">
              {SHOP_ITEMS.AVATARS.map(avatar => (
                <motion.div
                  key={avatar.id}
                  className={`bg-white/95 backdrop-blur-xl py-1 px-3 rounded-md border border-slate-200 flex items-center gap-3 transition-all shadow-sm ${ownedAvatars.includes(avatar.id) && equippedAvatar === avatar.id ? 'border-primary/50 ring-1 ring-primary/10' : ''}`}
                >
                  <div className="w-12 h-12 rounded-md bg-slate-100 border border-slate-200 p-0.5 shrink-0 overflow-hidden relative group shadow-sm">
                    <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover rounded-[8px] animate-character-idle" />
                  </div>
                  <div className="flex-1 text-right min-w-0">
                    <h3 className="text-md font-bold text-slate-900 mb-0 truncate">{avatar.name}</h3>
                    <p className="text-[9px] font-bold text-slate-500 leading-tight truncate">{avatar.description}</p>
                  </div>
                  <div className="shrink-0 flex items-center">
                    {ownedAvatars.includes(avatar.id) ? (
                      <button
                        onClick={() => { triggerHaptic(10); onEquipAvatar(avatar.id); }}
                        className={`px-3 py-1 rounded-md font-bold text-[11px] transition-all ${equippedAvatar === avatar.id ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {equippedAvatar === avatar.id ? 'چالاکە' : 'بکاربینە'}
                      </button>
                    ) : (
                      <div className="relative">
                        <AnimatePresence>
                          {(showAvatarEffect === avatar.id) && (
                            <motion.div
                              initial={{ opacity: 0, y: 0, scale: 0.5 }}
                              animate={{ opacity: 1, y: -45, scale: 1.1 }}
                              exit={{ opacity: 0 }}
                              className="absolute -top-10 right-0 pointer-events-none flex items-center gap-1.5 whitespace-nowrap z-120"
                            >
                              <span className="text-[#ef4444] font-black text-xl drop-shadow-[0_2px_10px_rgba(239,68,68,0.4)]">
                                -{toKuDigits(avatar.price)}
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <button
                          onClick={() => { 
                            if ((avatar.currency === 'derhem' ? derhem : fils) >= avatar.price) {
                              triggerHaptic(10); 
                              playPurchaseSound?.();
                              onPurchaseAvatar(avatar.id, avatar.price, avatar.currency); 
                              setShowAvatarEffect(avatar.id);
                              setTimeout(() => setShowAvatarEffect(null), 2000);
                            } else {
                              triggerHaptic([50, 30, 50]);
                            }
                          }}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-white hover:brightness-110 transition-all shadow-md ${((avatar.currency === 'derhem' ? derhem : fils) >= avatar.price) ? 'bg-emerald-500' : 'bg-slate-300 opacity-50 cursor-not-allowed'}`}
                        >
                          <div className="flex flex-col items-center leading-none">
                            <span className="text-[13px] font-black">{toKuDigits(avatar.price || 0)}</span>
                          </div>
                          <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                             {avatar.currency === 'derhem' ? <DerhemIcon /> : <FilsIcon />}
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
          {activeTab === 'themes' && (
            <motion.div key="themes" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-3">
              {Object.values(THEMES).map(theme => (
                <motion.div
                  key={theme.id}
                  className={`py-1 px-3 bg-white/95 backdrop-blur-xl rounded-md border border-slate-200 transition-all flex items-center gap-3 group shadow-sm ${currentTheme === theme.id ? 'border-primary/50 ring-1 ring-primary/10' : ''}`}
                >
                  <div 
                    className="w-10 h-10 rounded-[8px] border border-white/10 shrink-0 overflow-hidden relative shadow-sm"
                    style={{ background: theme.colors.background }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                       <span className="material-symbols-outlined text-xl" style={{ color: theme.colors.primary }}>{theme.isHeritage ? 'auto_awesome' : 'palette'}</span>
                    </div>
                  </div>
                  <div className="flex-1 text-right min-w-0">
                    <div className="flex items-center justify-end gap-1 mb-0">
                       {theme.price === 0 && <span className="px-1 py-0.5 rounded-md bg-green-500/10 text-[7px] font-bold text-green-600 uppercase tracking-tighter shadow-xs">Free</span>}
                       <h3 className="text-[14px] font-black text-slate-900 truncate">{theme.name}</h3>
                    </div>
                    <p className="text-[9px] font-bold text-slate-500 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                      {theme.id === 'default' ? 'ستایلێ ئەسلیێ یاریێ' : theme.isHeritage ? 'ھونەرێ رەسەن یێ کوردی' : 'ستایلەکێ نوی بۆ یارێ'}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center">
                    <div className="flex items-center justify-end gap-2">
                      {unlockedThemes.includes(theme.id) ? (
                        <button
                          onClick={() => { triggerHaptic(10); onEquipTheme(theme.id); }}
                          className={`px-3 py-1 rounded-md font-bold text-[11px] transition-all ${currentTheme === theme.id ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          {currentTheme === theme.id ? 'چالاکە' : 'بکاربینە'}
                        </button>
                      ) : (
                        <div className="relative">
                          <AnimatePresence>
                            {(showThemeEffect === theme.id) && (
                              <motion.div
                                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                animate={{ opacity: 1, y: -45, scale: 1.1 }}
                                exit={{ opacity: 0 }}
                                className="absolute -top-10 right-0 pointer-events-none flex items-center gap-1.5 whitespace-nowrap z-120"
                              >
                                <span className="text-[#ef4444] font-black text-xl drop-shadow-[0_2px_10px_rgba(239,68,68,0.4)]">
                                  -{toKuDigits(theme.price)}
                                </span>
                                <div className="w-4 h-4 flex items-center justify-center text-[#ef4444] scale-90">
                                   {theme.currency === 'zer' ? <ZerIcon /> : (theme.currency === 'derhem' ? <DerhemIcon /> : <FilsIcon />)}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <button
                            onClick={() => { 
                              const currentBalance = theme.currency === 'zer' ? zer : (theme.currency === 'derhem' ? derhem : fils);
                              if (currentBalance >= theme.price) {
                                triggerHaptic(10); 
                                playPurchaseSound?.();
                                onPurchase({ ...theme, type: 'theme' }); 
                                setShowThemeEffect(theme.id);
                                setTimeout(() => setShowThemeEffect(null), 2000);
                              } else {
                                triggerHaptic([50, 30, 50]);
                              }
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-white hover:brightness-110 transition-all shadow-md ${( (theme.currency === 'zer' ? zer : (theme.currency === 'derhem' ? derhem : fils)) >= theme.price) ? 'bg-emerald-500' : 'bg-slate-300 opacity-50 cursor-not-allowed'}`}
                          >
                            <div className="flex flex-col items-center leading-none">
                              <span className="text-[13px] font-black">
                                {theme.price === 0 ? 'خۆڕایی' : toKuDigits(theme.price || 0)}
                              </span>
                            </div>
                            {theme.price > 0 && (
                              <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                                {theme.currency === 'zer' ? <ZerIcon /> : (theme.currency === 'derhem' ? <DerhemIcon /> : <FilsIcon />)}
                              </div>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <PaymentGatewayModal 
        isOpen={gatewayOpen} 
        onClose={() => setGatewayOpen(false)} 
        item={selectedOffer}
        onComplete={handleGatewayComplete}
      />
    </div>
  );
}
