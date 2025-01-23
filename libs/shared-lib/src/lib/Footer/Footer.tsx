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
    } else if (pathname === '/content') {
      setValue(1);
    } else if (pathname === '/profile') {
      setValue(2);
    }
  }, [pathname]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (value !== newValue) {
      setValue(newValue);
      if (newValue === 0) {
        router.push('/home');
      } else if (newValue === 1) {
        router.push('/content');
      } else {
        router.push('/profile');
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
        bgcolor: '#FF9911', // Match header background color
        borderTop: (theme) => `1px solid ${theme.palette.divider}`, // Optional border for separation
      }}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={handleChange}
        sx={{
          bgcolor: 'transparent',
          '& .Mui-selected': {
            color: '#582E92', // Color for the selected tab's icon and label
          },
          '& .MuiBottomNavigationAction-root': {
            color: 'black', // Default icon and label color
          },
        }}
      >
        <BottomNavigationAction
          
          icon={<HomeIcon />}
          sx={{
            '& .MuiSvgIcon-root': {
              color: value === 0 ? '#582E92' : 'black', // Active icon white, inactive icon black
            },
          }}
        />
        <BottomNavigationAction
          
          icon={<DescriptionIcon />}
          sx={{
            '& .MuiSvgIcon-root': {
              color: value === 1 ? '#582E92' : 'black', // Active icon white, inactive icon black
            },
          }}
        />
        <BottomNavigationAction
         
          icon={<AccountCircleIcon />}
          sx={{
            '& .MuiSvgIcon-root': {
              color: value === 2 ? '#582E92' : 'black', // Active icon white, inactive icon black
            },
          }}
        />
      </BottomNavigation>
    </Box>
  );
};
