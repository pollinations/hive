import { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

const COMMON_RESOLUTIONS = [
  { label: '1920x1080 (Full HD)', width: 1920, height: 1080 },
  { label: '2560x1440 (2K)', width: 2560, height: 1440 },
  { label: '3840x2160 (4K)', width: 3840, height: 2160 },
  { label: '1280x720 (HD)', width: 1280, height: 720 },
];

const Controls = ({ onResolutionSet }) => {
  const [selectedResolution, setSelectedResolution] = useState('');

  const handleResolutionSelect = (event) => {
    setSelectedResolution(event.target.value);
  };

  const handleContinue = () => {
    const resolution = COMMON_RESOLUTIONS.find(
      (res) => res.label === selectedResolution
    );
    if (resolution) {
      onResolutionSet({ width: resolution.width, height: resolution.height });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          textAlign: 'center',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Live Wallpaper Creator
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Choose your wallpaper resolution to get started
        </Typography>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Resolution</InputLabel>
          <Select
            value={selectedResolution}
            onChange={handleResolutionSelect}
            label="Select Resolution"
          >
            {COMMON_RESOLUTIONS.map((resolution) => (
              <MenuItem key={resolution.label} value={resolution.label}>
                {resolution.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleContinue}
          disabled={!selectedResolution}
          sx={{ minWidth: 200 }}
        >
          Continue
        </Button>
      </Paper>
    </Container>
  );
};

export default Controls;
