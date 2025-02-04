import { Alert, Box, Typography, List, ListItem } from '@mui/material';

const BrowserWarning = ({ issues }) => {
  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Browser Compatibility Issues Detected
        </Typography>
        <Typography variant="body1" gutterBottom>
          This app requires certain modern browser features to function properly.
        </Typography>
        <List>
          {issues.map((issue, index) => (
            <ListItem key={index}>
              <Typography variant="body2">{issue}</Typography>
            </ListItem>
          ))}
        </List>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Recommended browsers: Chrome, Firefox, or Edge (latest versions)
        </Typography>
      </Alert>
    </Box>
  );
};

export default BrowserWarning;
