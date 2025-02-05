const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  const browsers = {
    chrome: /chrome|chromium|crios/i.test(ua),
    firefox: /firefox|fxios/i.test(ua),
    safari: /safari/i.test(ua),
    edge: /edg/i.test(ua),
    ie: /msie|trident/i.test(ua),
  };

  // Chrome detection needs to filter out other Chromium-based browsers
  if (browsers.chrome) {
    browsers.chrome = !browsers.edge;
  }

  // Safari detection needs to filter out Chrome and other browsers on iOS
  if (browsers.safari) {
    browsers.safari = !browsers.chrome && !browsers.firefox && !browsers.edge;
  }

  return browsers;
};

const getRecommendedBrowser = (currentBrowser) => {
  if (currentBrowser.ie) return 'Please upgrade to a modern browser like Chrome, Firefox, or Edge.';
  if (currentBrowser.safari) return 'Please use Chrome or Firefox for best compatibility.';
  return 'Please use the latest version of Chrome, Firefox, or Edge.';
};

export const checkBrowserCompatibility = () => {
  const issues = [];
  const browser = getBrowserInfo();

  // Check for SharedArrayBuffer support
  if (typeof SharedArrayBuffer === 'undefined') {
    issues.push({
      feature: 'SharedArrayBuffer',
      message: 'SharedArrayBuffer is not supported in your browser.',
      solution: `This feature is required for video processing. ${getRecommendedBrowser(browser)}`,
      critical: true
    });
  }

  // Check for secure context (HTTPS)
  if (!window.isSecureContext) {
    issues.push({
      feature: 'Secure Context',
      message: 'This app requires a secure context (HTTPS) to function properly.',
      solution: 'Please access this app using HTTPS or localhost.',
      critical: true
    });
  }

  // Check for WebAssembly support
  if (typeof WebAssembly === 'undefined') {
    issues.push({
      feature: 'WebAssembly',
      message: 'WebAssembly is not supported in your browser.',
      solution: `This feature is required for video processing. ${getRecommendedBrowser(browser)}`,
      critical: true
    });
  }

  // Check for Cross-Origin Isolation
  if (!crossOriginIsolated) {
    issues.push({
      feature: 'Cross-Origin Isolation',
      message: 'Cross-Origin Isolation is not enabled.',
      solution: 'This site needs to be served with COOP and COEP headers for optimal performance.',
      critical: false
    });
  }

  // Check for required Web APIs
  const requiredAPIs = [
    { name: 'Blob', check: () => typeof Blob !== 'undefined' },
    { name: 'Canvas', check: () => typeof HTMLCanvasElement !== 'undefined' },
    { name: 'File API', check: () => typeof File !== 'undefined' && typeof FileReader !== 'undefined' },
  ];

  requiredAPIs.forEach(({ name, check }) => {
    if (!check()) {
      issues.push({
        feature: name,
        message: `${name} is not supported in your browser.`,
        solution: getRecommendedBrowser(browser),
        critical: true
      });
    }
  });

  return {
    isCompatible: !issues.some(issue => issue.critical),
    issues,
    browser: Object.entries(browser)
      .filter(([_, value]) => value)
      .map(([name]) => name)[0]
  };
};
