import { useRef, useEffect, useState } from 'react';
import { Box, Button, ButtonGroup, Tooltip, CircularProgress, Alert, Snackbar } from '@mui/material';
import Draggable from 'react-draggable';
import { exportAsGif, exportAsMP4 } from '../utils/export';
import SaveIcon from '@mui/icons-material/Save';
import MovieIcon from '@mui/icons-material/Movie';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Canvas = ({ resolution, backgroundImage, overlays, onBackgroundSet, onOverlaysChange }) => {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const containerWidth = canvas.parentElement.clientWidth;
    const containerHeight = canvas.parentElement.clientHeight;
    
    // Calculate scale to fit canvas in container while maintaining aspect ratio
    const scaleX = containerWidth / resolution.width;
    const scaleY = containerHeight / resolution.height;
    const newScale = Math.min(scaleX, scaleY) * 0.9; // 90% of container size
    setScale(newScale);
    
    canvas.style.width = `${resolution.width * newScale}px`;
    canvas.style.height = `${resolution.height * newScale}px`;
    
    // Set actual canvas resolution
    canvas.width = resolution.width;
    canvas.height = resolution.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background if exists
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }
    
    // Draw overlays
    overlays.forEach(overlay => {
      if (overlay.image) {
        ctx.drawImage(
          overlay.image,
          overlay.x,
          overlay.y,
          overlay.width,
          overlay.height
        );
      }
    });
  }, [resolution, backgroundImage, overlays]);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => onBackgroundSet(img);
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = async (type) => {
    try {
      setExporting(true);
      setError(null);
      const canvas = canvasRef.current;
      let blob;

      if (type === 'gif') {
        blob = await exportAsGif(canvas);
      } else {
        blob = await exportAsMP4(canvas);
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wallpaper.${type}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`${type.toUpperCase()} export failed:`, error);
      setError(`Failed to export ${type.toUpperCase()}: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        bgcolor: 'background.paper',
        borderRadius: 1,
        p: 2,
      }}
    >
      <ButtonGroup variant="contained" sx={{ alignSelf: 'center' }}>
        <Tooltip title="Save as GIF">
          <Button
            onClick={() => handleExport('gif')}
            disabled={exporting || !backgroundImage}
            startIcon={exporting ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            Save GIF
          </Button>
        </Tooltip>
        <Tooltip title="Save as MP4">
          <Button
            onClick={() => handleExport('mp4')}
            disabled={exporting || !backgroundImage}
            startIcon={exporting ? <CircularProgress size={20} /> : <MovieIcon />}
          >
            Save MP4
          </Button>
        </Tooltip>
      </ButtonGroup>
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {!backgroundImage && (
          <Box
            sx={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              color: 'text.secondary',
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 48 }} />
            <span>Drag and drop an image or click to upload</span>
          </Box>
        )}
        <canvas
          ref={canvasRef}
          style={{
            border: '2px dashed rgba(255,255,255,0.1)',
            borderRadius: '4px',
          }}
        />
      </Box>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Canvas;
