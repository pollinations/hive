const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get destination from command line args or default to 'dist'
const destDir = process.argv[2] || 'dist';
const prNumber = process.argv[3]; // Optional PR number for preview builds

// Ensure destination directory exists
const absoluteDestDir = path.resolve(process.cwd(), destDir);
if (!fs.existsSync(absoluteDestDir)) {
    fs.mkdirSync(absoluteDestDir, { recursive: true });
}

// Get all directories in the root
const rootDir = path.resolve(__dirname, '..');
const entries = fs.readdirSync(rootDir, { withFileTypes: true });

// Filter for directories that contain package.json
const appDirs = entries
    .filter(entry => entry.isDirectory())
    .map(dir => dir.name)
    .filter(dir => {
        // Skip special directories
        if (['node_modules', '.git', '.github', 'scripts', destDir].includes(dir)) {
            return false;
        }
        // Check for package.json
        return fs.existsSync(path.join(rootDir, dir, 'package.json'));
    });

console.log(`Found ${appDirs.length} apps to build`);

// Build each app
appDirs.forEach(appDir => {
    const appPath = path.join(rootDir, appDir);
    console.log(`\nBuilding ${appDir}...`);
    
    try {
        // Install dependencies
        console.log('Installing dependencies...');
        execSync('npm install', { 
            cwd: appPath, 
            stdio: 'inherit' 
        });

        // Run build
        console.log('Running build...');
        execSync('npm run build', { 
            cwd: appPath, 
            stdio: 'inherit' 
        });

        // Determine build output directory (build or dist)
        let buildDir = fs.existsSync(path.join(appPath, 'build')) 
            ? 'build' 
            : fs.existsSync(path.join(appPath, 'dist')) 
                ? 'dist' 
                : null;

        if (buildDir) {
            // Create app directory in destination
            const appDestDir = path.join(absoluteDestDir, appDir);
            if (!fs.existsSync(appDestDir)) {
                fs.mkdirSync(appDestDir, { recursive: true });
            }

            // Copy build files
            console.log(`Copying ${buildDir} to ${destDir}/${appDir}`);
            const buildPath = path.join(appPath, buildDir);
            fs.cpSync(buildPath, appDestDir, { recursive: true });
        } else {
            console.warn(`No build output found for ${appDir}`);
        }
    } catch (error) {
        console.error(`Error building ${appDir}:`, error.message);
    }
});

// Generate index.html
const title = prNumber ? `PR #${prNumber} Preview` : 'Hive Apps';
const indexContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <style>
        body {
            font-family: sans-serif;
            max-width: 800px;
            margin: 2rem auto;
            padding: 0 1rem;
        }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <ul>
        ${fs.readdirSync(absoluteDestDir)
            .filter(item => 
                fs.statSync(path.join(absoluteDestDir, item)).isDirectory() &&
                item !== 'node_modules'
            )
            .map(app => `<li><a href='${app}'>${app}</a></li>`)
            .join('\n')}
    </ul>
</body>
</html>`;

fs.writeFileSync(path.join(absoluteDestDir, 'index.html'), indexContent);

console.log('\nBuild complete! Output is in:', destDir);
