import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('pageerror', (err) => {
    console.log('--- PAGE ERROR CAUGHT ---');
    console.log(err.message);
    console.log(err.stack);
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('--- CONSOLE ERROR ---');
      console.log(msg.text());
    }
  });

  await page.goto('http://localhost:5173');

  // Wait for the Lobby View to appear
  await page.waitForSelector('text=کلاسیک', { timeout: 10000 }).catch(_e => console.log('Lobby not loaded?'));
  
  try {
    // Click Classic mode
    console.log('Clicking Classic button...');
    await page.click('text=کلاسیک');
    
    // Wait a bit for the crash
    await page.waitForTimeout(2000);
  } catch (e) {
    console.log('Error during click:', e);
  }
})();
