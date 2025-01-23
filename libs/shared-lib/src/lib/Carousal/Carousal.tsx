import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

interface CarouselProps {
  items: React.ReactNode[];
}

export const Carousal: React.FC<CarouselProps> = ({ items }) => {
  const [index, setIndex] = React.useState(0);

  const handleChangeIndex = (newIndex: number) => {
    setIndex(newIndex);
  };

  const handleNext = () => {
    setIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const handlePrev = () => {
    setIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <SwipeableViews index={index} onChangeIndex={handleChangeIndex}>
        {items.map((item, i) => (
          <Box key={i} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Paper
              sx={{
                width: '100%',
                height: 300,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {item}
            </Paper>
          </Box>
        ))}
      </SwipeableViews>

      {/* Left and Right Navigation Buttons */}
      <IconButton
        onClick={handlePrev}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '10px',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
        }}
      >
        <ChevronLeft />
      </IconButton>

      <IconButton
        onClick={handleNext}
        sx={{
          position: 'absolute',
          top: '50%',
          right: '10px',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
        }}
      >
        <ChevronRight />
      </IconButton>
    </Box>
  );
};
