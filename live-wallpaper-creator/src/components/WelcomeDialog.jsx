import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Box, 
  Link,
  CircularProgress 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import HelpIcon from '@mui/icons-material/Help';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LaptopIcon from '@mui/icons-material/Laptop';

const WelcomeDialog = ({ open, onClose }) => {
  const getStartedRef = React.useRef(null);
  const [loading, setLoading] = React.useState(true);

  // Focus the "Get Started" button when dialog opens
  React.useEffect(() => {
    if (open && getStartedRef.current) {
      setTimeout(() => {
        getStartedRef.current.focus();
      }, 100);
    }
  }, [open]);

  const [error, setError] = React.useState(null);
  const [retryCount, setRetryCount] = React.useState(0);
  const maxRetries = 3;

  const [checkProgress, setCheckProgress] = React.useState(0);
  const [currentCheck, setCurrentCheck] = React.useState('');

  const checkFeatures = async () => {
    const features = [
      { name: 'SharedArrayBuffer', check: () => typeof SharedArrayBuffer !== 'undefined', label: 'Checking memory support...' },
      { name: 'WebAssembly', check: () => typeof WebAssembly !== 'undefined', label: 'Checking WebAssembly support...' },
      { name: 'Canvas', check: () => typeof HTMLCanvasElement !== 'undefined', label: 'Checking canvas support...' },
      { name: 'Blob', check: () => typeof Blob !== 'undefined', label: 'Checking file support...' },
      { name: 'File API', check: () => typeof File !== 'undefined' && typeof FileReader !== 'undefined', label: 'Checking file API support...' }
    ];

    const missingFeatures = [];
    for (let i = 0; i < features.length; i++) {
      const feature = features[i];
      setCurrentCheck(feature.label);
      setCheckProgress((i + 1) / (features.length + 1));
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (!feature.check()) {
        missingFeatures.push(feature.name);
      }
    }
    
    if (missingFeatures.length > 0) {
      throw new Error(`Missing required features: ${missingFeatures.join(', ')}`);
    }

    // Check for secure context
    setCurrentCheck('Checking security context...');
    setCheckProgress(1);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (!window.isSecureContext) {
      throw new Error('This app requires a secure context (HTTPS) to function properly.');
    }
  };

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setLoading(true);
      setError(null);
    }
  };

  // Check browser compatibility
  React.useEffect(() => {
    if (open) {
      const runCheck = async () => {
        try {
          await checkFeatures();
          setLoading(false);
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
      };
      runCheck();
    }
  }, [open, retryCount]);

  const handleKeyDown = (event) => {
    // Close dialog on Escape
    if (event.key === 'Escape') {
      onClose();
    }
  };

  const handleGetStarted = () => {
    if (!loading) {
      onClose();
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      onKeyDown={(e) => {
        handleKeyDown(e);
        // Handle tab key to keep focus within dialog
        if (e.key === 'Tab') {
          const focusableElements = e.currentTarget.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstFocusable = focusableElements[0];
          const lastFocusable = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
              e.preventDefault();
              lastFocusable.focus();
            }
          } else {
            if (document.activeElement === lastFocusable) {
              e.preventDefault();
              firstFocusable.focus();
            }
          }
        }
      }}
      aria-labelledby="welcome-dialog-title"
      aria-describedby="welcome-dialog-description"
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={false}
      keepMounted={false}
      TransitionProps={{
        onEntered: () => {
          if (!loading && !error && getStartedRef.current) {
            getStartedRef.current.focus();
          }
        }
      }}
      PaperProps={{
        sx: {
          outline: 'none',
          '& *:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 2,
          }
        }
      }}
      // Ensure dialog is modal for proper focus management
      disableEnforceFocus={false}
      disableAutoFocus={false}
    >
      <DialogTitle id="welcome-dialog-title" sx={{ pb: 0 }}>
        Welcome to Live Wallpaper Creator
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
          Create stunning animated wallpapers with an accessible and easy-to-use interface
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography id="welcome-dialog-description" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
          This dialog provides information about the Live Wallpaper Creator app, including steps to create wallpapers, system requirements, keyboard shortcuts, and accessibility features.
        </Typography>
        <Typography variant="body1" paragraph>
          Create animated wallpapers in just a few steps:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <CloudUploadIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Upload Background"
              secondary="Drag and drop or click to upload your background image"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AddIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Add Overlays"
              secondary="Choose from various animated overlays in the sidebar"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SaveIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Export"
              secondary="Save your creation as GIF or MP4"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <HelpIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Need Help?"
              secondary="Press '?' anytime to see keyboard shortcuts and tips"
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" fontSize="small" />
          System Requirements
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            This app uses advanced features for video processing. Please ensure your system meets these requirements:
          </Typography>

          <List dense>
            <ListItem>
              <ListItemIcon>
                <LaptopIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Desktop Computer Recommended"
                secondary="Mobile devices have limited support"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Supported Browsers"
                secondary={
                  <>
                    Chrome (v90+), Firefox (v85+), or Edge (v90+)
                    <Typography variant="caption" display="block" color="warning.main">
                      Safari has limited support
                    </Typography>
                  </>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="HTTPS Required"
                secondary="Must be accessed over a secure connection"
              />
            </ListItem>
          </List>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          Learn more about{' '}
          <Link
            href="https://github.com/pollinations/hive/wiki/Browser-Compatibility"
            target="_blank"
            rel="noopener"
          >
            browser compatibility
          </Link>
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon color="success" fontSize="small" />
          Performance Tips
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          For the best experience:
        </Typography>

        <List dense>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Close other resource-intensive tabs"
              secondary="Video processing requires significant memory"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Use recommended resolutions"
              secondary="Higher resolutions require more processing power"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Keep animations simple"
              secondary="Complex animations take longer to process"
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HelpIcon color="info" fontSize="small" />
          Keyboard Shortcuts
        </Typography>

        <List dense>
          <ListItem>
            <ListItemText 
              primary={
                <Box
                  component="kbd"
                  sx={{
                    fontFamily: 'monospace',
                    bgcolor: 'action.hover',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  ?
                </Box>
              }
              secondary="Show/hide help dialog"
              secondaryTypographyProps={{
                'aria-label': 'Press question mark key to show or hide help dialog'
              }}
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary={
                <Box
                  component="kbd"
                  sx={{
                    fontFamily: 'monospace',
                    bgcolor: 'action.hover',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  Delete
                </Box>
              }
              secondary="Remove selected overlay"
              secondaryTypographyProps={{
                'aria-label': 'Press delete key to remove the selected overlay'
              }}
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary={
                <Box
                  component="kbd"
                  sx={{
                    fontFamily: 'monospace',
                    bgcolor: 'action.hover',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  Space
                </Box>
              }
              secondary="Play/pause preview"
              secondaryTypographyProps={{
                'aria-label': 'Press space bar to play or pause the preview'
              }}
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary={
                <Box
                  component="kbd"
                  sx={{
                    fontFamily: 'monospace',
                    bgcolor: 'action.hover',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  Ctrl + Z
                </Box>
              }
              secondary="Undo last change"
              secondaryTypographyProps={{
                'aria-label': 'Press Control plus Z to undo the last change'
              }}
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary={
                <Box
                  component="kbd"
                  sx={{
                    fontFamily: 'monospace',
                    bgcolor: 'action.hover',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  Ctrl + Y
                </Box>
              }
              secondary="Redo last change"
              secondaryTypographyProps={{
                'aria-label': 'Press Control plus Y to redo the last change'
              }}
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon color="success" fontSize="small" />
          Accessibility Features
        </Typography>

        <List dense>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Keyboard Navigation"
              secondary="Full keyboard support for all features"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Screen Reader Support"
              secondary="ARIA labels and descriptions for all controls"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="High Contrast"
              secondary="Clear visual indicators and focus states"
            />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Box sx={{ position: 'relative' }}>
          <Button 
            ref={getStartedRef}
            onClick={handleGetStarted} 
            color="primary" 
            variant="contained"
            disabled={loading}
            aria-label={loading ? "Checking browser compatibility" : "Close welcome dialog and start using the app"}
            tabIndex={0}
            sx={{
              minWidth: 120,
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 2,
              }
            }}
            endIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {loading ? 'Checking...' : 'Get Started'}
          </Button>
          {loading ? (
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: -40,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ textAlign: 'center' }}
                role="status"
                aria-live="polite"
              >
                {currentCheck || 'Checking browser compatibility...'}
              </Typography>
              <Box sx={{ width: '100%', position: 'relative' }}>
                <LinearProgress 
                  variant="determinate" 
                  value={checkProgress * 100}
                  sx={{ height: 2 }}
                  aria-label="Browser compatibility check progress"
                />
                <Typography
                  variant="caption"
                  component="div"
                  color="text.secondary"
                  sx={{ 
                    position: 'absolute',
                    right: -25,
                    top: -2,
                    minWidth: 20,
                    textAlign: 'right'
                  }}
                  role="status"
                  aria-live="polite"
                >
                  {Math.round(checkProgress * 100)}%
                </Typography>
              </Box>
            </Box>
          ) : error ? (
            <Alert 
              severity="error" 
              sx={{ 
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: -80,
                textAlign: 'left',
                fontSize: '0.75rem'
              }}
              action={
                retryCount < maxRetries ? (
                  <Button 
                    color="error" 
                    size="small" 
                    onClick={handleRetry}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleRetry();
                      }
                    }}
                    sx={{ 
                      minWidth: 'auto', 
                      p: 0.5,
                      '&:focus-visible': {
                        outline: '2px solid',
                        outlineColor: 'error.main',
                        outlineOffset: 2,
                      }
                    }}
                    aria-label={`Retry browser compatibility check (${maxRetries - retryCount} attempts remaining)`}
                  >
                    Retry ({maxRetries - retryCount})
                  </Button>
                ) : null
              }
            >
              <Typography variant="caption" component="div">
                {error}
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                Please try using a modern browser with HTTPS enabled.
                {retryCount >= maxRetries && (
                  <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                    Maximum retry attempts reached. Please try again later or use a different browser.
                  </Box>
                )}
              </Typography>
            </Alert>
          ) : null}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default WelcomeDialog;
