const { chromium } = require('@playwright/test');
const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer(rootDir) {
  return http.createServer((req, res) => {
    let filePath = path.join(rootDir, req.url === '/' ? 'index.html' : req.url);
    
    const ext = path.extname(filePath);
    const contentTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript;charset=utf-8',
      '.mjs': 'text/javascript;charset=utf-8',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
    };

    // Add proper MIME type for ES modules
    if (ext === '.js' && req.url.includes('type=module')) {
      res.setHeader('Content-Type', 'text/javascript;charset=utf-8');
    }
    const contentType = contentTypes[ext] || 'text/plain';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          res.writeHead(404);
          res.end('File not found');
        } else {
          res.writeHead(500);
          res.end('Internal server error');
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });
}

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

  const server = createServer(path.dirname(path.join(process.cwd(), htmlPath)));
  const port = 3000;
  
  try {
    await new Promise((resolve) => server.listen(port, resolve));
    await page.goto(`http://localhost:${port}/${path.basename(htmlPath)}`);
    
    // Wait for potential module loading and initialization
    try {
      await page.waitForFunction(() => {
        return document.querySelector('canvas') && 
               typeof window.getCanvasState === 'function';
      }, { timeout: 5000 });
    } catch (error) {
      console.error('Timeout waiting for editor initialization');
      hasErrors = true;
    }
  } catch (error) {
    console.error(`Failed to load ${htmlPath}:`, error);
    hasErrors = true;
  } finally {
    server.close();
    await browser.close();
  }
  
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