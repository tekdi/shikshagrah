import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

interface ActionIcon {
  icon: React.ReactNode;
  ariaLabel: string;
  onClick: () => void;
}

interface CommonAppBarProps {
  title?: string;
  showMenuIcon?: boolean;
  menuIconClick?: () => void;
  actionButtonLabel?: string;
  actionButtonClick?: () => void;
  actionButtonColor?: 'inherit' | 'primary' | 'secondary' | 'default';
  position?: 'fixed' | 'absolute' | 'sticky' | 'static' | 'relative';
  color?: 'primary' | 'secondary' | 'default' | 'transparent' | 'inherit';
  actionIcons?: ActionIcon[];
}

export const TopAppBar: React.FC<CommonAppBarProps> = ({
  title = 'Title',
  showMenuIcon = true,
  menuIconClick,
  actionButtonLabel = 'Action',
  actionButtonClick,
  actionButtonColor = 'inherit',
  position = 'fixed',
  color = 'transparent',
  actionIcons = [],
}) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position={position} sx={{ backgroundColor: '#FF9911' }} color={color}>
        <Toolbar>
          {showMenuIcon && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
             
              onClick={menuIconClick}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {actionIcons.map((action, index) => (
            <IconButton
              key={index}
              color="inherit"
              aria-label={action.ariaLabel}
              onClick={action.onClick}
            >
              {action.icon}
            </IconButton>
          ))}
        </Toolbar>
      </AppBar>
    </Box>
  );
};
