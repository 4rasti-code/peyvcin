import confetti from 'canvas-confetti';

// Create a globally shared, hardware-accelerated confetti instance using a Web Worker.
// This prevents main-thread blocking (lag) during React state updates, crucial for mobile (Capacitor) performance.
export const fireConfetti = confetti.create(undefined, {
  useWorker: true,
  resize: true
});

export const resetConfetti = () => {
  confetti.reset();
  fireConfetti.reset();
};
