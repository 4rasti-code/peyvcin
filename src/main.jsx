import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContext';
import { PresenceProvider } from './context/PresenceContext';
import { AudioProvider } from './context/AudioContext';
import { GameProvider } from './context/GameContext';
import { MultiplayerProvider } from './context/MultiplayerContext';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import App from './App.jsx'

const renderApp = () => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <GlobalErrorBoundary>
        <Router>
          <AuthProvider>
            <PresenceProvider>
              <AudioProvider>
                <GameProvider>
                  <MultiplayerProvider>
                    <App />
                  </MultiplayerProvider>
                </GameProvider>
              </AudioProvider>
            </PresenceProvider>
          </AuthProvider>
        </Router>
      </GlobalErrorBoundary>
    </StrictMode>,
  );
};

// Ensure the splash screen animation completes its 2s loops without getting cut off
const splashStart = window.__SPLASH_START_TIME__ || Date.now();
const elapsed = Date.now() - splashStart;
const loopDuration = 2000; 

let waitTime = 0;
if (elapsed < loopDuration) {
    waitTime = loopDuration - elapsed; // Wait for the first loop to finish
} else {
    const remainder = elapsed % loopDuration;
    if (remainder > 50) {
        waitTime = loopDuration - remainder; // Wait for the current loop to finish
    }
}

if (waitTime > 0) {
    setTimeout(renderApp, waitTime);
} else {
    renderApp();
}

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW reg fail:', err));
  });
}
