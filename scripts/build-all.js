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

// Filter for app directories (either have package.json or index.html)
const appDirs = entries
    .filter(entry => entry.isDirectory())
    .map(dir => dir.name)
    .filter(dir => {
        // Skip special directories
        if (['node_modules', '.git', '.github', 'scripts', destDir].includes(dir)) {
            return false;
        }
        const dirPath = path.join(rootDir, dir);
        // Check for either package.json or index.html
        return fs.existsSync(path.join(dirPath, 'package.json')) || 
               fs.existsSync(path.join(dirPath, 'index.html'));
    });

console.log(`Found ${appDirs.length} apps to build`);

// Process each app
appDirs.forEach(appDir => {
    const appPath = path.join(rootDir, appDir);
    console.log(`\nProcessing ${appDir}...`);
    
    const hasPackageJson = fs.existsSync(path.join(appPath, 'package.json'));
    const appDestDir = path.join(absoluteDestDir, appDir);

    try {
        if (hasPackageJson) {
            // Build Node.js app
            console.log('Building Node.js app...');
            console.log('Installing dependencies...');
            execSync('npm install', { 
                cwd: appPath, 
                stdio: 'inherit' 
            });

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
        } else {
            // Static site with index.html
            console.log('Static site detected, copying files...');
            if (!fs.existsSync(appDestDir)) {
                fs.mkdirSync(appDestDir, { recursive: true });
            }
            fs.cpSync(appPath, appDestDir, { 
                recursive: true,
                filter: (src) => {
                    const relativePath = path.relative(appPath, src);
                    // Skip node_modules and hidden files/directories
                    return !relativePath.startsWith('node_modules') && 
                           !relativePath.startsWith('.');
                }
            });
            console.log(`Copied static files to ${destDir}/${appDir}`);
        }
    } catch (error) {
        console.error(`Error processing ${appDir}:`, error.message);
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