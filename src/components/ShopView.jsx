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

const PowerUpCard = ({ item, onPurchase, canAfford }) => {
  const [showEffect, setShowEffect] = useState(false);

  return (
    <motion.button
      layout
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => { 
        if (canAfford) {
          triggerHaptic(10); 
          onPurchase(item); 
          setShowEffect(true);
          setTimeout(() => setShowEffect(false), 2000);
        } else {
          triggerHaptic([50, 30, 50]);
        }
      }}
      className="group relative w-full px-5 py-4 sm:px-6 sm:py-5 bg-[#0a0f1b]/60 rounded-[32px] border border-white/5 hover:bg-black/60 flex items-center gap-4 sm:gap-5 overflow-visible transition-all"
    >
      <div className={`w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-[24px] bg-linear-to-br ${item.color} flex items-center justify-center text-white shrink-0 relative z-10 transition-transform group-hover:scale-105 duration-300`}>
        <span className="material-symbols-outlined text-[32px] sm:text-[36px] drop-shadow-sm">{item.icon}</span>
      </div>
      <div className="flex-1 text-right min-w-0 relative z-10 pr-1 sm:pr-2">
        <h3 className="text-[20px] sm:text-[22px] font-black text-white mb-0.5 sm:mb-1 tracking-wide leading-tight">{item.name}</h3>
        <p className="text-[12px] sm:text-[13px] font-bold text-slate-300 leading-tight">{item.description}</p>
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
              <span className="text-[#ef4444] font-black text-xl drop-shadow-[0_2px_10px_rgba(239,68,68,0.4)] filter brightness-110">
                -{toKuDigits(item.price)}
              </span>
              <div className="w-5 h-5 flex items-center justify-center drop-shadow-md text-[#ef4444] scale-90">
                 {item.currency === 'derhem' ? <DerhemIcon /> : item.currency === 'zer' ? <ZerIcon /> : <FilsIcon />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className={`flex items-center gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-slate-900/80 border border-white/5 transition-all ${!canAfford ? 'opacity-50' : 'group-hover:scale-110'}`}>
          <div className="flex flex-col items-center leading-none">
            <span className={`text-[16px] sm:text-[18px] font-black ${!canAfford ? 'text-white/60' : 'text-primary'}`}>{toKuDigits(item.price || 0)}</span>
            <span className={`text-[8px] font-black uppercase tracking-widest opacity-60 ${!canAfford ? 'text-white/40' : 'text-primary'}`}>
              {item.currency === 'derhem' ? 'دەرهەم' : item.currency === 'zer' ? 'زێڕ' : 'فلس'}
            </span>
          </div>
          <div className={`w-5 h-5 flex items-center justify-center drop-shadow-md ${!canAfford ? 'opacity-40 grayscale' : 'text-primary'}`}>
            {item.currency === 'derhem' ? <DerhemIcon /> : item.currency === 'zer' ? <ZerIcon /> : <FilsIcon />}
          </div>
        </div>
      </div>
    </motion.button>
  );
};

