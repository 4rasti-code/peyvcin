import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalConfetti() {
  const [explosions, setExplosions] = useState([]);

  useEffect(() => {
    const handleFire = (e) => {
      const options = e.detail || {};
      const id = Date.now() + Math.random();
      const newExplosion = {
        id,
        colors: options.colors || ['#FFD700', '#ffffff', '#3b82f6', '#facc15'],
        particleCount: options.particleCount || 40,
        // Calculate offset if origin is provided (0-1 range). Default is center.
        yOffset: options.origin?.y ? (options.origin.y - 0.5) * window.innerHeight : 0,
        xOffset: options.origin?.x ? (options.origin.x - 0.5) * window.innerWidth : 0,
      };
      setExplosions(prev => [...prev, newExplosion]);

      // Auto clear after animation completes
      setTimeout(() => {
        setExplosions(prev => prev.filter(e => e.id !== id));
      }, 3000);
    };
    
    window.addEventListener('fire-confetti', handleFire);
    return () => window.removeEventListener('fire-confetti', handleFire);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden" style={{ zIndex: 9999 }}>
      <AnimatePresence>
        {explosions.map(exp => (
          <ConfettiBurst key={exp.id} explosion={exp} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ConfettiBurst({ explosion }) {
  // Pre-calculate randomized particles to avoid recalculation on render
  const [particles] = useState(() => 
    Array.from({ length: explosion.particleCount }).map((_, i) => {
      const angle = (Math.random() * Math.PI * 2);
      const velocity = 200 + Math.random() * 400;
      const size = 6 + Math.random() * 8;
      const color = explosion.colors[Math.floor(Math.random() * explosion.colors.length)];
      const rot = Math.random() * 360;
      const dir = Math.random() > 0.5 ? 1 : -1;
      
      return { id: i, angle, velocity, size, color, rot, dir };
    })
  );

  return (
    <div 
      className="absolute" 
      style={{ 
        transform: `translate(${explosion.xOffset}px, ${explosion.yOffset}px)` 
      }}
    >
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, rotate: p.rot, scale: 0, opacity: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.velocity,
            y: Math.sin(p.angle) * p.velocity + 300, // Gravity pull
            rotate: p.rot + (720 * p.dir),
            scale: 1,
            opacity: [1, 1, 0]
          }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            boxShadow: '0 0 4px rgba(0,0,0,0.2)'
          }}
        />
      ))}
    </div>
  );
}
