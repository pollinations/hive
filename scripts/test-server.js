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
    if (req.url.startsWith('/../') || req.url === '/styles.css') {
      // Remove leading /.. or / for root directory access
      const urlPath = req.url.startsWith('/../') ? req.url.substring(3) : req.url.substring(1);
      filePath = path.join(projectRoot, urlPath);
    } else {
      filePath = path.join(rootDir, req.url);
    }
    
    const ext = path.extname(filePath);
    const contentTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
    };
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