const SpecialOfferCard = ({ item, onOpenGateway }) => (
  <motion.button
    layout
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => { triggerHaptic(10); onOpenGateway(item); }}
    className="group relative w-full p-6 sm:p-8 rounded-[32px] bg-linear-to-br from-yellow-300 via-amber-400 to-amber-600 border-4 border-yellow-200/60 flex flex-col gap-6 overflow- mb-6 shadow-[0_15px_40px_rgba(245,158,11,0.5),inset_0_4px_15px_rgba(255,255,255,0.7)]"
  >
    {/* Dynamic Shimmer Effect */}
    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 skew-x-12" />
    
    <div className="flex items-center justify-between w-full relative z-10 pt-2">
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Luxury Solid Icon */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[24px] sm:rounded-[32px] bg-white/30 flex items-center justify-center text-white shadow-[inset_0_4px_10px_rgba(255,255,255,0.8),0_10px_20px_rgba(180,83,9,0.3)] border border-white/60 group-hover:scale-105 transition-transform duration-500">
           <span className="material-symbols-outlined text-[48px] sm:text-[56px] drop-shadow-[0_2px_4px_rgba(180,83,9,0.4)]">auto_awesome</span>
        </div>
        
        <div className="text-right flex flex-col items-end">
          <h3 className="text-2xl sm:text-3xl font-black text-yellow-950 leading-tight drop-shadow-[0_2px_0_rgba(255,255,255,0.5)] pb-1">پاکێجا زێڕین</h3>
          <p className="text-[13px] font-black text-amber-900/80 tracking-widest leading-none mt-1">پێشنیارا تایبەت</p>
        </div>
      </div>

      {/* Price Tag */}
      <div className="flex flex-col items-center justify-center gap-0.5 bg-yellow-950/90 px-5 py-3 sm:px-6 sm:py-4 rounded-2xl border border-yellow-500/30 shadow-[0_4px_15px_rgba(180,83,9,0.4)] group-hover:shadow-[0_8px_20px_rgba(180,83,9,0.5)] transition-all">
         <span className="text-2xl sm:text-3xl font-black text-yellow-300 drop-shadow-md leading-none">${toKuDigits(item.price_usd || 0)}</span>
         <span className="text-[11px] font-bold text-yellow-300/70 tracking-wider mt-1">{toKuDigits(item.price_iqd || 0)} دینار</span>
      </div>
    </div>

    {/* Description / Content Box */}
    <div className="flex items-center bg-white/20 p-4 sm:p-5 rounded-2xl border border-white/50 shadow-[inset_0_2px_8px_rgba(180,83,9,0.15)] relative z-10 w-full group-hover:bg-white/30 transition-colors text-right">
       <span className="text-[13px] sm:text-[14px] font-bold text-yellow-950 leading-relaxed block w-full">{item.description}</span>
    </div>
  </motion.button>
);

