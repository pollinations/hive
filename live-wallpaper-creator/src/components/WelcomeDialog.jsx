import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import HelpIcon from '@mui/icons-material/Help';

const WelcomeDialog = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="welcome-dialog-title"
      maxWidth="sm"
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Get Started
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WelcomeDialog;
