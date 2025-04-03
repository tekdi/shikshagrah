/* eslint-disable no-constant-binary-expression */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
'use client';
import { Layout, DynamicCard } from '@shared-lib';
import LogoutIcon from '@mui/icons-material/Logout';
import { useRouter } from 'next/navigation';
import { fetchProfileData } from '../../services/ProfileService';
import { useEffect, useState } from 'react';
import {
  CircularProgress,
  Box,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';
import AppConst from '../../utils/AppConst/AppConst';

export default function Home() {
  const basePath = AppConst?.BASEPATH;
  const cardData = [
    { title: 'Programs', icon: '/sot/assets/images/ic_program.png' },
    { title: 'Projects', icon: '/sot/assets/images/ic_project.png' },
    { title: 'Library', icon: '/sot/assets/images/ic_survey.png' },
    { title: 'Reports', icon: '/sot/assets/images/ic_report.png' },
    { title: 'Observation', icon: '/sot/assets/images/ic_report.png' },
  ];

  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const getProfileData = async () => {
      try {
        const token = localStorage.getItem('accToken') || '';
        const userId = localStorage.getItem('userId') || '';
        const data = await fetchProfileData(userId, token);
        setProfileData(data?.content[0]);
        localStorage.setItem('frameworkname', 'NCF');
      } catch (err) {
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    getProfileData();
  }, []);

  const handleAccountClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('accToken');
    localStorage.clear();
    router.push(`${process.env.NEXT_PUBLIC_LOGINPAGE}`);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleCardClick = (title) => {
    router.push(`/program?title=${encodeURIComponent(title)}`);
  };

  return (
    <>
      <Layout
        showTopAppBar={{
          title: 'Home',
          showMenuIcon: true,
          showBackIcon: false,
          profileIcon: [
            {
              icon: <LogoutIcon />,
              ariaLabel: 'Account',
              onLogoutClick: handleAccountClick,
            },
          ],
        }}
        isFooter={true}
        showLogo={true}
        showBack={true}
      >
        <Box
          sx={{
            minHeight: '100vh',
            marginTop: { xs: '60px', sm: '90px' },
            paddingX: { xs: 2, sm: 3 },
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
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                  variant="h5"
                  color="#073763"
                  fontWeight="bold"
                  fontSize={{ xs: '22px', sm: '24px', md: '26px' }}
                >
                  Welcome, {profileData?.firstName}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 1, fontSize: { xs: '16px', sm: '20px' } }}
                >
                  Browse Shikshagraha library to find relevant content based on
                  your preferences (Board, Medium, Class, Subject)
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  gap: 3,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {cardData
                  .filter((card) => {
                    const isSameOrg =
                      profileData?.rootOrgId === process.env.NEXT_PUBLIC_ORGID;

                    return isSameOrg
                      ? true // Show only these if org ID matches
                      : card.title === 'Projects' || card.title === 'Reports'; // Show all cards if org ID is different
                  })
                  .map((card, index) => (
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
                        maxWidth: { xs: 280, sm: 350 },
                      }}
                      onClick={() => handleCardClick(card.title)}
                    />
                  ))}
              </Box>
            </>
          )}
        </Box>
      </Layout>

      {/* Logout Confirmation Popup */}
      <Dialog open={showLogoutModal} onClose={handleLogoutCancel}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to log out?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} color="primary">
            No
          </Button>
          <Button onClick={handleLogoutConfirm} color="secondary">
            Yes, Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
