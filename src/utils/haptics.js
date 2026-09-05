import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

/**
 * Trigger a tactile haptic pulse on supported devices.
 * @param {number | number[]} pattern - Duration in ms or a vibration pattern array.
 */
export const triggerHaptic = async (pattern = 10, force = false) => {
  // Global setting check
  if (typeof window !== 'undefined' && localStorage.getItem('peyvchin_haptic_enabled') === 'false') return;

  // Block generic UI pulses (5ms, 10ms) unless explicitly forced by the user's whitelist
  if ((pattern === 10 || pattern === 5) && !force) {
    return;
  }
  if (Capacitor.isNativePlatform()) {
    try {
      if (Array.isArray(pattern)) {
        // Since Haptics.vibrate only accepts a single duration, for patterns we can use impact or just vibrate the first element for a simple pulse
        // Wait, Capacitor Haptics does not support arrays for vibrate on all platforms well without a custom plugin, but we can do a fallback
        // Or we just use Haptics.impact({ style: ImpactStyle.Heavy }) for heavy arrays like [50, 50, 100]
        if (pattern.length >= 3) {
           await Haptics.impact({ style: ImpactStyle.Heavy });
        } else {
           await Haptics.vibrate({ duration: pattern[0] });
        }
      } else {
        // Single duration
        if (pattern > 30) {
           await Haptics.impact({ style: ImpactStyle.Medium });
        } else {
           await Haptics.impact({ style: ImpactStyle.Light });
        }
      }
    } catch (e) {
      console.warn("Native haptics failed:", e);
    }
    return;
  }

  // Web fallback
  if (typeof window !== 'undefined' && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors
    }
  }
};
