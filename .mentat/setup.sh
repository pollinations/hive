apt-get update
apt-get install --no-install-recommends -y libglib2.0-0 libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libdbus-1-3 libxcb1 libxkbcommon0 libatspi2.0-0 libx11-6 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 libcairo2
echo -e "tarot-reader\npollinations-image-show\nplaceholder-generator" > .test-dirs
npm install
(cd tarot-reader && npm install)
(cd pollinations-image-show && npm install)
(cd placeholder-generator && npm install)