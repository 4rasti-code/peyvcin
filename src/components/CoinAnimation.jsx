import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { FilsIcon, DerhemIcon, DinarIcon, HintIcon, MagnetIcon, SkipIcon, XPIcon, SpinTicketIcon } from './CurrencyIcon';
import MysteryBoxIcon from './MysteryBoxIcon';
import { playCoinSfx, playMagnetSfx, playPopSfx, playSuccessSfx } from '../utils/audio';

const CoinAnimation = ({ trigger, isDaily, amount = 0, type = 'fils' }) => {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    if (trigger) {
      // Fixed to 10 coins for currencies, or exact amount for powerups
      let length = 10;
      if (['hint', 'magnet', 'skip', 'spinTicket', 'mystery_box'].includes(type)) {
        length = amount > 0 ? amount : 1;
      } else if (type === 'xp') {
        length = 10; // XP flies as 10 particles for a burst effect
      }
      
      let soundTimers = [];
      const newCoins = Array.from({ length }).map((_, i) => {
        const delayInSeconds = i * 0.15; // 0.15s gap for optimal rhythm
        
        // Play sound exactly when the coin's delay finishes and it starts animating
        const timer = setTimeout(() => {
          if (type === 'magnet') {
            playMagnetSfx();
          } else if (type === 'hint' || type === 'skip' || type === 'spinTicket') {
            playPopSfx();
          } else if (type === 'xp') {
            playSuccessSfx();
          } else {
            playCoinSfx();
          }
        }, delayInSeconds * 1000);
        soundTimers.push(timer);
        
        // BUMP effect for all flying items
        const bumpTime = type === 'spinTicket' ? 1500 : 900;
        const bumpTimer = setTimeout(() => {
          let elementId = `topbar-${type}`;
          if (type === 'spinTicket') {
            elementId = `nav-lucky-wheel`;
          } else if (type === 'mystery_box') {
            elementId = `nav-store`;
          } else if (type === 'xp') {
            elementId = `xp-progress`;
          }
          
          const targetEl = document.getElementById(elementId);
          if (targetEl) {
            targetEl.classList.remove('animate-wheel-bump');
            void targetEl.offsetWidth; // Trigger reflow so consecutive coins restart the animation
            targetEl.classList.add('animate-wheel-bump');
            setTimeout(() => targetEl.classList.remove('animate-wheel-bump'), 500);
          }
          
          // Notify TopAppBar or other listeners to increment visual counters exactly on impact
          window.dispatchEvent(new CustomEvent('reward-coin-hit', { detail: { type } }));
        }, delayInSeconds * 1000 + bumpTime);
        soundTimers.push(bumpTimer);
        
        return {
          id: Date.now() + i,
          delay: delayInSeconds,
          x: Math.random() * 40 - 20, // Slight natural scatter
          y: Math.random() * 40 - 20,
        };
      });

      const animationTimer = setTimeout(() => {
        setCoins(newCoins);
      }, 0);
      
      const cleanupTimer = setTimeout(() => {
        setCoins([]);
      }, 4500); // Clear after animation

      return () => {
        clearTimeout(animationTimer);
        clearTimeout(cleanupTimer);
        soundTimers.forEach(timer => clearTimeout(timer));
      };
    } else if (coins.length > 0) {
      const timer = setTimeout(() => setCoins([]), 0);
      return () => clearTimeout(timer);
    }
  }, [trigger, isDaily, amount, type, coins.length]);

  if (!trigger && coins.length === 0) return null;
  const getTargetPosition = () => {
    let elementId = `topbar-${type}`;
    if (type === 'spinTicket') {
      elementId = `nav-lucky-wheel`;
    } else if (type === 'mystery_box') {
      elementId = `nav-store`;
    } else if (type === 'xp') {
      elementId = `xp-progress`;
    }

    const el = document.getElementById(elementId);
    if (el) {
      const rect = el.getBoundingClientRect();
      let offsetY = 0;
      let offsetX = 0;
      if (type === 'spinTicket') {
        offsetY = -25; // User requested it to fly slightly higher
        offsetX = -15; // User requested it to fly slightly to the left
      }
      
      return {
        targetX: rect.left + rect.width / 2 - window.innerWidth / 2 + offsetX,
        targetY: rect.top + rect.height / 2 - window.innerHeight / 2 + offsetY
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
      case 'hint': return <HintIcon size={44} animate={true} className="hover:scale-110 transition-transform" />;
      case 'magnet': return <MagnetIcon size={44} animate={true} className="hover:scale-110 transition-transform" />;
      case 'skip': return <SkipIcon size={44} animate={true} className="hover:scale-110 transition-transform" />;
      case 'spinTicket': return <SpinTicketIcon size={44} animate={true} className="hover:scale-110 transition-transform" />;
      case 'mystery_box': return <div className="w-11 h-11"><MysteryBoxIcon /></div>;
      case 'xp': return <XPIcon size={44} className="hover:scale-110 transition-transform" />;
      default: return <FilsIcon size={44} className="hover:scale-110 transition-transform" />;
    }
  };

  const isPowerup = ['hint', 'magnet', 'skip', 'xp', 'spinTicket', 'mystery_box'].includes(type);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center pointer-events-none">
      {coins.map((coin) => (
        <div
          key={coin.id}
          className={type === 'spinTicket' ? "ticket-container" : (isPowerup ? "powerup-container" : "coin-icon")}
          style={{
            '--target-x': `${targetX - coin.x}px`,
            '--target-y': `${targetY - coin.y}px`,
            animationDelay: `${coin.delay}s`,
            left: `calc(50% + ${coin.x}px)`,
            top: `calc(50% + ${coin.y}px)`
          }}
        >
          {isPowerup ? (
             <div className="powerup-inner w-12 h-12 flex items-center justify-center relative z-10">
               {getIcon()}
             </div>
          ) : (
             <div className="w-12 h-12 flex items-center justify-center relative z-10">
               {getIcon()}
             </div>
          )}
        </div>
      ))}
    </div>,
    document.body
  );
};

export default CoinAnimation;
