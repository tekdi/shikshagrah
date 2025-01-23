// pages/content-details/[identifier].tsx

'use client';
import React, { useEffect, useState } from 'react';
import { Box, Button, Divider, Typography } from '@mui/material';
import { Layout } from '@shared-lib';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import Grid from '@mui/material/Grid2';

import { useRouter } from 'next/router';
import { fetchContent } from '../../services/Read';
import PlayerPage from '../player/[identifier]';

interface ContentDetailsObject {
  name: string;
  [key: string]: any;
}

const ContentDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [searchValue, setSearchValue] = useState('');
  const [contentDetails, setContentDetails] =
    useState<ContentDetailsObject | null>(null);

  const handleAccountClick = () => {
    console.log('Account clicked');
  };

  const handleMenuClick = () => {
    console.log('Menu icon clicked');
  };

  const handleSearchClick = () => {
    console.log('Search button clicked');
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const fetchContentDetails = async () => {
    try {
      if (id) {
        const result = await fetchContent(id as string);
        setContentDetails(result);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchContentDetails();
    }
  }, [id]);

  if (!id) {
    return <Typography>Loading...</Typography>; // Show loading state while identifier is undefined
  }
  console.log('content-details---', contentDetails);
  return (
    <Layout
      showTopAppBar={{
        title: 'Content Details',
        showMenuIcon: true,
        menuIconClick: handleMenuClick,
        actionButtonLabel: 'Action',
        actionIcons: [
          {
            icon: <AccountCircleIcon />,
            ariaLabel: 'Account',
            onClick: handleAccountClick,
          },
        ],
      }}
      showSearch={{
        placeholder: 'Search content..',
        rightIcon: <SearchIcon />,
        inputValue: searchValue,
        onInputChange: handleSearchChange,
        onRightIconClick: handleSearchClick,
        sx: {
          backgroundColor: '#f0f0f0',
          padding: '4px',
          borderRadius: '50px',
          width: '100%',
        },
      }}
      isFooter={false}
      showLogo={true}
      showBack={true}
      sx={{ height: '0vh' }}
    >
      <Grid container spacing={2} sx={{ marginY: '16px' }}>
        {/* Placeholder Triangle Section */}
        <Grid size={{ xs: 12 }} sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: '500px',
              margin: 'auto',
            }}
          />
          <PlayerPage id={id} />
        </Grid>
      </Grid>

      {/* Section Header */}
      <Grid container spacing={2} sx={{ marginBottom: '16px' }}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" fontWeight="bold">
            Section Header
          </Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <ul>
            <li>
              <Typography>
                Audience:
                {contentDetails?.audience
                  ?.map((boardId: any) => boardId)
                  .join(', ')}
              </Typography>
            </li>
            <li>
              <Typography>
                Language:{' '}
                {contentDetails?.language
                  ?.map((boardId: any) => boardId)
                  .join(', ')}
              </Typography>
            </li>
            <li>
              <Typography>License: {contentDetails?.license || ''}</Typography>
            </li>
          </ul>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" fontWeight="bold">
                Syllabus
              </Typography>
            </Grid>

            <Grid
              container
              alignItems="center"
              justifyContent="space-between"
              sx={{ marginY: '8px' }}
            >
              <Grid size={{ xs: 12 }}>
                <Typography fontWeight="bold">
                  {contentDetails?.description
                    ? contentDetails.description
                    : 'No description available'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Divider sx={{ marginY: '24px' }} />
    </Layout>
  );
};

export default ContentDetails;
