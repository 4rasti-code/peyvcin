import React, { useMemo, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, useSpring, useMotionValue, useTransform, animate } from 'framer-motion';

const FloatingLetter = ({ char, initialX, initialY, pulsePos }) => {
  // Movement springs - Low stiffness, High damping for "liquid" feel
  const springConfig = { damping: 35, stiffness: 12 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);
  const rotate = useSpring(0, springConfig);
  const opacity = useSpring(0.12, springConfig); // Slightly more opacity for bigger letters

  // Persistent drift animation (Organic Sway)
  useEffect(() => {
    const controlsX = animate(x, [0, 15, -15, 0], {
      duration: 12 + Math.random() * 8,
      repeat: Infinity,
      ease: "easeInOut"
    });
    const controlsY = animate(y, [0, -25, 25, 0], {
      duration: 15 + Math.random() * 10,
      repeat: Infinity,
      ease: "easeInOut"
    });
    const controlsRot = animate(rotate, [0, 8, -8, 0], {
      duration: 10 + Math.random() * 5,
      repeat: Infinity,
      ease: "easeInOut"
    });

    return () => {
      controlsX.stop();
      controlsY.stop();
      controlsRot.stop();
    };
  }, []);

  // Pulse (Fish Reaction) Logic
  useEffect(() => {
    if (!pulsePos) return;

    // Relative coordinates
    const nx = initialX / 100;
    const ny = initialY / 100;
    
    const dx = nx - pulsePos.x;
    const dy = ny - pulsePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If within interaction range
    if (distance < 0.45) {
      const force = (1 - distance / 0.45);
      
      // Calculate flee vector
      const fleeX = (dx / distance) * force * 130; 
      const fleeY = (dy / distance) * force * 130;
      
      // Calculate rotation - "face" away from the click
      const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI);

      // Trigger Flee Animation
      x.set(fleeX);
      y.set(fleeY);
      rotate.set(targetAngle + 90);
      opacity.set(0.35);

      // Smoothly return
      const timer = setTimeout(() => {
        x.set(0);
        y.set(0);
        rotate.set(0);
        opacity.set(0.12);
      }, 1500 + Math.random() * 1000);

      return () => clearTimeout(timer);
    }
  }, [pulsePos]);

  return (
    <motion.div
      className="absolute text-white font-black text-[14px] select-none font-rabar pointer-events-none"
      style={{ 
        left: `${initialX}%`, 
        top: `${initialY}%`,
        x,
        y,
        rotate,
        opacity
      }}
    >
      {char}
    </motion.div>
  );
};

const FloatingLetterBackground = forwardRef((props, ref) => {
  const [pulsePos, setPulsePos] = React.useState(null);
  
  const chars = ['ئا', 'ب', 'پ', 'ت', 'ج', 'د', 'ڕ', 'ز', 'ڤ', 'ڵ', 'ۆ', 'ێ', 'گ', 'چ', 'ژ', 'هـ'];
  
  // Adjusted density for medium small letters (40 letters)
  const letters = useMemo(() => {
    return [...Array(40)].map((_, i) => ({
      id: i,
      char: chars[i % chars.length],
      x: 2 + Math.random() * 96,
      y: 2 + Math.random() * 96
    }));
  }, []);

  // Expose pulse method
  useImperativeHandle(ref, () => ({
    pulse: (px, py) => {
      setPulsePos({ x: px, y: py, t: Date.now() });
    }
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#020617]">
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-blue-500/5 to-transparent pointer-none" />
      
      {letters.map((letter) => (
        <FloatingLetter
          key={letter.id}
          char={letter.char}
          initialX={letter.x}
          initialY={letter.y}
          pulsePos={pulsePos}
        />
      ))}
    </div>
  );
});

export default FloatingLetterBackground;
