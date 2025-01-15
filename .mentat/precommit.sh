(cd tarot-reader && npm run build)
(cd pollinations-image-show && npm run build)
(cd placeholder-generator && npm run build)
for dir in $(cat .test-dirs); do
  (cd $dir && npm test || true)
done