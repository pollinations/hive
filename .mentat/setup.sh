# Install dependencies for each app with package.json
for APP in */; do
    if [ -f "${APP}package.json" ]; then
        cd "$APP"
        npm ci
        cd ..
    fi
done