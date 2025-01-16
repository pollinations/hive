const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const testHtmlFile = require('./test-html');
const https = require('https');

async function postToGitHub(prNumber, body) {
  if (!process.env.GITHUB_TOKEN) {
    console.log('No GITHUB_TOKEN provided, skipping PR comment');
    return;
  }

  const options = {
    hostname: 'api.github.com',
    path: `/repos/pollinations/hive/issues/${prNumber}/comments`,
    method: 'POST',
    headers: {
      'User-Agent': 'node',
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.write(JSON.stringify({ body }));
    req.end();
  });
}

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
  const prNumber = process.env.PR_NUMBER;
  
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
  
  if (testsFailed) {
    console.error('\n❌ Some tests failed');
    
    if (prNumber) {
      console.log(`Posting test logs to PR #${prNumber}`);
      const comment = `# Test Results\n\nTests failed. Here are the detailed logs:\n\n${testLogs.join('\n')}`;
      await postToGitHub(prNumber, comment);
    }
    
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed');
    process.exit(0);
  }
}

main().catch(async error => {
  console.error('Unexpected error:', error);
  
  if (process.env.PR_NUMBER) {
    const comment = `# Test Results\n\nAn unexpected error occurred while running tests:\n\n\`\`\`\n${error.stack}\n\`\`\``;
    await postToGitHub(process.env.PR_NUMBER, comment);
  }
  
  process.exit(1);
});