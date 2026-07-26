import React from 'react';
import { Share, MoreHorizontal, ChevronDown, PlusSquare, X, Bookmark, Copy } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

// SVG for the share icon (upward arrow in box) used as a standalone or in menus.
const ShareIconSvg = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 3.33333V13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 3.33333L6.66667 6.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 3.33333L13.3333 6.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.1667 9.16667H15C16.1046 9.16667 17 10.0621 17 11.1667V15.8333C17 16.9379 16.1046 17.8333 15 17.8333H5C3.89543 17.8333 3 16.9379 3 15.8333V11.1667C3 10.0621 3.89543 9.16667 5 9.16667H5.83333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// SVG for the 'v' chevron down icon, highlighted in Step 3.
const ChevronDownSvg = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// --- Step 1 Illustration: 3 Dots ---
const Step1Illustration = () => (
  <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 mb-4 shadow-inner">
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-800 text-sm w-full max-w-sm mx-auto">
      <span className="font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap">
        peyvokgame.com
      </span>
      <button className="flex items-center justify-center p-2 rounded-full border-2 border-red-500 bg-red-100/50 text-red-600 focus:outline-none shadow-md">
        <MoreHorizontal className="w-5 h-5" />
      </button>
    </div>
    <p className="text-gray-700 text-center text-sm mt-3 leading-relaxed">
      ل سەر ئایکۆنا سێ خالان (...) کلیک بکە.
    </p>
  </div>
);

// --- Step 2 Illustration: Share (upward arrow) ---
const Step2Illustration = () => (
  <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 mb-4 shadow-inner">
    <div className="w-full max-w-sm mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
      {/* Mock Menu */}
      <div className="p-2 space-y-1">
        {/* Unhighlighted item */}
        <div className="flex items-center gap-3 p-3 text-gray-500 rounded-md">
          <Bookmark className="w-5 h-5" />
          <span className="text-sm font-medium">Add to Bookmarks</span>
        </div>
        {/* Highlighted item - Share icon [↑] */}
        <div className="flex items-center gap-3 p-3 text-red-700 bg-red-100/50 rounded-md border-2 border-red-300">
          <ShareIconSvg />
          <span className="text-sm font-semibold">Share</span>
        </div>
      </div>
    </div>
    <p className="text-gray-700 text-center text-sm mt-3 leading-relaxed">
      هەڵبژاردەیا (Share) هەڵبژێرە.
    </p>
  </div>
);

// --- Step 3 Illustration: View More (down chevron) ---
const Step3Illustration = () => (
  <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 mb-4 shadow-inner">
    <div className="w-full max-w-sm mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
      {/* Mock Menu, Step 2 Share and Step 3 View More shown together for context */}
      <div className="p-2 space-y-1">
        {/* Step 2 item: Share icon [↑] - already selected context */}
        <div className="flex items-center gap-3 p-3 text-red-700 bg-red-100/50 rounded-md">
          <ShareIconSvg />
          <span className="text-sm font-semibold">Share</span>
        </div>
        {/* Step 3 item - Downward Chevron [v] */}
        <div className="flex items-center gap-3 p-3 text-red-700 bg-red-100/50 rounded-md border-2 border-red-300 shadow-md">
          <ChevronDownSvg />
          <span className="text-sm font-semibold">View More</span>
        </div>
      </div>
    </div>
    <p className="text-gray-700 text-center text-sm mt-3 leading-relaxed">
      لێ بگەڕە و ل سەر (View More) کلیک بکە.
    </p>
  </div>
);

// --- Step 4 Illustration: Add to Home Screen (plus in square) ---
const Step4Illustration = () => (
  <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 mb-4 shadow-inner">
    <div className="w-full max-w-sm mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
      {/* Mock Menu */}
      <div className="p-2 space-y-1">
        {/* Highlighted item - Plus icon [+] */}
        <div className="flex items-center gap-3 p-3 text-red-700 bg-red-100/50 rounded-md border-2 border-red-300">
          <PlusSquare className="w-6 h-6" />
          <span className="text-sm font-semibold">Add to Home Screen</span>
        </div>
        {/* Dummy unhighlighted item */}
        <div className="flex items-center gap-3 p-3 text-gray-500 rounded-md">
          <Copy className="w-5 h-5" />
          <span className="text-sm font-medium">Copy Link</span>
        </div>
      </div>
    </div>
    <p className="text-gray-700 text-center text-sm mt-3 leading-relaxed">
      هەڵبژاردەیا (Add to Home Screen) هەڵبژێرە.
    </p>
  </div>
);

const InstallGuideModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <Motion.div
            className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-lg border border-gray-100 relative overflow-hidden"
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
          >
            {/* --- Header Section --- */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-950 flex items-center gap-3">
                <span className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                  <ShareIconSvg />
                </span>
                دابەزاندنا یاریێ ل سەر ئایفۆن (Safari)
              </h2>
              <button
                className="p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 focus:outline-none transition-all"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* --- Installation Instructions Content --- */}
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
              <Step1Illustration />
              <Step2Illustration />
              <Step3Illustration />
              <Step4Illustration />
            </div>

            {/* --- Footer Section --- */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-gray-600 text-xs text-center">
                ئەڤ فێرکارییە تەنێ بۆ وێبگەڕێ سەفاری (Safari) یە ل سەر مۆبایلێن ئایفۆن.
              </p>
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallGuideModal;
