import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilsIcon, DerhemIcon, ZerIcon } from './CurrencyIcon';
import { toKuDigits } from '../utils/formatters';
import { playCoinSfx } from '../utils/audio';

/**
 * CurrencyDecrementEffect
 * A premium feedback component that displays a floating "-X [Icon]" animation 
 * whenever the provided value decreases.
 */
const CurrencyDecrementEffect = ({ value, currency, children, className = "" }) => {
  const [changes, setChanges] = useState([]);
  const prevValue = useRef(null);

  useEffect(() => {
    // Skip initial run on mount to prevent false deductions on view switch
    if (prevValue.current === null) {
      prevValue.current = value;
      return;
    }

    const numericValue = Number(value) || 0;
    const previousNumericValue = Number(prevValue.current) || 0;

    // Only trigger if the change is a real decrease
    if (numericValue < previousNumericValue) {
      const diff = previousNumericValue - numericValue;
      const id = Date.now() + Math.random();
      
      // Play sound effect
      playCoinSfx();
      
      setChanges(prev => [...prev.slice(-2), { id, diff }]);
      
      // Auto-cleanup
      const timer = setTimeout(() => {
        setChanges(prev => prev.filter(c => c.id !== id));
      }, 2000);
      return () => clearTimeout(timer);
    }
    prevValue.current = value;
  }, [value]);

  const IconComponent = () => {
    const props = { className: "w-5 h-5", size: 20 };
    switch (currency) {
      case 'derhem': return <DerhemIcon {...props} />;
      case 'zer': return <ZerIcon {...props} />;
      case 'fils':
      default: return <FilsIcon {...props} />;
    }
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ isolation: 'isolate' }}>
      {children}
      
      {/* Animation Layer */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ zIndex: 9999 }}>
        <AnimatePresence mode="popLayout">
          {changes.map(change => (
            <motion.div
              key={change.id}
              initial={{ opacity: 0, y: 10, scale: 0.5, filter: 'blur(4px)' }}
              animate={{ 
                opacity: [0, 1, 1, 0], 
                y: -60, 
                scale: [0.5, 1.2, 1, 0.8],
                filter: 'blur(0px)'
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ 
                duration: 1.8, 
                times: [0, 0.2, 0.8, 1],
                ease: "easeOut" 
              }}
              className="absolute flex items-center gap-2 bg-linear-to-r from-red-500/20 to-transparent px-3 py-1 rounded-full border border-red-500/30 backdrop-blur-sm"
            >
              <span className="text-[#ff4d4d] font-black text-2xl drop-shadow-[0_0_10px_rgba(255,0,0,0.6)]">
                -{toKuDigits(change.diff)}
              </span>
              <div className="flex items-center justify-center drop-shadow-[0_0_5px_rgba(255,0,0,0.4)] brightness-125">
                 <IconComponent />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CurrencyDecrementEffect;
