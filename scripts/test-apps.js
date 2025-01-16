const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const testHtmlFile = require('./test-html');

function captureCommand(command, options = {}) {
  const result = spawnSync(command, [], {
    ...options,
    shell: true,
    encoding: 'utf8'
  });
  return result.output.join('\n');
}

async function main() {
  let testsFailed = false;
  let testLogs = [];
  const rootDir = process.cwd();
  
  // Get all directories in root (excluding node_modules, .git, etc)
  const dirs = fs.readdirSync(rootDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(dir => !['node_modules', '.git', '.github', 'scripts'].includes(dir));
  
  for (const dir of dirs) {
    console.log(`\nTesting ${dir}`);
    testLogs.push(`\n## Testing ${dir}`);
    
    const hasPackageJson = fs.existsSync(path.join(dir, 'package.json'));
    const hasIndexHtml = fs.existsSync(path.join(dir, 'index.html'));
    
    if (hasPackageJson) {
      console.log(`Testing Node.js app: ${dir}`);
      testLogs.push(`\nTesting Node.js app: ${dir}`);
      try {
        // Install dependencies
        console.log('Installing dependencies...');
        testLogs.push('\n### Installing dependencies');
        const installOutput = captureCommand('npm install', { cwd: dir });
        testLogs.push('```\n' + installOutput + '\n```');
        
        // Check if tests exist and run them
        const packageJson = JSON.parse(fs.readFileSync(path.join(dir, 'package.json')));
        if (packageJson.scripts && packageJson.scripts.test) {
          console.log('Running tests...');
          testLogs.push('\n### Running tests');
          const testOutput = captureCommand('npm test', { cwd: dir });
          testLogs.push('```\n' + testOutput + '\n```');
        } else {
          console.log('ℹ️ No tests found');
          testLogs.push('\nℹ️ No tests found');
        }
        
        // Try to build
        console.log('Building...');
        testLogs.push('\n### Building');
        const buildOutput = captureCommand('npm run build', { cwd: dir });
        testLogs.push('```\n' + buildOutput + '\n```');
        
      } catch (error) {
        const errorMessage = `❌ Failed in ${dir}: ${error.message}`;
        console.error(errorMessage);
        testLogs.push(`\n${errorMessage}`);
        testsFailed = true;
        continue;
      }
    } else if (hasIndexHtml) {
      console.log(`Testing static HTML app: ${dir}`);
      testLogs.push(`\nTesting static HTML app: ${dir}`);
      const success = await testHtmlFile(path.join(dir, 'index.html'));
      if (!success) {
        const errorMessage = `❌ HTML tests failed for ${dir}`;
        console.error(errorMessage);
        testLogs.push(`\n${errorMessage}`);
        testsFailed = true;
      }
    }
  }
  
  // Write test logs to file for the workflow to read
  fs.writeFileSync('test-logs.txt', testLogs.join('\n'));

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
  fs.writeFileSync('test-logs.txt', `# Test Results\n\nAn unexpected error occurred while running tests:\n\n\`\`\`\n${error.stack}\n\`\`\``);
  process.exit(1);
});