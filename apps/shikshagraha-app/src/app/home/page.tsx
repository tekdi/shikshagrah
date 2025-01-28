'use client';
import { Layout, DynamicCard } from '@shared-lib';
import LogoutIcon from '@mui/icons-material/Logout';
import { useRouter } from 'next/navigation';
import { fetchProfileData } from '../../services/ProfileService';
import { useEffect, useState } from 'react';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import { Button, CircularProgress, Box, Typography } from '@mui/material';

export default function Home() {
  const cardData = [
    { title: 'Programs', icon: '📄' },
    { title: 'Projects', icon: '📐' },
    { title: 'Survey', icon: '📊' },

    { title: 'Reports', icon: '📊' },
  ];

  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getProfileData = async () => {
      try {
        const token = localStorage.getItem('accToken') || '';
        const userId = localStorage.getItem('userId') || '';

        const data = await fetchProfileData(userId, token);
        setProfileData(data);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    getProfileData();
  }, []);

  const handleAccountClick = () => {
    console.log('Account clicked');
    router.push('http://localhost:3000');
    localStorage.removeItem('accToken');
  };

  return (
    <Layout
      showTopAppBar={{
        title: 'Home',
        showMenuIcon: false,
        actionIcons: [
          {
            icon: <LogoutIcon />,
            ariaLabel: 'Account',
            onClick: handleAccountClick,
          },
        ],
      }}
      isFooter={true}
      showLogo={true}
      showBack={true}
    >
      <Box
        sx={{
          padding: '20px',
          bgcolor: '#f5f5f5',

          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '50vh',
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography variant="h6" color="error" textAlign="center">
            {error}
          </Typography>
        ) : (
          <>
            <Box sx={{ textAlign: 'center', marginBottom: '20px' }}>
              <Typography variant="h5" color="#582E92" fontWeight="bold" fontSize="20px">
                Welcome, {profileData?.firstName}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ marginTop: 1 }}
              >
                Browse Shikshagraha library to find relevant content based on
                your preferences (Board, Medium, Class, Subject)
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: '20px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginBottom: 4,
              }}
            >
              {cardData.map((card, index) => (
                <DynamicCard
                  key={index}
                  title={card.title}
                  icon={card.icon}
                  sx={{
                    borderRadius: 2,
                    boxShadow: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 6,
                    },
                  }}
                />
              ))}
            </Box>
          </>
        )}
      </Box>
    </Layout>
  );
}
