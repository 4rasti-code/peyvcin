import React from 'react';
import { motion as Motion } from 'framer-motion';
import { toKuDigits } from '../utils/formatters';

const KurdishSunLoader = ({ progress = 0, statusText = null }) => {
  // Generate dynamic Kurdish status text if none is provided
  const getStatusText = (p) => {
    if (statusText) return statusText;
    if (p < 20) return 'گرێدان ب سێرڤەران...';
    if (p < 40) return 'پشکنینا داتایێن یاریزانان...';
    if (p < 60) return 'بارکرنا تابلۆیا یاریێ...';
    if (p < 80) return 'ئامادەکرنا فۆنت و دیزاینان...';
    if (p < 99) return 'دوماهیک...';
    return 'ئامادەیە!';
  };
  const currentStatus = getStatusText(progress);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Modern Progress Section */}
      <div className="w-80 flex flex-col items-center gap-2">
        {/* Status Text & Percentage Layout */}
        <div className="flex w-full items-center justify-between px-2">
            <span className="text-sm font-bold text-yellow-600 dark:text-yellow-500/90 uppercase font-rabar tracking-wider">
                چاڤەڕێبە...
            </span>
            <span className="text-xl font-black text-yellow-500 tabular-nums font-mono drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" dir="ltr">
                {toKuDigits(Math.round(progress))}٪
            </span>
        </div>

        {/* The Track */}
        <div className="w-full h-4 bg-white/5 dark:bg-black/20 rounded-full overflow-hidden border border-white/10 dark:border-white/5 relative shadow-inner p-[2px]">
          {/* The Filling Bar */}
          <Motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 40, damping: 15 }}
            className="h-full rounded-full bg-linear-to-r from-yellow-600 via-yellow-400 to-yellow-200 shadow-[0_0_15px_rgba(234,179,8,0.6)]"
          />
        </div>

        {/* Subtle sub-text based on progress */}
        <div className="h-6 mt-3 flex items-center justify-center">
            <Motion.span
              key={currentStatus}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 0.5, y: 0 }}
              className="text-xs text-mono-500 dark:text-mono-400 font-medium font-vazirmatn uppercase tracking-wide"
            >
              {currentStatus}
            </Motion.span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(KurdishSunLoader);


