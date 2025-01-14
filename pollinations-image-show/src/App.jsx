import { useState, useEffect, useCallback } from 'react';
import { Box, IconButton, Slider, Typography, Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import axios from 'axios';
import './App.css';

function App() {
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [interval, setInterval] = useState(5); // seconds
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const fetchImages = async () => {
    try {
      const response = await axios.get('https://image.pollinations.ai/feed');
      if (response.data) {
        setImages(prevImages => {
          const newImages = [...prevImages];
          if (!newImages.includes(response.data.imageURL)) {
            newImages.push(response.data.imageURL);
          }
          return newImages;
        });
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchImages();
    
    // Set up polling interval
    const fetchInterval = setInterval(fetchImages, 5000);
    return () => clearInterval(fetchInterval);
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    let slideInterval;
    if (isPlaying) {
      slideInterval = setInterval(() => {
        setCurrentImageIndex(prev => 
          (prev + 1) % (showOnlyFavorites ? favorites.length : images.length)
        );
      }, interval * 1000);
    }
    return () => clearInterval(slideInterval);
  }, [isPlaying, interval, images.length, favorites.length, showOnlyFavorites]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const toggleFavorite = (imageUrl) => {
    setFavorites(prev => {
      if (prev.includes(imageUrl)) {
        return prev.filter(url => url !== imageUrl);
      } else {
        return [...prev, imageUrl];
      }
    });
  };

  const displayedImages = showOnlyFavorites ? favorites : images;
  const currentImage = displayedImages[currentImageIndex];

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'black',
      color: 'white'
    }}>
      {currentImage && (
        <Box sx={{ 
          flex: 1, 
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          <img
            src={currentImage}
            alt="Pollinations AI Generated"
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain'
            }}
          />
          <IconButton
            onClick={() => toggleFavorite(currentImage)}
            sx={{ 
              position: 'absolute', 
              top: 16, 
              right: 16,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)'
            }}
          >
            {favorites.includes(currentImage) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Box>
      )}
      
      <Box sx={{ 
        p: 2, 
        bgcolor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <IconButton 
          onClick={() => setIsPlaying(!isPlaying)}
          sx={{ color: 'white' }}
        >
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        
        <Box sx={{ flex: 1, mx: 2 }}>
          <Typography gutterBottom>
            Interval: {interval} seconds
          </Typography>
          <Slider
            value={interval}
            onChange={(_, newValue) => setInterval(newValue)}
            min={1}
            max={30}
            valueLabelDisplay="auto"
          />
        </Box>

        <Button
          variant="outlined"
          color="inherit"
          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
        >
          {showOnlyFavorites ? 'Show All' : 'Show Favorites'}
        </Button>

        <IconButton 
          onClick={toggleFullscreen}
          sx={{ color: 'white' }}
        >
          <FullscreenIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default App;
