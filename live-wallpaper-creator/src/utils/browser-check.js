const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  const browsers = {
    chrome: /chrome|chromium|crios/i.test(ua),
    firefox: /firefox|fxios/i.test(ua),
    safari: /safari/i.test(ua),
    edge: /edg/i.test(ua),
    ie: /msie|trident/i.test(ua),
    mobile: /mobile|android|iphone|ipad|ipod/i.test(ua),
  };

  // Chrome detection needs to filter out other Chromium-based browsers
  if (browsers.chrome) {
    browsers.chrome = !browsers.edge;
  }

  // Safari detection needs to filter out Chrome and other browsers on iOS
  if (browsers.safari) {
    browsers.safari = !browsers.chrome && !browsers.firefox && !browsers.edge;
  }

  // Get browser version
  let version = '';
  if (browsers.chrome) {
    version = ua.match(/(?:chrome|chromium|crios)\/(\d+)/i)?.[1] || '';
  } else if (browsers.firefox) {
    version = ua.match(/(?:firefox|fxios)\/(\d+)/i)?.[1] || '';
  } else if (browsers.safari) {
    version = ua.match(/version\/(\d+)/i)?.[1] || '';
  } else if (browsers.edge) {
    version = ua.match(/edg\/(\d+)/i)?.[1] || '';
  }

  return {
    ...browsers,
    version: parseInt(version, 10) || 0,
    isMobile: browsers.mobile
  };
};

const MINIMUM_VERSIONS = {
  chrome: 90,
  firefox: 85,
  edge: 90,
  safari: 15
};

const getRecommendedBrowser = (currentBrowser) => {
  if (currentBrowser.isMobile) {
    return 'This app is optimized for desktop browsers. Please use a desktop computer for the best experience.';
  }
  if (currentBrowser.ie) {
    return 'Internet Explorer is not supported. Please upgrade to a modern browser like Chrome, Firefox, or Edge.';
  }
  if (currentBrowser.safari) {
    return 'Safari has limited support for some features. Please use Chrome or Firefox for best compatibility.';
  }
  
  const browserName = Object.keys(MINIMUM_VERSIONS).find(name => currentBrowser[name]) || '';
  if (browserName && currentBrowser.version < MINIMUM_VERSIONS[browserName]) {
    return `Your ${browserName} version (${currentBrowser.version}) is outdated. Please update to version ${MINIMUM_VERSIONS[browserName]} or later.`;
  }
  
  return 'Please use the latest version of Chrome, Firefox, or Edge.';
};

export const checkBrowserCompatibility = () => {
  const issues = [];
  const browser = getBrowserInfo();

  // Add mobile warning if applicable
  if (browser.isMobile) {
    issues.push({
      feature: 'Desktop Browser Required',
      message: 'This app is optimized for desktop browsers.',
      solution: 'Please use a desktop computer for the best experience.',
      critical: true
    });
  }

  // Check browser version
  const browserName = Object.keys(MINIMUM_VERSIONS).find(name => browser[name]);
  if (browserName && browser.version < MINIMUM_VERSIONS[browserName]) {
    issues.push({
      feature: 'Browser Version',
      message: `Your ${browserName} version (${browser.version}) is outdated.`,
      solution: `Please update to version ${MINIMUM_VERSIONS[browserName]} or later.`,
      critical: true
    });
  }

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
    browser: {
      name: Object.entries(browser)
        .filter(([key, value]) => value && key !== 'version' && key !== 'isMobile')
        .map(([name]) => name)[0],
      version: browser.version,
      isMobile: browser.isMobile
    }
  };
};
