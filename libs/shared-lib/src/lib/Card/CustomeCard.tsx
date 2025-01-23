'use client';
import { Card, CardContent, CardMedia, Typography,Box } from '@mui/material';
export const DynamicCard = ({ title, icon }) => {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <Box sx={{ fontSize: 48, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 2 }}>
        {typeof icon === 'string' ? icon : icon} {/* Render string as emoji or React element */}
      </Box>

      <CardContent>
      {/* <Typography variant="body2" color="text.secondary">
          {icon}
        </Typography> */}
        <Typography variant="h5" component="div">
          {title}
        </Typography>
        
      </CardContent>
    </Card>
  );
};
