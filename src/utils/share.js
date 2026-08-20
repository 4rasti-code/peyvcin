/**
 * Wordle-style Result Sharing Utility
 * Formats game results into an emoji grid and uses Web Share API or Clipboard.
 */

const EMOJI = {
  CORRECT: '🟩',
  WRONG_POS: '🟨',
  ABSENT: '⬛',
  EMPTY: '⬜'
};

/**
 * Generates a Wordle-style emoji grid from guesses.
 * @param {Array<Array<string>>} guesses - The letters guessed.
 * @param {string} targetWord - The actual word.
 * @returns {string} The emoji grid.
 */
export const generateWordleGrid = (guesses, targetWord, maxAttempts = 6) => {
  if (!guesses || !targetWord) return '';
  
  const lines = guesses.map(guess => {
    if (!guess) return '';
    
    // Create a copy of target chars to handle duplicate letters
    const targetChars = [...targetWord];
    const statuses = new Array(targetWord.length).fill(EMOJI.ABSENT);

    // Normalize guess to array of characters
    const guessArr = Array.isArray(guess) ? guess : [...guess];
    const targetArr = Array.isArray(targetWord) ? targetWord : [...targetWord];

    // First pass: Correct letters
    guessArr.forEach((char, i) => {
      if (char === targetArr[i]) {
        statuses[i] = EMOJI.CORRECT;
        targetChars[i] = null;
      }
    });

    // Second pass: Wrong position letters
    guessArr.forEach((char, i) => {
      if (statuses[i] === EMOJI.ABSENT) {
        const foundIndex = targetChars.indexOf(char);
        if (foundIndex !== -1) {
          statuses[i] = EMOJI.WRONG_POS;
          targetChars[foundIndex] = null;
        }
      }
    });

    return statuses.map((status, i) => `${status}${guessArr[i]}`).join(' ');
  }).filter(line => line !== '');

  // Pad with empty rows
  const wordLength = targetWord ? targetWord.length : 5;
  while (lines.length < maxAttempts) {
    lines.push(new Array(wordLength).fill(EMOJI.ABSENT).join(' '));
  }

  return lines.join('\n');
};

import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import * as htmlToImage from 'html-to-image';

/**
 * Shares the game result using Web Share API or Native Capacitor Share.
 * @param {Object} options - { title, grid, node }
 * @returns {Promise<boolean>} True if shared/copied, false otherwise.
 */
export const shareGameResult = async ({ title, grid, node, isDark = document.documentElement.classList.contains('dark') }) => {
  const fullText = `${title}\n\n${grid}\n\nپەیڤۆک: یارییا پەیڤان ب کوردی\nwww.peyvokgame.com`;

  try {
    let dataUrl = null;
    if (node) {
      // Capture the high quality image from the exact DOM node
      dataUrl = await htmlToImage.toPng(node, {
        quality: 1.0,
        pixelRatio: 2, // Retina quality for crisp text
        useCORS: true,
        allowTaint: true,
        cacheBust: true, // Prevents caching issues with images
      });
    } else {
      // Fallback to the old canvas generator if no DOM node is provided
      const imageBlob = await generateShareImageCanvas(`${title}\n\n${grid}`, isDark);
      dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(imageBlob);
      });
    }

    if (Capacitor.isNativePlatform()) {
      // NATIVE MOBILE: Write to Cache and share the native file URI
      // This ensures compatibility with Instagram Stories and Snapchat
      const fileName = `peyvok-result-${Date.now()}.png`;
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: dataUrl.split(',')[1],
        directory: Directory.Cache,
      });

      await Share.share({
        title: 'پەیڤۆک',
        text: `${title}\n\nپەیڤۆک: یارییا پەیڤان ب کوردی\nhttps://www.peyvokgame.com`,
        files: [savedFile.uri],
      });
      return true;
    } else {
      // WEB BROWSER: Convert Data URL to Blob and share
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'peyvok-result.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          text: `${title}\n\nپەیڤۆک: یارییا پەیڤان ب کوردی`,
          url: 'https://www.peyvokgame.com',
          files: [file]
        });
        return true;
      } else if (navigator.share) {
        // Fallback to text sharing if browser doesn't support file sharing
        await navigator.share({
          text: fullText,
          url: 'https://www.peyvokgame.com'
        });
        return true;
      }
    }
  } catch (err) {
    if (err.name !== 'AbortError' && err.message !== 'Share canceled') {
      console.error('Error sharing:', err);
      alert('Error sharing: ' + (err.message || JSON.stringify(err)));
    } else {
      return false; // User cancelled
    }
  }

  // Fallback to clipboard if sharing fails entirely
  try {
    await navigator.clipboard.writeText(fullText);
    return 'clipboard';
  } catch (err) {
    console.error('Failed to copy:', err);
    alert('Failed to copy: ' + (err.message || JSON.stringify(err)));
    return false;
  }
};

/**
 * Converts hex color codes to Wordle emojis.
 * @param {Array<Array<string>>} colorGrid - Array of color arrays.
 * @param {Array<Array<string>>} guessGrid - Array of guessed letters.
 * @returns {string} Emoji grid.
 */
export const colorsToEmojiGrid = (colorGrid, guessGrid = null, maxAttempts = 6) => {
  if (!colorGrid || !Array.isArray(colorGrid)) return '';
  
  const lines = colorGrid.map((row, rIdx) => {
    return row.map((color, cIdx) => {
      // Map common game colors to emojis
      let emoji = EMOJI.ABSENT;
      if (color === '#10b981' || color === 'CORRECT') emoji = EMOJI.CORRECT;
      else if (color === '#facc15' || color === 'WRONG_POS') emoji = EMOJI.WRONG_POS;
      else if (color === '#334155' || color === 'INCORRECT') emoji = EMOJI.ABSENT;

      if (guessGrid && guessGrid[rIdx] && guessGrid[rIdx][cIdx]) {
        return `${emoji}${guessGrid[rIdx][cIdx]}`;
      }
      return emoji;
    }).join(guessGrid ? ' ' : '');
  });

  const wordLength = colorGrid[0] ? colorGrid[0].length : 5;
  while (lines.length < maxAttempts) {
    lines.push(new Array(wordLength).fill(EMOJI.ABSENT).join(' '));
  }
  
  return lines.join('\n');
};

