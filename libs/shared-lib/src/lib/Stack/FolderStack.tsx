import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FolderIcon from '@mui/icons-material/Folder';
import Box from '@mui/material/Box';

interface FolderItemProps {
  title: string;
  subheader: string;
}

export const FolderStack: React.FC<FolderItemProps> = ({
  title,
  subheader,
}) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '15px',
      }}
    >
      {/* Folder Icon */}
      <FolderIcon fontSize="large" color="primary" />

      {/* Text Container */}
      <Box sx={{ overflow: 'hidden' }}>
        {/* Title */}
        <Typography
          variant="body1"
          fontWeight="bold"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </Typography>

        {/* Subheader */}
        <Typography variant="body2" color="textSecondary" noWrap>
          {subheader}
        </Typography>
      </Box>
    </Stack>
  );
};
// <FolderStack title="Project Files" subheader="Last modified: Today" />
