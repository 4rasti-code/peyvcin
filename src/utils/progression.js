/**
 * RPG PROGRESSION SYSTEM CONSTANTS
 * 
 * Standardized Leveling: 100 XP per level as requested.
 */

const XP_CONSTANT = 100;
const XP_EXPONENT = 1.8;

/**
 * Calculates the exact Total XP required to REACH a specific level.
 * Using a smooth RPG curve: TotalXP = 100 * (Level - 1)^1.8
 */
export const getTotalXPForLevel = (level) => {
  if (level <= 1) return 0;
  return Math.floor(XP_CONSTANT * Math.pow(level - 1, XP_EXPONENT));
};

// 🏆 REBALANCED XP REWARDS
export const XP_REWARDS = {
  classic: 50,
  battle: 100,       // Multiplayer Win
  battle_draw: 10,   // Multiplayer Draw
  mamak: 100,        // Riddles Mode
  hard_words: 150,
  word_fever: 25     // Rebalanced to prevent fast-farming exploit
};

/**
 * 📈 SMOOTH RPG LEVELING MATH (Curved Progression)
 * Early levels are fast, higher levels progressively take much more XP.
 */
export const getLevelFromXP = (totalXP) => {
  if (!totalXP || isNaN(totalXP) || totalXP <= 0) return 1;
  // Inverse of the TotalXP formula: level = (totalXP / CONSTANT)^(1 / EXPONENT) + 1
  return Math.floor(Math.pow(totalXP / XP_CONSTANT, 1 / XP_EXPONENT)) + 1;
};

/**
 * Calculates detailed level data including progress percentage
 */
export const getLevelData = (totalXP) => {
  const safeXP = (!totalXP || isNaN(totalXP)) ? 0 : totalXP;
  const level = getLevelFromXP(safeXP);
  
  const currentLevelBase = getTotalXPForLevel(level);
  const nextLevelBase = getTotalXPForLevel(level + 1);
  
  const xpRequiredForNext = nextLevelBase - currentLevelBase;
  const xpInCurrentLevel = safeXP - currentLevelBase;
  
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpRequiredForNext) * 100)) || 0;

  return {
    level,
    progressPercent,
    currentLevelBase,
    nextLevelBase,
    xpRequiredForNext,
    xpInCurrentLevel
  };
};

export const getRewardForMode = (mode) => {
  const xp = XP_REWARDS[mode] || 10;

  // Monetary rewards stay proportional to mode difficulty
  const monetary = {
    classic: { type: 'fils', amount: 100 },
    battle: { type: 'derhem', amount: 2 },
    battle_draw: { type: 'fils', amount: 20 },
    mamak: { type: 'fils', amount: 125 },
    hard_words: { type: 'fils', amount: 200 },
    word_fever: { type: 'fils', amount: 100 } // Rebalanced
  };

  const reward = monetary[mode] || { type: 'fils', amount: 50 };
  return { ...reward, xp };
};

/**
 * Returns the visual tier (colors) for a given level.
 * Based on the 5-level progression system.
 */
export const getLevelTier = (lvl) => {
  const safeLvl = (!lvl || isNaN(lvl)) ? 1 : lvl;
  // Legendary Diamond Tier for 100+
  if (safeLvl > 100) {
    return {
      name: 'Diamond',
      stop1: '#b4fbff',
      stop2: '#d1a4ff',
      shadow: 'rgba(180, 251, 255, 0.6)',
      isLegendary: true
    };
  }

  const tiers = [
    { name: 'Bronze', stop1: '#cd7f32', stop2: '#f97316', shadow: 'rgba(249, 115, 22, 0.4)' },
    { name: 'Silver', stop1: '#cbd5e1', stop2: '#94a3b8', shadow: 'rgba(148, 163, 184, 0.4)' },
    { name: 'Gold', stop1: '#fbbf24', stop2: '#d97706', shadow: 'rgba(245, 158, 11, 0.4)' },
    { name: 'Emerald', stop1: '#10b981', stop2: '#059669', shadow: 'rgba(16, 185, 129, 0.4)' },
    { name: 'Cyan', stop1: '#22d3ee', stop2: '#0891b2', shadow: 'rgba(6, 182, 212, 0.4)' },
    { name: 'Blue', stop1: '#3b82f6', stop2: '#2563eb', shadow: 'rgba(59, 130, 246, 0.4)' },
    { name: 'Indigo', stop1: '#6366f1', stop2: '#4f46e5', shadow: 'rgba(99, 102, 241, 0.4)' },
    { name: 'Purple', stop1: '#a855f7', stop2: '#7c3aed', shadow: 'rgba(168, 85, 247, 0.4)' },
    { name: 'Fuchsia', stop1: '#d946ef', stop2: '#c026d3', shadow: 'rgba(217, 70, 239, 0.4)' },
    { name: 'Pink', stop1: '#ec4899', stop2: '#db2777', shadow: 'rgba(236, 72, 153, 0.4)' },
    { name: 'Rose', stop1: '#f43f5e', stop2: '#e11d48', shadow: 'rgba(244, 63, 94, 0.4)' },
    { name: 'Red', stop1: '#ef4444', stop2: '#b91c1c', shadow: 'rgba(239, 68, 68, 0.4)' },
    { name: 'Orange', stop1: '#f97316', stop2: '#ea580c', shadow: 'rgba(249, 115, 22, 0.4)' },
    { name: 'Amber', stop1: '#f59e0b', stop2: '#d97706', shadow: 'rgba(245, 158, 11, 0.4)' },
    { name: 'Lime', stop1: '#84cc16', stop2: '#65a30d', shadow: 'rgba(132, 204, 22, 0.4)' },
    { name: 'Teal', stop1: '#14b8a6', stop2: '#0d9488', shadow: 'rgba(20, 184, 166, 0.4)' },
    { name: 'Sky', stop1: '#0ea5e9', stop2: '#0284c7', shadow: 'rgba(14, 165, 233, 0.4)' },
    { name: 'Violet', stop1: '#8b5cf6', stop2: '#7c3aed', shadow: 'rgba(139, 92, 246, 0.4)' },
    { name: 'Slate', stop1: '#64748b', stop2: '#334155', shadow: 'rgba(100, 116, 139, 0.4)' },
    { name: 'Midnight', stop1: '#1e293b', stop2: '#0f172a', shadow: 'rgba(30, 41, 59, 0.4)' },
  ];

  const tierIndex = Math.floor((safeLvl - 1) / 5);
  return tiers[Math.min(Math.max(tierIndex, 0), tiers.length - 1)] || tiers[0];
};
