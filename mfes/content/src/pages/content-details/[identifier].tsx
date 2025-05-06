// pages/content-details/[identifier].tsx

'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardMedia,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { Layout } from '@shared-lib';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';

import { useRouter } from 'next/router';
import { fetchContent } from '../../services/Read';
import { createUserCertificateStatus } from '../../services/Certificate';
import SG_LOGO from '../../../public/assests/images/SG_Logo.png';
interface ContentDetailsObject {
  name: string;
  [key: string]: any;
}

const ContentDetails = () => {
  const router = useRouter();
  const { identifier } = router.query;
  const [searchValue, setSearchValue] = useState('');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [contentDetails, setContentDetails] =
    useState<ContentDetailsObject | null>(null);
  const theme = useTheme();
  const handleBackClick = () => {
    router.back(); // Navigate to the previous page
  };
  const handleAccountClick = (event: React.MouseEvent<HTMLElement>) => {
    console.log('Account clicked');
    setAnchorEl(event.currentTarget);
  };
  const fetchContentDetails = async () => {
    try {
      if (identifier) {
        const result = await fetchContent(identifier as string);
        setContentDetails(result);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    }
  };

  useEffect(() => {
    if (identifier) {
      fetchContentDetails();
    }
  }, [identifier]);

  if (!identifier) {
    return <Typography>Loading...</Typography>; // Show loading state while identifier is undefined
  }

  const handleClick = async () => {
    try {
      // const data = await createUserCertificateStatus({
      //   userId: localStorage.getItem('userId') ?? '',
      //   courseId: identifier as string,
      // });
      // console.log('createUserCertificateStatus', data);

      router.replace(`/details/${identifier}`);
      // }
    } catch (error) {
      console.error('Failed to create user certificate:', error);
    }
  };
  return (
    <Layout
      showTopAppBar={{
        title: 'Content',
        showMenuIcon: false,
        // actionIcons: [
        //   {
        //     icon: <LogoutIcon />,
        //     ariaLabel: 'Logout',
        //     onLogoutClick: handleAccountClick,
        //   },
        // ],
      }}
      isFooter={true}
      showLogo={true}
      showBack={true}
    >
      <Grid container spacing={2} sx={{ marginTop: '120px', padding: 2 }}>
        <Grid size={{ xs: 2, md: 1 }} sx={{ textAlign: 'center' }}>
          <Typography fontSize={'12px'} fontWeight={400}>
            {contentDetails?.name}
          </Typography>
          <Box
            sx={{
              margin: 'auto',
              textAlign: 'center',
              // width: { xs: '100%', sm: '100%', md: '500px', lg: '500px' },
              // height: { xs: 'auto', md: 'auto', lg: '100vh' },
            }}
          >
            <ImageCard
              image={contentDetails?.posterImage ?? SG_LOGO.src}
              name={''}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 11 }}>
          <Stack spacing={2}>
            <Typography fontSize={'12px'} fontWeight={700}>
              Description
            </Typography>
            <Typography fontSize={'14px'} fontWeight={400}>
              {contentDetails?.description ? contentDetails.description : '-'}
            </Typography>
          </Stack>
        </Grid>
      </Grid>

      <Divider sx={{ borderWidth: '1px', width: '100%', marginTop: '16px' }} />
      <Grid container justifyContent="center" sx={{ marginBottom: '16px' }}>
        <Button
          variant="contained"
          sx={{
            // bgcolor: '#6750A4',

            bgcolor: theme.palette.primary.main,
            color: '#fff',
            margin: '12px',
            borderRadius: '100px',
            textTransform: 'none',
            boxShadow: 'none',
          }}
          //onClick={() => router.push(`/details/${identifier}`)}
          onClick={handleClick}
        >
          Join Now/Start Course
        </Button>
      </Grid>
    </Layout>
  );
};

export default ContentDetails;
const ImageCard = ({
  image,
  name,
  _image,
}: {
  image: string;
  name: React.ReactNode | string;
  _image?: object;
  _text?: object;
}) => {
  return (
    <Card sx={{ width: '100%' }}>
      <CardActionArea>
        <CardMedia
          component="img"
          alt={typeof name === 'string' ? name : ''}
          sx={_image}
          image={image}
        />
        {/* <CardContent
          sx={{
            backgroundColor: '#DDE8FF',
            alignItems: 'flex-start',
            textAlign: 'start',
            padding: '12px 10px',
            ..._text,
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontWeight: 400,
              fontSize: '12px',
              lineHeight: '18px',
              letterSpacing: '0.32px',
            }}
          >
            {name}
          </Typography>
        </CardContent> */}
      </CardActionArea>
    </Card>
  );
};
