/**
 * RPG PROGRESSION SYSTEM CONSTANTS
 * 
 * Based on the RPG Leveling Path Generator logic.
 * Base XP: 500
 * Multiplier: 1.1
 */
export const LEVEL_BASE_XP = 500;
export const LEVEL_FACTOR = 1.1;

/**
 * Calculates the exact Total XP required to REACH a specific level.
 * Formula: Base * (Factor^(Level-1) - 1) / (Factor - 1)
 */
export const getTotalXPForLevel = (level) => {
  if (level <= 1) return 0;
  return LEVEL_BASE_XP * (Math.pow(LEVEL_FACTOR, level - 1) - 1) / (LEVEL_FACTOR - 1);
};

/**
 * Derives the current Level from a Total XP value.
 * Inverse Formula: Level = floor(log_factor((XP * (Factor - 1) / Base) + 1)) + 1
 */
export const getLevelFromXP = (xp) => {
  if (!xp || xp <= 0) return 1;
  const val = (xp * (LEVEL_FACTOR - 1)) / LEVEL_BASE_XP + 1;
  return Math.floor(Math.log(val) / Math.log(LEVEL_FACTOR)) + 1;
};

/**
 * Returns detailed progression data for a given XP.
 */
export const getLevelData = (xp) => {
  const level = getLevelFromXP(xp);
  const currentLevelBase = getTotalXPForLevel(level);
  const nextLevelBase = getTotalXPForLevel(level + 1);
  const levelWidth = nextLevelBase - currentLevelBase;
  const progressInLevel = xp - currentLevelBase;
  const progressPercent = levelWidth > 0 ? (progressInLevel / levelWidth) * 100 : 0;

  return {
    level,
    currentLevelBase,
    nextLevelBase,
    progressInLevel,
    levelWidth,
    progressPercent: Math.min(100, Math.max(0, progressPercent))
  };
};
