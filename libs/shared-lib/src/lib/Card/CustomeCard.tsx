'use client';
import { Card, CardContent, Box, Typography } from '@mui/material';

export const DynamicCard = ({ title, icon, onClick }) => {
  const isImage = typeof icon === 'string' && icon.startsWith('/'); // Check if it's an image path

  return (
    <Card
      sx={{
        maxWidth: { xs: 280, sm: 350 }, // Reduced card width
        textAlign: 'center',
        padding: 1.5, // Reduced padding
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          fontSize: 40, // Reduced icon size
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 1.5, // Adjusted spacing
        }}
      >
        {isImage ? (
          <img
            src={icon}
            alt={title}
            style={{ height: '40px', width: '40px' }} // Reduced image dimensions
          />
        ) : (
          icon
        )}
      </Box>
      <CardContent>
        <Typography variant="h6" component="div" sx={{ fontSize: '16px' }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};