export default function ShopView({ fils, derhem, zer, magnetCount, hintCount, skipCount, currentTheme, onPurchase, onPurchaseAvatar, onEquipAvatar, onEquipTheme, unlockedThemes = [], ownedAvatars = ['default'], equippedAvatar = 'default' }) {
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

      <div className="flex p-1.5 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 shadow-xl overflow- relative">
        {['powerups', 'avatars', 'themes'].map((tab) => (
          <button 
            key={tab}
            onClick={() => { 
                triggerHaptic(10); 
                playTabSound();
                setActiveTab(tab); 
            }} 
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-full transition-all duration-300 relative z-10 ${
              activeTab === tab 
                ? 'bg-primary text-black shadow-lg scale-[1.03]' 
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {tab === 'powerups' ? 'auto_fix_high' : tab === 'avatars' ? 'person' : 'palette'}
            </span>
            <span className="font-bold text-[13px] uppercase tracking-wider">
              {tab === 'powerups' ? 'ھاریکار' : tab === 'avatars' ? 'پەیڤچن' : 'نیشان'}
            </span>
          </button>
        ))}
      </div>

      <motion.div layout className="flex flex-col gap-5">
        <AnimatePresence mode="wait">
          {activeTab === 'powerups' && (
            <motion.div key="powerups" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex flex-col gap-5">
              <SpecialOfferCard item={SHOP_ITEMS.SPECIALS.find(s => s.id === 'premium_bundle')} onOpenGateway={openGateway} />
              <div className="grid grid-cols-1 gap-4">
                {SHOP_ITEMS.POWERUPS.map(item => (
                  <PowerUpCard key={item.id} item={item} onPurchase={onPurchase} canAfford={fils >= item.price} />
                ))}
              </div>
            </motion.div>
          )}
          {activeTab === 'avatars' && (
            <motion.div key="avatars" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="flex flex-col gap-5">
              {SHOP_ITEMS.AVATARS.map(avatar => (
                <motion.div
                  key={avatar.id}
                  className={`bg-white/5 backdrop-blur-xl p-7 rounded-2xl border border-white/10 flex items-center gap-7 transition-all ${ownedAvatars.includes(avatar.id) && equippedAvatar === avatar.id ? 'border-primary/50 ring-1 ring-primary/20' : ''}`}
                >
                  <div className="w-24 h-24 rounded-[20px] bg-white/10 border border-white/10 p-2 shrink-0 overflow-hidden relative group">
                    <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover rounded-[15px] animate-character-idle" />
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="text-2xl font-bold text-white mb-2">{avatar.name}</h3>
                    <p className="text-[13px] font-bold text-text-dim leading-snug opacity-90 mb-5">{avatar.description}</p>
                    <div className="flex items-center justify-end gap-5">
                      {ownedAvatars.includes(avatar.id) ? (
                        <button
                          onClick={() => { triggerHaptic(10); onEquipAvatar(avatar.id); }}
                          className={`px-8 py-3 rounded-full font-bold transition-all ${equippedAvatar === avatar.id ? 'bg-primary text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
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
                                <div className="w-5 h-5 flex items-center justify-center text-[#ef4444] scale-90">
                                   {avatar.currency === 'derhem' ? <DerhemIcon /> : <FilsIcon />}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <button
                            onClick={() => { 
                              if ((avatar.currency === 'derhem' ? derhem : fils) >= avatar.price) {
                                triggerHaptic(10); 
                                onPurchaseAvatar(avatar.id, avatar.price, avatar.currency); 
                                setShowAvatarEffect(avatar.id);
                                setTimeout(() => setShowAvatarEffect(null), 2000);
                              } else {
                                triggerHaptic([50, 30, 50]);
                              }
                            }}
                            className="flex items-center gap-3 px-6 py-3 rounded-full bg-primary text-black hover:brightness-110 transition-all shadow-lg"
                          >
                            <div className="flex flex-col items-center leading-none">
                              <span className="text-lg font-bold">{toKuDigits(avatar.price || 0)}</span>
                              <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{avatar.currency === 'derhem' ? 'دەرهەم' : 'فلس'}</span>
                            </div>
                            <div className="w-6 h-6 flex items-center justify-center shrink-0">
                               {avatar.currency === 'derhem' ? <DerhemIcon /> : <FilsIcon />}
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
          {activeTab === 'themes' && (
            <motion.div key="themes" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-5">
              {Object.values(THEMES).map(theme => (
                <motion.div
                  key={theme.id}
                  className={`p-7 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 transition-all flex items-center gap-7 group ${currentTheme === theme.id ? 'border-primary/50' : ''}`}
                >
                  <div 
                    className="w-20 h-20 rounded-[20px] border border-white/10 shrink-0 overflow-hidden relative shadow-lg"
                    style={{ background: theme.colors.background }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                       <span className="material-symbols-outlined text-4xl" style={{ color: theme.colors.primary }}>{theme.isHeritage ? 'auto_awesome' : 'palette'}</span>
                    </div>
                  </div>

                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-end gap-3 mb-2">
                       {theme.price === 0 && <span className="px-3 py-1 rounded-full bg-green-500/20 text-[10px] font-bold text-green-400 uppercase tracking-tighter">Free</span>}
                       <h3 className="text-2xl font-bold text-white">{theme.name}</h3>
                    </div>
                    <p className="text-[12px] font-bold text-white/50 mb-5 uppercase tracking-widest leading-relaxed">
                      {theme.id === 'default' ? 'ستایلێ ئەسلیێ یاریێ' : theme.isHeritage ? 'ھونەرێ رەسەن یێ کوردی' : 'ستایلەکێ نوی بۆ یاریێ'}
                    </p>

                    <div className="flex items-center justify-end gap-5">
                      {unlockedThemes.includes(theme.id) ? (
                        <button
                          onClick={() => { triggerHaptic(10); onEquipTheme(theme.id); }}
                          className={`px-8 py-3 rounded-full font-bold transition-all ${currentTheme === theme.id ? 'bg-primary text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
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
                                <div className="w-5 h-5 flex items-center justify-center text-[#ef4444] scale-90">
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
                                onPurchase({ ...theme, type: 'theme' }); 
                                setShowThemeEffect(theme.id);
                                setTimeout(() => setShowThemeEffect(null), 2000);
                              } else {
                                triggerHaptic([50, 30, 50]);
                              }
                            }}
                            className={`flex items-center gap-3 px-6 py-3 rounded-full text-black hover:brightness-110 transition-all shadow-lg ${theme.currency === 'zer' ? 'bg-primary' : (theme.currency === 'derhem' ? 'bg-slate-200' : 'bg-orange-200')}`}
                          >
                            <div className="flex flex-col items-center leading-none">
                              <span className="text-lg font-bold">
                                {theme.price === 0 ? 'خۆڕایی' : toKuDigits(theme.price || 0)}
                              </span>
                              {theme.price > 0 && (
                                <span className="text-[8px] font-black uppercase tracking-widest opacity-60">
                                  {theme.currency === 'zer' ? 'زێڕ' : (theme.currency === 'derhem' ? 'دەرهەم' : 'فلس')}
                                </span>
                              )}
                            </div>
                            {theme.price > 0 && (
                              <div className="w-6 h-6 flex items-center justify-center shrink-0">
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
