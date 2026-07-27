import React, { useEffect, useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const OnboardingOverlay = ({ steps, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    let timeout;
    const updateTarget = () => {
      const step = steps[currentStep];
      if (!step) return;
      const el = document.getElementById(step.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      } else {
        // Retry if element not found yet
        timeout = setTimeout(updateTarget, 100);
      }
    };

    updateTarget();
    window.addEventListener('resize', updateTarget);
    return () => {
      if (timeout) clearTimeout(timeout);
      window.removeEventListener('resize', updateTarget);
    };
  }, [currentStep, steps]);

  if (!targetRect || !steps[currentStep]) return null;

  const step = steps[currentStep];

  const handleNext = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (currentStep < steps.length - 1) {
      setCurrentStep(c => c + 1);
    } else {
      if (onComplete) onComplete();
    }
  };

  const padding = 6;
  const tTop = targetRect.top - padding;
  const tLeft = targetRect.left - padding;
  const tWidth = targetRect.width + padding * 2;
  const tHeight = targetRect.height + padding * 2;
  const radius = 24; // rounded-full approximation

  const isPositionTop = step.position === 'top';

  return (
    <div className="fixed inset-0 z-9999 pointer-events-auto font-rabar flex items-center justify-center">
      {/* SVG Mask for Dimming */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id="cutout-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect x={tLeft} y={tTop} width={tWidth} height={tHeight} rx={radius} fill="black" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.85)" mask="url(#cutout-mask)" />
      </svg>

      {/* Click Blocker outside cutout */}
      <div className="absolute inset-0 z-10" onClick={handleNext} />

      {/* The Cutout Interactive Area */}
      <div 
        className="absolute z-20 cursor-pointer"
        style={{ top: tTop, left: tLeft, width: tWidth, height: tHeight, borderRadius: radius }}
        onClick={(e) => {
           const el = document.getElementById(step.targetId);
           if (el) el.click();
           handleNext(e);
        }}
      >
        <span className="absolute inset-0 rounded-full animate-ping bg-white opacity-20"></span>
      </div>

      {/* Absolute positioned hand pointing exactly at the target cutout */}
      <Motion.div
        className="absolute z-40 pointer-events-none drop-shadow-lg flex justify-center"
        style={{
          left: tLeft + (tWidth / 2),
          top: isPositionTop ? tTop - 65 : tTop + tHeight + 5,
          transform: 'translateX(-50%)'
        }}
        animate={{ y: isPositionTop ? [0, 15, 0] : [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <span className={`text-5xl inline-block ${isPositionTop ? 'rotate-180' : ''}`}>👆</span>
      </Motion.div>

      {/* Coachmark Text Card */}
      <Motion.div 
        key={currentStep}
        initial={{ opacity: 0, scale: 0.9, y: isPositionTop ? 20 : -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="absolute inset-x-0 mx-auto z-30 flex flex-col items-center pointer-events-none px-6"
        style={{
          top: isPositionTop ? 'auto' : tTop + tHeight + 70,
          bottom: isPositionTop ? window.innerHeight - tTop + 70 : 'auto',
          width: '100%',
          maxWidth: '400px'
        }}
      >

        <div className="bg-white dark:bg-mono-900 p-6 rounded-md shadow-2xl border border-mono-200 dark:border-mono-800 flex flex-col items-center text-center w-full relative overflow-hidden transition-colors duration-300">
          <h3 className="font-black text-xl mb-2 text-primary">{step.title}</h3>
          <p className="text-[14px] font-medium text-mono-600 dark:text-mono-300 leading-relaxed mb-6">{step.text}</p>
          
          <div className={`flex items-center w-full ${steps.length > 1 ? 'justify-between' : 'justify-center'}`}>
            {steps.length > 1 && (
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'bg-primary scale-125' : 'bg-mono-200 dark:bg-mono-700'}`} />
                ))}
              </div>
            )}
            
            <button 
               onClick={handleNext} 
               className="pointer-events-auto bg-primary text-white px-8 py-2.5 rounded-md font-black text-[15px] shadow-md shadow-primary/30 active:scale-95 transition-all hover:bg-primary/90 flex items-center justify-center min-w-30"
            >
               {currentStep < steps.length - 1 ? 'بەردەوامبە' : 'تێگەهشتم'}
            </button>
          </div>
        </div>

      </Motion.div>
    </div>
  );
};

export default OnboardingOverlay;
