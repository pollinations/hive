import { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const CATEGORIES = {
  sparkles: 'Sparkles',
  animals: 'Animals',
  nature: 'Nature',
  effects: 'Effects',
};

const Sidebar = ({ onOverlaySelect }) => {
  const [openCategory, setOpenCategory] = useState(null);

  const handleCategoryClick = (category) => {
    setOpenCategory(openCategory === category ? null : category);
  };

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
                <ListItem sx={{ pl: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No overlays available yet
                  </Typography>
                </ListItem>
              </List>
            </Collapse>
          </Box>
        ))}
      </List>
    </Paper>
  );
};

export default Sidebar;
