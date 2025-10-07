import { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const CATEGORIES = {
  sparkles: 'Sparkles',
  effects: 'Effects',
  nature: 'Nature',
  animals: 'Animals',
};

const Sidebar = ({ onOverlaySelect }) => {
  const [openCategory, setOpenCategory] = useState(null);
  const [overlays, setOverlays] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOverlays = async () => {
      try {
        const response = await fetch('./overlays/overlays.json');
        if (!response.ok) throw new Error('Failed to load overlays');
        const data = await response.json();
        setOverlays(data);
      } catch (err) {
        console.error('Failed to load overlays:', err);
        setError('Failed to load overlays. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadOverlays();
  }, []);

  const handleCategoryClick = (category) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  const handleOverlayClick = async (category, overlay) => {
    try {
      const response = await fetch(`./overlays/${category}/${overlay.file}`);
      if (!response.ok) throw new Error('Failed to load overlay');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        onOverlaySelect({
          image: img,
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
          name: overlay.name,
        });
      };
      img.src = url;
    } catch (err) {
      console.error('Failed to load overlay:', err);
      setError('Failed to load overlay. Please try again.');
    }
  };

  if (loading) {
    return (
      <Paper
        sx={{
          width: 280,
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        width: 280,
        height: '100%',
        overflow: 'auto',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Overlay Elements
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
      <List component="nav">
        {Object.entries(CATEGORIES).map(([key, label]) => (
          <Box key={key}>
            <ListItem
              button
              onClick={() => handleCategoryClick(key)}
              sx={{ bgcolor: openCategory === key ? 'action.selected' : 'inherit' }}
            >
              <ListItemText primary={label} />
              {openCategory === key ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={openCategory === key} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {overlays[key]?.map((overlay, index) => (
                  <ListItem
                    key={index}
                    button
                    sx={{ pl: 4 }}
                    onClick={() => handleOverlayClick(key, overlay)}
                  >
                    {overlay.preview && (
                      <ListItemIcon>
                        <Box
                          component="img"
                          src={`./overlays/${overlay.preview}`}
                          alt={overlay.name}
                          sx={{
                            width: 32,
                            height: 32,
                            objectFit: 'contain',
                          }}
                        />
                      </ListItemIcon>
                    )}
                    <ListItemText
                      primary={overlay.name}
                      secondary={overlay.description}
                    />
                  </ListItem>
                )) || (
                  <ListItem sx={{ pl: 4 }}>
                    <ListItemText
                      secondary="No overlays available in this category"
                    />
                  </ListItem>
                )}
              </List>
            </Collapse>
          </Box>
        ))}
      </List>
    </Paper>
  );
};

export default Sidebar;
