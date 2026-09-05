// Dispatch a custom event so the GlobalConfetti component (react-confetti-explosion)
// handles the hardware-accelerated CSS fireworks without blocking the UI thread.
export const fireConfetti = (options = {}) => {
  window.dispatchEvent(new CustomEvent('fire-confetti', { detail: options }));
};

export const resetConfetti = () => {
  // react-confetti-explosion unmounts automatically when done, so no manual reset is needed.
};
