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
import { Layout } from '@shared-lib-v1';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';

import { useRouter } from 'next/router';
import { fetchContent } from '../../services/Read';
import {
  createUserCertificateStatus,
  getUserCertificateStatus,
} from '../../services/Certificate';
import SG_LOGO from '../../../public/assests/images/SG_Logo.png';
import InfoCard from '../../components/InfoCard';
interface ContentDetailsObject {
  name: string;
  [key: string]: any;
}

const ContentDetails = (props: any) => {
  const router = useRouter();
  const { identifier } = router.query;
  const [searchValue, setSearchValue] = useState('');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [contentDetails, setContentDetails] =
    useState<ContentDetailsObject | null>(null);
  const theme = useTheme();
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  useEffect(() => {
    const fetchContentDetails = async () => {
      try {
        const result = await fetchContent(identifier as string);
        const userId = localStorage.getItem('userId');
        setContentDetails(result);
        if (!userId) {
          setContentDetails(result);
          return;
        }
        const data = await getUserCertificateStatus({
          userId: userId,
          courseId: identifier as string,
        });
        if (
          data?.result?.status === 'enrolled' ||
          data?.result?.status === 'completed'
        ) {
          router.replace(`/details/${identifier}`);
        } else {
          setContentDetails(result);
        }
      } catch (error) {
        console.error('Failed to fetch content:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (identifier) {
      fetchContentDetails();
    } else {
      setIsLoading(false);
    }
  }, [identifier]);

  if (!identifier) {
    return <Typography>Loading...</Typography>; // Show loading state while identifier is undefined
  }

  const handleClick = async () => {
    try {
      const data = await createUserCertificateStatus({
        userId: localStorage.getItem('userId') ?? '',
        courseId: identifier as string,
      });
      console.log('createUserCertificateStatus', data);

      router.replace(`/details/${identifier}`);
      // }
    } catch (error) {
      console.error('Failed to create user certificate:', error);
      router.replace(`/details/${identifier}`);
    }
  };
  const onBackClick = () => {
    router.back();
  };

  return (
    <Layout
      showTopAppBar={{
        title: 'Content details',
        showMenuIcon: true,
        showBackIcon: false,
      }}
      isFooter={true}
      showLogo={true}
      showBack={false}
    >
      <InfoCard
        item={contentDetails}
        topic={contentDetails?.se_subjects?.join(',')}
        onBackClick={onBackClick}
        _config={{ onButtonClick: handleClick }}
      />
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
