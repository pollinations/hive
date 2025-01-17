const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer(rootDir) {
  const projectRoot = process.cwd();
  
  return http.createServer((req, res) => {
    if (req.url === '/') {
      req.url = '/index.html';
    }
    
    let filePath;
    if (req.url === '/index.html' || req.url === '/') {
      // Serve index.html from rootDir
      filePath = path.join(rootDir, 'index.html');
    } else {
      // Serve other assets from project root
      const urlPath = req.url.replace(/^\/+/, '');
      filePath = path.join(projectRoot, urlPath);
    }
    
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
          console.error(`File not found: ${filePath}`);
          res.writeHead(404);
          res.end('File not found');
        } else {
          console.error(`Server error for ${filePath}:`, error);
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

module.exports = createServer;
