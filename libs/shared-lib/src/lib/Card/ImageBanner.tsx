import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const images = [
  {
    img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
    title: 'Breakfast',
  },
  {
    img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
    title: 'Burger',
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
  },
  {
    img: 'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c',
    title: 'Coffee',
  },
  {
    img: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8',
    title: 'Hats',
  },
];

export const ImageBanner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Automatically change images every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 1000); // Change image every 1 second

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        height: '300px', // Adjust as needed
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '10px',
      }}
    >
      {/* Background Image */}
      <Box
        component="img"
        src={images[currentIndex].img}
        alt={images[currentIndex].title}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'opacity 0.5s ease-in-out',
        }}
      />

      {/* Title Overlay */}
      <Typography
        variant="h6"
        sx={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          color: 'white',
          // backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '5px 10px',
          // borderRadius: '5px',
        }}
      >
        {images[currentIndex].title}
      </Typography>
    </Box>
  );
};
