import { Alert, Box, Typography, List, ListItem, Paper, Divider } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';

const BrowserWarning = ({ issues }) => {
  const criticalIssues = issues.filter(issue => issue.critical);
  const nonCriticalIssues = issues.filter(issue => !issue.critical);

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, bgcolor: 'background.paper' }}>
        <Alert 
          severity="error" 
          icon={<ErrorIcon />}
          sx={{ 
            mb: 3,
            '& .MuiAlert-message': { width: '100%' }
          }}
        >
          <Typography variant="h6" gutterBottom>
            Browser Compatibility Issues Detected
          </Typography>
          <Typography variant="body1">
            Your browser doesn't meet all the requirements needed to run this application.
            Please address the following issues:
          </Typography>
        </Alert>

        {criticalIssues.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" color="error" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ErrorIcon fontSize="small" />
              Critical Issues
            </Typography>
            <List>
              {criticalIssues.map((issue, index) => (
                <ListItem key={index} sx={{ 
                  display: 'block',
                  mb: 2,
                  pl: 2,
                  borderLeft: '3px solid',
                  borderColor: 'error.main'
                }}>
                  <Typography variant="subtitle1" color="error.main" gutterBottom>
                    {issue.feature}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {issue.message}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Solution: {issue.solution}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {nonCriticalIssues.length > 0 && (
          <>
            {criticalIssues.length > 0 && <Divider sx={{ my: 3 }} />}
            <Box>
              <Typography variant="h6" color="warning.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon fontSize="small" />
                Performance Warnings
              </Typography>
              <List>
                {nonCriticalIssues.map((issue, index) => (
                  <ListItem key={index} sx={{ 
                    display: 'block',
                    mb: 2,
                    pl: 2,
                    borderLeft: '3px solid',
                    borderColor: 'warning.main'
                  }}>
                    <Typography variant="subtitle1" color="warning.main" gutterBottom>
                      {issue.feature}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {issue.message}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Solution: {issue.solution}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          </>
        )}

        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            For optimal performance, please use Chrome, Firefox, or Edge (latest versions) with HTTPS enabled.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default BrowserWarning;
