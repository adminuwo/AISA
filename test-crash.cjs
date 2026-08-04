const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  console.log('Navigating...');
  await page.goto('http://localhost:5173/dashboard/legal/contracts', {waitUntil: 'domcontentloaded'});
  console.log('Loaded.');
  
  await new Promise(r => setTimeout(r, 4000));
  
  try {
    console.log('Clicking dropdown...');
    await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('div')).find(el => el.textContent.includes('Workspace'));
      if(el) el.click();
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
    console.log('Clicking Manual Entry...');
    await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('div, span'));
      const el = els.find(e => e.textContent === 'Manual Entry Workspace');
      if(el) {
        el.click();
        console.log('Clicked manual entry!');
      } else {
        console.log('Could not find manual entry button');
      }
    });
    
    await new Promise(r => setTimeout(r, 2000));
  } catch (err) {
    console.log('Test interaction failed:', err);
  }
  
  await browser.close();
  console.log('Done.');
})();
