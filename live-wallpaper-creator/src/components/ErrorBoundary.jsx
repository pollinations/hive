import React from 'react';
import { Box, Typography, Button, Alert, Link } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  getErrorMessage() {
    const { error } = this.state;
    if (!error) return 'An unexpected error occurred';

    switch (error.name) {
      case 'FFmpegError':
        return 'Failed to initialize FFmpeg. This could be due to browser compatibility issues.';
      case 'BrowserCompatibilityError':
        return `Your browser is missing required features: ${error.features?.join(', ')}`;
      case 'ExportError':
        return `Failed to export ${error.type.toUpperCase()}: ${error.message}`;
      default:
        return error.message || 'An unexpected error occurred';
    }
  }

  getErrorDetails() {
    const { error } = this.state;
    if (!error) return null;

    switch (error.name) {
      case 'FFmpegError':
        return 'Please make sure you\'re using a modern browser with SharedArrayBuffer support and HTTPS enabled.';
      case 'BrowserCompatibilityError':
        return 'Please try using Chrome, Firefox, or Edge (latest versions) with HTTPS enabled.';
      case 'ExportError':
        return 'Try reducing the resolution or duration of your wallpaper.';
      default:
        return null;
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Alert severity="error" sx={{ width: '100%', maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1" gutterBottom>
              {this.getErrorMessage()}
            </Typography>
            {this.getErrorDetails() && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {this.getErrorDetails()}
              </Typography>
            )}
            {this.state.error?.name === 'BrowserCompatibilityError' && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Learn more about{' '}
                <Link
                  href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements"
                  target="_blank"
                  rel="noopener"
                >
                  browser requirements
                </Link>
              </Typography>
            )}
          </Alert>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            color="primary"
          >
            Reload Page
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 1,
                width: '100%',
                maxWidth: 600,
                overflow: 'auto',
              }}
            >
              <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                {this.state.errorInfo?.componentStack}
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
