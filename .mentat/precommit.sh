# Run checks for each app with package.json
for APP in */; do
    if [ -f "${APP}package.json" ]; then
        cd "$APP"
        npm run lint || true  # Run lint if it exists
        npm run test
        cd ..
    fi
done