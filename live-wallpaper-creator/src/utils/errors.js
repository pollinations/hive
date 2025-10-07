export class FFmpegError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'FFmpegError';
    this.details = details;
  }
}

export class BrowserCompatibilityError extends Error {
  constructor(message, features = []) {
    super(message);
    this.name = 'BrowserCompatibilityError';
    this.features = features;
  }
}

export class ExportError extends Error {
  constructor(message, type, details = {}) {
    super(message);
    this.name = 'ExportError';
    this.type = type;
    this.details = details;
  }
}

export const createFFmpegError = (error) => {
  if (error.message.includes('SharedArrayBuffer')) {
    return new BrowserCompatibilityError(
      'SharedArrayBuffer is not available. Please use a modern browser with HTTPS.',
      ['SharedArrayBuffer']
    );
  }
  if (error.message.includes('WebAssembly')) {
    return new BrowserCompatibilityError(
      'WebAssembly is not supported in your browser.',
      ['WebAssembly']
    );
  }
  return new FFmpegError(error.message, {
    originalError: error,
    timestamp: new Date().toISOString()
  });
};
