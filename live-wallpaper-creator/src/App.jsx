import { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, AppBar, Toolbar, Typography, Container } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import Canvas from './components/Canvas';
import Sidebar from './components/Sidebar';
import Controls from './components/Controls';
import BrowserWarning from './components/BrowserWarning';
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

  useEffect(() => {
    const { isCompatible, issues } = checkBrowserCompatibility();
    if (!isCompatible) {
      setBrowserIssues(issues);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {browserIssues.length > 0 ? (
        <BrowserWarning issues={browserIssues} />
      ) : !resolution ? (
        <Controls onResolutionSet={setResolution} />
      ) : (
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static" elevation={0}>
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Live Wallpaper Creator
              </Typography>
            </Toolbar>
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
              />
            </Box>
          </Container>
        </Box>
      )}
    </ThemeProvider>
  );
}

export default App;
