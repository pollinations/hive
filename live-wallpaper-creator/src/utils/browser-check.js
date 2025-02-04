export const checkBrowserCompatibility = () => {
  const issues = [];

  // Check for SharedArrayBuffer support
  if (typeof SharedArrayBuffer === 'undefined') {
    issues.push('SharedArrayBuffer is not supported in your browser. Please use Chrome, Firefox, or Edge with secure context.');
  }

  // Check for secure context
  if (!window.isSecureContext) {
    issues.push('This app requires a secure context (HTTPS) to function properly.');
  }

  // Check for WebAssembly support
  if (typeof WebAssembly === 'undefined') {
    issues.push('WebAssembly is not supported in your browser. Please use a modern browser.');
  }

  return {
    isCompatible: issues.length === 0,
    issues
  };
};
