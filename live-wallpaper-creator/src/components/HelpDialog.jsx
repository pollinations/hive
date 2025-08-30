import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';

const HelpDialog = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="help-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="help-dialog-title">Live Wallpaper Creator Help</DialogTitle>
      <DialogContent>
        <Typography variant="h6" gutterBottom>
          Keyboard Shortcuts
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Ctrl/⌘ + O"
              secondary="Open file picker to upload background image"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Ctrl/⌘ + S"
              secondary="Save as GIF"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Ctrl/⌘ + Shift + S"
              secondary="Save as MP4"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="?"
              secondary="Show/hide this help dialog"
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Features
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Background Image"
              secondary="Upload by dragging and dropping or using the file picker"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Export Options"
              secondary="Save your wallpaper as either GIF or MP4 format"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Progress Tracking"
              secondary="Visual progress bar shows export status"
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Tips
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="File Size"
              secondary="Higher resolutions will result in larger file sizes. A warning will appear for files over 100MB."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Browser Support"
              secondary="For best results, use Chrome, Firefox, or Edge with HTTPS enabled."
            />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpDialog;
