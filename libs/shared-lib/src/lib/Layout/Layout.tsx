"use client";
import React from 'react';
import Box from '@mui/material/Box';
import { Footer } from '../Footer/Footer';
import { TopAppBar } from '../Header/TopAppBar';

interface LayoutProps {
  children: React.ReactNode;
  isFooter?: boolean;
  showBack?: boolean;
  showLogo?: boolean;
  sx?: object;
  drawerItems?: {
    text: string;
    to: string;
    icon?: React.ReactNode;
  }[];
  onItemClick?: (to: string) => void;
  showSearch?: {
    placeholder: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onLeftIconClick?: () => void;
    onRightIconClick?: () => void;
    inputValue?: string;
    onInputChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    sx?: object;
  };
  showTopAppBar?: {
    title?: string;
    showMenuIcon?: boolean;
    showBackIcon?: boolean;
    menuIconClick?: () => void;
    backIconClick?: () => void;
    actionButtonLabel?: string;
    actionButtonClick?: () => void;
    actionButtonColor?: 'inherit' | 'primary' | 'secondary' | 'default';
    position?: 'fixed' | 'absolute' | 'sticky' | 'static' | 'relative';
    color?: 'primary' | 'secondary' | 'default' | 'transparent' | 'inherit';
    actionIcons?: {
      icon: React.ReactNode;
      ariaLabel: string;
      onClick: () => void;
    }[];
  };
  topAppBarIcons?: {
    icon: React.ReactNode;
    ariaLabel: string;
    onClick: () => void;
  }[];
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  isFooter,
  showBack,
  showLogo,
  showSearch,
  showTopAppBar,
  topAppBarIcons = [],
  drawerItems = [],
  onItemClick,
  sx = {},
}) => {
  const footerHeight = 60; // Footer height in pixels

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        ...sx,
      }}
    >
      {/* Top AppBar */}
      {showTopAppBar && (
        <Box sx={{ width: '100%', position: 'sticky', top: 0, zIndex: 10 }}>
          <TopAppBar
            title={showTopAppBar.title}
            actionIcons={topAppBarIcons}
            menuIconClick={() => console.log('Menu clicked')}
            {...showTopAppBar}
          />
        </Box>
      )}

      {/* Main Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          width: '100%',
          paddingBottom: isFooter ? `${footerHeight}px` : 0,
          marginTop: '50px'
        }}
      >
        {children}
      </Box>

      {/* Footer */}
      {isFooter && (
        <Box
          sx={{
            width: '100%',
            height: `${footerHeight}px`,
            position: 'fixed',
            bottom: 0,
            zIndex: 10, // Ensure footer appears above other elements
          }}
        >
          <Footer />
        </Box>
      )}
    </Box>
  );
};
