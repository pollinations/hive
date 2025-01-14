const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const testHtmlFile = require('./test-html');

async function main() {
  let testsFailed = false;
  const rootDir = process.cwd();
  
  // Get all directories in root (excluding node_modules, .git, etc)
  const dirs = fs.readdirSync(rootDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(dir => !['node_modules', '.git', '.github', 'scripts'].includes(dir));
  
  for (const dir of dirs) {
    console.log(`\nTesting ${dir}`);
    
    const hasPackageJson = fs.existsSync(path.join(dir, 'package.json'));
    const hasIndexHtml = fs.existsSync(path.join(dir, 'index.html'));
    
    if (hasPackageJson) {
      console.log(`Testing Node.js app: ${dir}`);
      try {
        // Install dependencies
        console.log('Installing dependencies...');
        execSync('npm install', { 
          cwd: dir, 
          stdio: 'inherit'
        });
        
        // Check if tests exist and run them
        const packageJson = JSON.parse(fs.readFileSync(path.join(dir, 'package.json')));
        if (packageJson.scripts && packageJson.scripts.test) {
          console.log('Running tests...');
          execSync('npm test', { 
            cwd: dir, 
            stdio: 'inherit'
          });
        } else {
          console.log('ℹ️ No tests found');
        }
        
        // Try to build
        console.log('Building...');
        execSync('npm run build', { 
          cwd: dir, 
          stdio: 'inherit'
        });
        
      } catch (error) {
        console.error(`❌ Failed in ${dir}:`, error.message);
        testsFailed = true;
        continue;
      }
    } else if (hasIndexHtml) {
      console.log(`Testing static HTML app: ${dir}`);
      const success = await testHtmlFile(path.join(dir, 'index.html'));
      if (!success) {
        console.error(`❌ HTML tests failed for ${dir}`);
        testsFailed = true;
      }
    }
  }
  
  if (testsFailed) {
    console.error('\n❌ Some tests failed');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});