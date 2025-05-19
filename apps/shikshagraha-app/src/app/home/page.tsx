/* eslint-disable no-constant-binary-expression */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
'use client';
import { Layout, DynamicCard } from '@shared-lib';
import LogoutIcon from '@mui/icons-material/Logout';
import { useRouter } from 'next/navigation';
import { fetchProfileData } from '../../services/ProfileService';
import { readHomeListForm } from '../../services/LoginService';
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
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [cardData, setCardData] = useState([]);
  const navigate = useRouter();

  useEffect(() => {
    const accToken = localStorage.getItem('accToken');
    if (!accToken) {
      // router.replace(''); // Redirect to login page
      router.push(`${process.env.NEXT_PUBLIC_LOGINPAGE}`);
    } else {
      const getProfileData = async () => {
        try {
          const token = localStorage.getItem('accToken') || '';
          const userId = localStorage.getItem('userId') || '';
        } catch (err) {
          setError('Failed to load profile data');
        } finally {
          setLoading(false);
        }
      };

      getProfileData();

      async function fetchConfig() {
        const header = JSON.parse(localStorage.getItem('headers'));
        const token = localStorage.getItem('accToken');

        if (!header['org-id']) return;
        try {
          const data = await readHomeListForm(token);
          setCardData(data.result.data.fields.data);
          localStorage.setItem(
            'theme',
            JSON.stringify(data.result.data.fields.data[0].theme)
          );
        } catch (err) {
          setError((err as Error).message);
        }
      }
      fetchConfig();
    }
  }, [router]);

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

  const handleCardClick = (card) => {
    window.location.href = buildProgramUrl(card.url, card.sameOrigin);
  };

  const buildProgramUrl = (path: string, sameOrigin: boolean): string => {
    if (sameOrigin) {
      const base = process.env.NEXT_PUBLIC_PROGRAM_BASE_URL;
      if (!base) {
        throw new Error('NEXT_PUBLIC_PROGRAM_BASE_URL is not defined');
      }
      return `${base}${path}`;
    }
    return path;
  };

  return (
    <>
      <Layout
        showTopAppBar={{
          title: 'Home',
          showMenuIcon: true,
          showBackIcon: false,
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
              {cardData.length > 0 &&
                cardData.map((card, index) => (
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
                    onClick={() => handleCardClick(card)}
                  />
                ))}
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
                  color="#582E92"
                  fontWeight="bold"
                  fontSize={{ xs: '22px', sm: '24px', md: '26px' }}
                >
                  Welcome, {localStorage.getItem('firstname')}
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
                {cardData.length > 0 &&
                  cardData
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
                        onClick={() => handleCardClick(card)}
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
