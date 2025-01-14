const { chromium } = require('@playwright/test');

async function testHtmlFile(htmlPath) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  let hasErrors = false;
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`Error in ${htmlPath}:`, msg.text());
      hasErrors = true;
    }
  });
  
  page.on('pageerror', error => {
    console.error(`Page error in ${htmlPath}:`, error);
    hasErrors = true;
  });
  
  try {
    // Use file:// protocol to load local HTML files
    await page.goto(`file://${process.cwd()}/${htmlPath}`);
    // Wait a bit for any async operations
    await page.waitForTimeout(2000);
  } catch (error) {
    console.error(`Failed to load ${htmlPath}:`, error);
    hasErrors = true;
  }
  
  await browser.close();
  return !hasErrors;
}

// If called directly
if (require.main === module) {
  const htmlPath = process.argv[2];
  if (!htmlPath) {
    console.error('Please provide an HTML file path');
    process.exit(1);
  }
  testHtmlFile(htmlPath).then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = testHtmlFile;