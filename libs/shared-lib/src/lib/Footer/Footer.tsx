import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useRouter, usePathname } from 'next/navigation';

export const Footer: React.FC = () => {
  const [value, setValue] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/home') {
      setValue(0);
    } else if (pathname.startsWith('/content')) {
      setValue(1);
    } else if (pathname.startsWith('/profile')) {
      setValue(2);
    }
  }, [pathname]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (value !== newValue) {
      setValue(newValue);
      if (newValue === 0) {
        window.location.href = '/shikshalokam/home';
      } else if (newValue === 1) {
        router.replace(`${process.env.NEXT_PUBLIC_CONTENT}/content`);
      } else {
        window.location.href = '/shikshalokam/profile';
      }
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        position: 'fixed',
        bottom: 0,
        zIndex: 10,
        marginLeft: '-8px',
        borderTop: '5px solid #FFD580',
        borderRadius: '25px 25px 0 0',
      }}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={handleChange}
        sx={{
          borderBottom: '2px solid #FFD580',
          boxShadow: '0px 2px 4px rgba(255, 153, 17, 0.2)',
          backgroundColor: '#FFF7E6',
          borderRadius: '25px 25px 0 0',
          '& .Mui-selected': {
            color: '#FFC857', // Selected icon color set to orange
          },
          '& .MuiBottomNavigationAction-root': {
            color: 'black',
          },
        }}
      >
        <BottomNavigationAction
          icon={
            <HomeIcon
              sx={{
                fontSize: value === 0 ? '2rem' : '1.5rem', // Zoom in for selected icon
                transition: 'transform 0.3s ease, color 0.3s ease', // Smooth zoom and color transition
                transform: value === 0 ? 'scale(1.2)' : 'scale(1)',
                color: value === 0 ? '#024F9D ' : 'inherit', // Selected icon color
              }}
            />
          }
        />
        <BottomNavigationAction
          icon={
            <DescriptionIcon
              sx={{
                fontSize: value === 1 ? '2rem' : '1.5rem',
                transition: 'transform 0.3s ease, color 0.3s ease',
                transform: value === 1 ? 'scale(1.2)' : 'scale(1)',
                color: value === 1 ? '#024F9D ' : 'inherit', // Selected icon color
              }}
            />
          }
        />
        <BottomNavigationAction
          icon={
            <AccountCircleIcon
              sx={{
                fontSize: value === 2 ? '2rem' : '1.5rem',
                transition: 'transform 0.3s ease, color 0.3s ease',
                transform: value === 2 ? 'scale(1.2)' : 'scale(1)',
                color: value === 2 ? '#024F9D ' : 'inherit', // Selected icon color
              }}
            />
          }
        />
      </BottomNavigation>
    </Box>
  );
};
