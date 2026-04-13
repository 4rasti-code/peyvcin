import React, { createContext, useContext, useState, useEffect } from 'react';

const MusicContext = createContext({ 
  volume: 0.4, 
  setVolume: () => {},
  sfxVolume: 0.5,
  setSfxVolume: () => {},
  isSfxEnabled: true,
  setIsSfxEnabled: () => {},
  playSound: () => {}
});

export const MusicProvider = ({ children }) => {
  const [volume, setVolume] = useState(() => {
    return parseFloat(localStorage.getItem('peyvchin_music_volume')) || 0.4;
  });
  
  const [sfxVolume, setSfxVolume] = useState(() => {
    return parseFloat(localStorage.getItem('peyvchin_sfx_volume')) || 0.5;
  });

  const [isSfxEnabled, setIsSfxEnabled] = useState(() => {
    return localStorage.getItem('peyvchin_sfx_enabled') !== 'false';
  });

  const handleSetVolume = (v) => {
    setVolume(v);
    localStorage.setItem('peyvchin_music_volume', v);
  };

  const handleSetSfxVolume = (v) => {
    setSfxVolume(v);
    localStorage.setItem('peyvchin_sfx_volume', v);
  };

  const handleSetIsSfxEnabled = (enabled) => {
    setIsSfxEnabled(enabled);
    localStorage.setItem('peyvchin_sfx_enabled', String(enabled));
  };

  const playSound = (type) => {
    // SFX Disabled per Revert request
    console.log("SFX: Play requested but disabled by revert", type);
  };

  return (
    <MusicContext.Provider value={{ 
      volume, 
      setVolume: handleSetVolume,
      sfxVolume,
      setSfxVolume: handleSetSfxVolume,
      isSfxEnabled,
      setIsSfxEnabled: handleSetIsSfxEnabled,
      playSound
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);
