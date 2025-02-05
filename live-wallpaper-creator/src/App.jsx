import { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, AppBar, Toolbar, Typography, Container, IconButton, Tooltip, LinearProgress } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import HelpIcon from '@mui/icons-material/Help';
import Canvas from './components/Canvas';
import Sidebar from './components/Sidebar';
import Controls from './components/Controls';
import BrowserWarning from './components/BrowserWarning';
import HelpDialog from './components/HelpDialog';
import WelcomeDialog from './components/WelcomeDialog';
import ErrorBoundary from './components/ErrorBoundary';
import { checkBrowserCompatibility } from './utils/browser-check';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

function App() {
  const [resolution, setResolution] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [overlays, setOverlays] = useState([]);
  const [browserIssues, setBrowserIssues] = useState([]);
  const [helpOpen, setHelpOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);

  useEffect(() => {
    const { isCompatible, issues } = checkBrowserCompatibility();
    if (!isCompatible) {
      setBrowserIssues(issues);
    }

    const handleKeyPress = (e) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setHelpOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        {browserIssues.length > 0 ? (
          <BrowserWarning issues={browserIssues} />
        ) : !resolution ? (
          <>
            <Controls onResolutionSet={setResolution} />
            <WelcomeDialog open={welcomeOpen} onClose={() => setWelcomeOpen(false)} />
          </>
        ) : (
          <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" elevation={0}>
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Live Wallpaper Creator
                </Typography>
                <Tooltip title="Show help (Press ?)">
                  <IconButton
                    color="inherit"
                    onClick={() => setHelpOpen(true)}
                    aria-label="Show help"
                  >
                    <HelpIcon />
                  </IconButton>
                </Tooltip>
              </Toolbar>
              {ffmpegLoading && (
                <LinearProgress 
                  sx={{ height: 2 }}
                  aria-label="Loading FFmpeg"
                />
              )}
            </AppBar>
            <Container maxWidth="xl" sx={{ mt: 2, height: 'calc(100vh - 80px)' }}>
              <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
                <Sidebar 
                  onOverlaySelect={(overlay) => setOverlays([...overlays, overlay])}
                />
                <Canvas
                  resolution={resolution}
                  backgroundImage={backgroundImage}
                  overlays={overlays}
                  onBackgroundSet={setBackgroundImage}
                  onOverlaysChange={setOverlays}
                  onFfmpegLoadingChange={setFfmpegLoading}
                />
              </Box>
            </Container>
            <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
          </Box>
        )}
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
