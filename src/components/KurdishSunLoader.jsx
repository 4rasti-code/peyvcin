import React from 'react';
import { motion } from 'framer-motion';

const KurdishSunLoader = ({ size = 60, color = "#FFD700" }) => {
  return (
    <div className="flex items-center justify-center p-4">
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]"
      >
        {/* Central Disk */}
        <circle cx="50" cy="50" r="18" fill={color} />
        
        {/* 21 Rays of the Kurdish Sun */}
        {Array.from({ length: 21 }).map((_, i) => {
          const angle = (i * 360) / 21;
          return (
            <motion.path
              key={i}
              d="M50 15 L54 30 L46 30 Z"
              fill={color}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
              transform={`rotate(${angle}, 50, 50)`}
            />
          );
        })}
      </motion.svg>
    </div>
  );
};

export default KurdishSunLoader;
