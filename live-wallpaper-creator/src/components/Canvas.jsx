import { useRef, useEffect, useState, useCallback } from 'react';
import { Box, Button, ButtonGroup, Tooltip, CircularProgress, Alert, Snackbar, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import Draggable from 'react-draggable';
import { exportAsGif, exportAsMP4 } from '../utils/export';
import SaveIcon from '@mui/icons-material/Save';
import MovieIcon from '@mui/icons-material/Movie';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinearProgress from '@mui/material/LinearProgress';

const Input = styled('input')({
  display: 'none',
});

const Canvas = ({ resolution, backgroundImage, overlays, onBackgroundSet, onOverlaysChange }) => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const containerWidth = canvas.parentElement.clientWidth;
    const containerHeight = canvas.parentElement.clientHeight;
    
    const scaleX = containerWidth / resolution.width;
    const scaleY = containerHeight / resolution.height;
    const newScale = Math.min(scaleX, scaleY) * 0.9;
    setScale(newScale);
    
    canvas.style.width = `${resolution.width * newScale}px`;
    canvas.style.height = `${resolution.height * newScale}px`;
    
    canvas.width = resolution.width;
    canvas.height = resolution.height;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }
    
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

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'o' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      fileInputRef.current?.click();
    } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!exporting && backgroundImage) {
        handleExport(e.shiftKey ? 'mp4' : 'gif');
      }
    }
  }, [exporting, backgroundImage]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
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
      setProgress(0);
      const canvas = canvasRef.current;
      let blob;

      const updateProgress = (p) => {
        setProgress(Math.round(p * 100));
      };

      if (type === 'gif') {
        blob = await exportAsGif(canvas, 30, updateProgress);
      } else {
        blob = await exportAsMP4(canvas, 30, updateProgress);
      }

      // Check file size
      if (blob.size > 100 * 1024 * 1024) { // 100MB
        setError('Warning: The exported file is quite large. You might want to reduce the resolution or duration.');
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
      setProgress(0);
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
        <Tooltip title="Save as GIF (Ctrl/⌘ + S)">
          <Button
            onClick={() => handleExport('gif')}
            disabled={exporting || !backgroundImage}
            startIcon={exporting ? <CircularProgress size={20} /> : <SaveIcon />}
            aria-label="Save as GIF"
          >
            Save GIF
          </Button>
        </Tooltip>
        <Tooltip title="Save as MP4 (Ctrl/⌘ + Shift + S)">
          <Button
            onClick={() => handleExport('mp4')}
            disabled={exporting || !backgroundImage}
            startIcon={exporting ? <CircularProgress size={20} /> : <MovieIcon />}
            aria-label="Save as MP4"
          >
            Save MP4
          </Button>
        </Tooltip>
      </ButtonGroup>
      {exporting && (
        <Box sx={{ width: '100%', mt: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            aria-label="Export progress"
          />
        </Box>
      )}
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
        role="region"
        aria-label="Canvas area"
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
            <label htmlFor="upload-image">
              <Input
                accept="image/*"
                id="upload-image"
                type="file"
                onChange={handleFileInput}
                ref={fileInputRef}
                aria-label="Upload image"
              />
              <IconButton
                color="primary"
                aria-label="Upload picture"
                component="span"
                sx={{ mb: 1 }}
              >
                <CloudUploadIcon sx={{ fontSize: 48 }} />
              </IconButton>
            </label>
            <span>Drag and drop an image or click to upload (Ctrl/⌘ + O)</span>
          </Box>
        )}
        <canvas
          ref={canvasRef}
          style={{
            border: '2px dashed rgba(255,255,255,0.1)',
            borderRadius: '4px',
          }}
          aria-label="Wallpaper canvas"
        />
      </Box>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          sx={{ width: '100%' }}
          role="alert"
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Canvas;
