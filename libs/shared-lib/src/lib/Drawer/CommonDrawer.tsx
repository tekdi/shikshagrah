import React, { useState } from 'react';
import {
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface DrawerItem {
  text: string;
  icon?: React.ReactNode;
  to: string;
}

interface CategoryItem {
  text: string;
  icon?: React.ReactNode;
  to: string;
  subCategories?: CategoryItem[];
}

interface CommonDrawerProps {
  open: boolean;
  onDrawerClose: () => void;
  items: DrawerItem[];
  categories: CategoryItem[];
  onItemClick: (to: string) => void;
}

export const CommonDrawer: React.FC<CommonDrawerProps> = ({
  open,
  onDrawerClose,
  items,
  onItemClick,
  categories,
}) => {
  const [openDrawer, setOpenDrawer] = useState<
    'main' | 'category' | 'subcategory'
  >('main');
  const [currentCategory, setCurrentCategory] = useState<CategoryItem | null>(
    null
  );
  const [currentSubcategory, setCurrentSubcategory] =
    useState<CategoryItem | null>(null);

  const handleCategoryClick = (category: CategoryItem) => {
    if (category.subCategories) {
      setCurrentCategory(category);
      setOpenDrawer('category');
    } else {
      onItemClick(category.to);
    }
  };

  const handleSubcategoryClick = (subcategory: CategoryItem) => {
    if (subcategory.subCategories) {
      setCurrentSubcategory(subcategory);
      setOpenDrawer('subcategory');
    } else {
      onItemClick(subcategory.to);
    }
  };

  const handleBack = () => {
    if (openDrawer === 'subcategory') {
      setOpenDrawer('category');
      setCurrentSubcategory(null);
    } else {
      setOpenDrawer('main');
      setCurrentCategory(null);
    }
  };

  return (
    <Drawer anchor="left" open={open} onClose={onDrawerClose}>
      <List>
        {/* Main Menu */}
        <Typography
          fontSize={'14px'}
          color="#49454F"
          sx={{ padding: '8px 16px', display: 'flex', alignItems: 'center' }}
        >
          {openDrawer !== 'main' && (
            <ListItemIcon sx={{ cursor: 'pointer' }} onClick={handleBack}>
              <ArrowBackIcon />
            </ListItemIcon>
          )}
          Main menu
        </Typography>

        {/* Render Main Menu Items */}
        {openDrawer === 'main' &&
          items.map((item) => (
            <ListItemButton
              key={item.text}
              onClick={() => onItemClick(item.to)}
            >
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}

        <Divider />

        {/* All Categories */}
        <Typography
          fontSize={'14px'}
          color="#073763"
          sx={{ padding: '8px 16px', display: 'flex', alignItems: 'center' }}
        >
          {openDrawer !== 'main' && (
            <ListItemIcon sx={{ cursor: 'pointer' }} onClick={handleBack}>
              <ArrowBackIcon />
            </ListItemIcon>
          )}
          All Categories
        </Typography>

        {/* Render Main Categories */}
        {openDrawer === 'main' &&
          categories.map((category) => (
            <ListItemButton
              key={category.text}
              onClick={() => handleCategoryClick(category)}
            >
              <ListItemText primary={category.text} />
              {category.subCategories && <ArrowForwardIcon />}
            </ListItemButton>
          ))}

        {/* Render Category Subcategories */}
        {openDrawer === 'category' &&
          currentCategory?.subCategories?.map((subcategory) => (
            <ListItemButton
              key={subcategory.text}
              onClick={() => handleSubcategoryClick(subcategory)}
            >
              <ListItemText primary={subcategory.text} />
              {subcategory.subCategories && <ArrowForwardIcon />}
            </ListItemButton>
          ))}

        {/* Render Subcategory Subcategories */}
        {openDrawer === 'subcategory' &&
          currentSubcategory?.subCategories?.map((subSubcategory) => (
            <ListItemButton
              key={subSubcategory.text}
              onClick={() => onItemClick(subSubcategory.to)}
            >
              <ListItemText primary={subSubcategory.text} />
            </ListItemButton>
          ))}
      </List>
    </Drawer>
  );
};
