/**
 * Trigger a tactile haptic pulse on supported devices.
 * @param {number | number[]} pattern - Duration in ms or a vibration pattern array.
 */
export const triggerHaptic = (pattern = 10) => {
  if (typeof window !== 'undefined' && "vibrate" in navigator) {
    // Prevent browser intervention error by checking user interaction first
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) {
      return; 
    }
    
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors
    }
  }
};