/**
 * Generates a canvas image from the game result string.
 * @param {string} fullText - The full result text including title and grid.
 * @param {boolean} isDark - Whether the theme is dark.
 * @returns {Promise<Blob>} The generated image as a blob.
 */
export const generateShareImageCanvas = async (fullText, isDark = document.documentElement.classList.contains('dark')) => {
  return new Promise((resolve, reject) => {
    try {
      const lines = fullText.trim().split('\n');
      const title = lines[0];
      const gridLines = lines.slice(1).filter(l => l.trim().length > 0 && (l.includes('🟩') || l.includes('🟨') || l.includes('⬛') || l.includes('⬜')));
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const cols = gridLines.length > 0 ? gridLines[0].split(' ').filter(b => b.trim().length > 0).length : 5;
      const rows = gridLines.length;

      const padding = 32;
      const tileSize = 44;
      const gap = 6;
      
      const gridWidth = cols * tileSize + (cols - 1) * gap;
      const gridHeight = rows * tileSize + (rows - 1) * gap;

      const fontStr = 'bold 22px "Rabar_038", "Rabar", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      
      // Measure title text width to prevent clipping
      ctx.font = fontStr;
      const textMetrics = ctx.measureText(title);
      const minTextWidth = textMetrics.width + padding * 2 + 60; // Extra padding for safe text bounds

      const width = Math.max(gridWidth + padding * 2 + 40, 360, minTextWidth);
      const titleHeight = 50;
      const footerHeight = 40;
      const height = padding + titleHeight + gridHeight + footerHeight + padding;

      canvas.width = width * 2;
      canvas.height = height * 2;
      ctx.scale(2, 2); // For high DPI (retina) displays

      // Colors
      const bgColor = isDark ? '#171717' : '#f8fafc'; // neutral-900 / slate-50
      const cardColor = isDark ? '#262626' : '#ffffff'; // neutral-800 / white
      const titleColor = isDark ? '#38bdf8' : '#0284c7'; // sky-400 / sky-600
      const textColor = isDark ? '#ffffff' : '#000000';
      const watermarkColor = isDark ? '#737373' : '#94a3b8'; // neutral-500 / slate-400
      const emptyBorderColor = isDark ? '#404040' : '#e2e8f0'; // neutral-700 / slate-200

      // Background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
      
      // Draw inner card background
      ctx.fillStyle = cardColor;
      ctx.beginPath();
      ctx.roundRect(16, 16, width - 32, height - 32, 24);
      ctx.fill();
      
      // Optional: Add a subtle border to the card
      ctx.strokeStyle = isDark ? '#404040' : '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Title
      ctx.font = fontStr;
      ctx.fillStyle = titleColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(title, width / 2, padding + 20);

      // Grid
      const startX = (width - gridWidth) / 2;
      const startY = padding + titleHeight + 10;

      gridLines.forEach((line, rIdx) => {
        const blocks = line.split(' ').filter(b => b.trim().length > 0);
        
        // Reverse blocks for right-to-left layout matching the game UI
        const rtlBlocks = [...blocks].reverse();

        rtlBlocks.forEach((block, cIdx) => {
          const hasCorrect = block.includes('🟩');
          const hasWrongPos = block.includes('🟨');
          const hasAbsent = block.includes('⬛') || block.includes('⬜');
          const letter = block.replace(/[🟩🟨⬛⬜]/gu, '').trim();
          const isEmpty = letter === '';

          let tileBg = 'transparent';
          let tileBorder = emptyBorderColor;
          let tileText = textColor;

          if (!isEmpty) {
            if (hasCorrect) {
              tileBg = '#22c55e'; // green-500
              tileBorder = '#22c55e';
              tileText = '#ffffff';
            } else if (hasWrongPos) {
              tileBg = '#eab308'; // yellow-500
              tileBorder = '#eab308';
              tileText = '#ffffff';
            } else if (hasAbsent) {
              tileBg = isDark ? '#334155' : '#64748b'; // slate-700 / slate-500
              tileBorder = isDark ? '#334155' : '#64748b';
              // If background is light, we used slate-500 so text should still be white
              tileText = '#ffffff'; 
            }
          }

          const x = startX + cIdx * (tileSize + gap);
          const y = startY + rIdx * (tileSize + gap);

          // Tile Background
          ctx.fillStyle = tileBg;
          ctx.beginPath();
          ctx.roundRect(x, y, tileSize, tileSize, 8);
          ctx.fill();

          // Tile Border
          if (isEmpty || tileBg === 'transparent') {
            ctx.strokeStyle = tileBorder;
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          // Letter
          if (!isEmpty) {
            ctx.fillStyle = tileText;
            ctx.font = '900 24px "Rabar_038", "Rabar", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Slight Y offset for better visual centering
            ctx.fillText(letter, x + tileSize / 2, y + tileSize / 2 + 2);
          }
        });
      });

      // Watermark
      ctx.font = '600 14px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = watermarkColor;
      ctx.textAlign = 'center';
      ctx.fillText('peyvokgame.com', width / 2, height - padding - 4);

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to Blob failed'));
      }, 'image/png');
    } catch (err) {
      reject(err);
    }
  });
};
