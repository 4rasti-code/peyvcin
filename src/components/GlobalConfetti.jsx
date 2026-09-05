import React, { useState, useEffect } from 'react';
import ConfettiExplosion from 'react-confetti-explosion';

export default function GlobalConfetti() {
  const [explosions, setExplosions] = useState([]);

  useEffect(() => {
    const handleFire = (e) => {
      const options = e.detail || {};
      const newExplosion = {
        id: Date.now() + Math.random(),
        colors: options.colors || ['#FFD700', '#ffffff', '#3b82f6', '#facc15'],
        particleCount: options.particleCount || 60,
      };
      setExplosions(prev => [...prev, newExplosion]);
    };
    
    window.addEventListener('fire-confetti', handleFire);
    return () => window.removeEventListener('fire-confetti', handleFire);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] flex items-start justify-center pt-[30vh]">
      {explosions.map(exp => (
        <ConfettiExplosion
          key={exp.id}
          force={0.8}
          duration={3000}
          particleCount={exp.particleCount}
          width={1600}
          colors={exp.colors}
          onComplete={() => {
            setExplosions(prev => prev.filter(e => e.id !== exp.id));
          }}
        />
      ))}
    </div>
  );
}
