# Run checks for each app with package.json
for APP in */; do
    if [ -f "${APP}package.json" ]; then
        cd "$APP"
        npm run test -- --watchAll=false --ci --passWithNoTests
        cd ..
    fi
done