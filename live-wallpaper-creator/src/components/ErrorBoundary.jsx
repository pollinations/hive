import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';

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
              {this.state.error?.message || 'An unexpected error occurred'}
            </Typography>
            {this.state.error?.name === 'FFmpegError' && (
              <Typography variant="body2" color="text.secondary">
                FFmpeg initialization failed. Please make sure you're using a modern browser with SharedArrayBuffer support.
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
