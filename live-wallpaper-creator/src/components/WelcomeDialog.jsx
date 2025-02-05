import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, List, ListItem, ListItemIcon, ListItemText, Divider, Box, Link } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import HelpIcon from '@mui/icons-material/Help';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LaptopIcon from '@mui/icons-material/Laptop';

const WelcomeDialog = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="welcome-dialog-title"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle id="welcome-dialog-title">Welcome to Live Wallpaper Creator</DialogTitle>
      <DialogContent>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Get Started
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WelcomeDialog;
