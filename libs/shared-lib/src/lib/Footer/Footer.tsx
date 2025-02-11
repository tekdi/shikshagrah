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
        // router.replace('/home');
        window.location.href = '/home';
      } else if (newValue === 1) {
        router.replace(`${process.env.NEXT_PUBLIC_CONTENT}/content`);
      } else {
        // router.replace('http://localhost:3000/profile');
        window.location.href = '/profile';
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
        borderRadius: '25px 25px 0 0', // Match header background color
      }}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={handleChange}
        sx={{
          borderBottom: '2px solid #FFD580', // Light shade of #FF9911 for the bottom border
          boxShadow: '0px 2px 4px rgba(255, 153, 17, 0.2)', // Subtle shadow
          backgroundColor: '#FFF7E6', // Light background derived from #FF9911
          borderRadius: '25px 25px 0 0',

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
