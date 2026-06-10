import React, { useEffect, useState } from 'react';
import { FilsIcon, DerhemIcon, DinarIcon, HintIcon, MagnetIcon, SkipIcon } from './CurrencyIcon';
import { playCoinSfx } from '../utils/audio';

const CoinAnimation = ({ trigger, isDaily, amount = 0, type = 'fils' }) => {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    if (trigger) {
      // Dynamic Scaling: Number of coins based on reward amount
      let length = Math.min(100, Math.max(15, Math.floor((amount || 100) / 10)));
      if (isDaily) length = Math.max(length, 45); // Daily minimum boost
      if (['hint', 'magnet', 'skip'].includes(type)) length = Math.min(amount > 0 ? amount : 1, 15); // Exact amount for powerups
      
      // Multi-Play Sound Burst Logic
      const soundCount = Math.min(12, Math.max(3, Math.floor(length / 7)));
      for (let i = 0; i < soundCount; i++) {
        setTimeout(() => {
          playCoinSfx();
        }, i * (isDaily ? 50 : 80));
      }
      
      const newCoins = Array.from({ length }).map((_, i) => ({
        id: Date.now() + i,
        delay: i * (isDaily ? 0.04 : 0.06),
        x: Math.random() * 160 - 80, 
        y: Math.random() * 160 - 80,
      }));

      const animationTimer = setTimeout(() => {
        setCoins(newCoins);
      }, 0);
      
      const cleanupTimer = setTimeout(() => {
        setCoins([]);
      }, 3500); // Clear after animation

      return () => {
        clearTimeout(animationTimer);
        clearTimeout(cleanupTimer);
      };
    }
  }, [trigger, isDaily, amount, type]);

  if (coins.length === 0) return null;

  const getTargetPosition = () => {
    let elementId = `topbar-${type}`;
    if (['hint', 'magnet', 'skip'].includes(type) && !document.getElementById(elementId)) {
      elementId = `btn-${type}`;
    }

    const el = document.getElementById(elementId);
    if (el) {
      const rect = el.getBoundingClientRect();
      return {
        targetX: rect.left + rect.width / 2 - window.innerWidth / 2,
        targetY: rect.top + rect.height / 2 - window.innerHeight / 2
      };
    }
    
    return {
      targetX: window.innerWidth * 0.42, 
      targetY: -window.innerHeight * 0.46
    };
  };

  const { targetX, targetY } = getTargetPosition();

  const getIcon = () => {
    switch (type) {
      case 'derhem': return <DerhemIcon size={44} className="hover:scale-110 transition-transform" />;
      case 'dinar': return <DinarIcon size={44} className="hover:scale-110 transition-transform" />;
      case 'hint': return <HintIcon size={44} animate={true} className="hover:scale-110 transition-transform drop-shadow-md" />;
      case 'magnet': return <MagnetIcon size={44} animate={true} className="hover:scale-110 transition-transform drop-shadow-md" />;
      case 'skip': return <SkipIcon size={44} animate={true} className="hover:scale-110 transition-transform drop-shadow-md" />;
      default: return <FilsIcon size={44} className="hover:scale-110 transition-transform" />;
    }
  };

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center pointer-events-none">
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="coin-icon"
          style={{
            '--target-x': `${targetX}px`,
            '--target-y': `${targetY}px`,
            animationDelay: `${coin.delay}s`,
            left: `calc(50% + ${coin.x}px)`,
            top: `calc(50% + ${coin.y}px)`
          }}
        >
          <div className="w-12 h-12 flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
            {getIcon()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CoinAnimation;
