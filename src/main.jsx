import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import { MusicProvider } from './components/MusicContext';
import { GameProvider } from './context/GameContext';
import GlobalErrorBoundary from './components/GlobalErrorBoundary'; // Branded Error Recovery
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <Router>
        <GameProvider>
          <MusicProvider>
            <App />
          </MusicProvider>
        </GameProvider>
      </Router>
    </GlobalErrorBoundary>
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW reg fail:', err));
  });
}
