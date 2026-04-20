/**
 * RPG PROGRESSION SYSTEM CONSTANTS
 * 
 * Unified RPG Leveling Path with Infinite Scaling factor.
 */

// Manual thresholds for the first 5 levels
export const RPG_THRESHOLDS = {
  1: 0,
  2: 500,
  3: 1500,
  4: 3000,
  5: 5500
};

// Growth factor for infinite scaling (20% compound increase in XP requirement gap)
const GROWTH_FACTOR = 1.2;

/**
 * Calculates the exact Total XP required to REACH a specific level.
 * Uses manual mapping for L1-5 and a geometric progression formula for L6+.
 */
export const getTotalXPForLevel = (level) => {
  if (level <= 1) return 0;
  if (level <= 5) return RPG_THRESHOLDS[level];
  
  // For n > 5: TotalXP(n) = 5500 + 15000 * (1.2^(n-5) - 1)
  // Derived from sum of geometric series of gaps: Gap(n) = 2500 * (1.2 ^ (n-5))
  return Math.floor(5500 + 15000 * (Math.pow(GROWTH_FACTOR, level - 5) - 1));
};

/**
 * Derives the current Level from a Total XP value.
 */
export const getLevelFromXP = (xp) => {
  if (!xp || xp < 500) return 1;
  if (xp < 1500) return 2;
  if (xp < 3000) return 3;
  if (xp < 5500) return 4;
  
  // Inverse of the TotalXP formula:
  // level = 5 + log1.2((XP - 5500) / 15000 + 1)
  const levelFloat = 5 + Math.log((xp - 5500) / 15000 + 1) / Math.log(GROWTH_FACTOR);
  return Math.floor(levelFloat);
};

/**
 * Returns detailed progression data for a given XP.
 */
export const getLevelData = (xp) => {
  const level = getLevelFromXP(xp);
  const currentFloor = getTotalXPForLevel(level);
  const nextCeiling = getTotalXPForLevel(level + 1);
  
  const levelWidth = nextCeiling - currentFloor;
  const progressInLevel = xp - currentFloor;
  
  return {
    level,
    currentLevelBase: currentFloor,
    nextLevelBase: nextCeiling,
    progressInLevel,
    levelWidth,
    progressPercent: Math.min(100, Math.max(0, (progressInLevel / levelWidth) * 100))
  };
};

/**
 * Centralized Reward Matrix for all game modes.
 * Maps mode ID to { type, amount, xp }
 */
export const getRewardForMode = (mode) => {
  const matrix = {
    'classic': { type: 'fils', amount: 50, xp: 25 },
    'word_fever': { type: 'fils', amount: 75, xp: 60 },
    'mamak': { type: 'derhem', amount: 5, xp: 50 },
    'hard_words': { type: 'fils', amount: 100, xp: 80 },
    'battle': { type: 'dinar', amount: 1, xp: 100 },
    'secret_word': { type: 'dinar', amount: 1, xp: 120 } // Unified to Dinar per final request
  };
  
  return matrix[mode] || matrix['classic'];
};
