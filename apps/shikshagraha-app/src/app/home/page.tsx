/* eslint-disable no-constant-binary-expression */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
'use client';
import { Layout, DynamicCard } from '@shared-lib';
import LogoutIcon from '@mui/icons-material/Logout';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
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
      router.push(`${window.location.origin}?unAuth=true`);
      return;
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
          let cards = Array.isArray(data?.result) ? [...data.result] : [];

          // Normalize API-provided content tile if present
          cards = cards.map((c: any) => {
            if (c?.feature_code === 'content' && c?.meta) {
              const meta = { ...(c.meta || {}) };
              // Resolve meta.url if it's provided as an env string literal
              if (
                typeof meta.url === 'string' &&
                meta.url.startsWith('process.env.')
              ) {
                if (meta.url.includes('NEXT_PUBLIC_CONTENT_TILE_URL')) {
                  meta.url =
                    process.env.NEXT_PUBLIC_CONTENT_TILE_URL ||
                    '/content/content';
                }
              }
              if (!meta.url) {
                meta.url =
                  process.env.NEXT_PUBLIC_CONTENT_TILE_URL ||
                  '/content/content';
              }
              // Ensure icon exists: prefer API image path; else fallback to MUI icon
              if (!meta.icon) {
                meta.icon = (
                  <DescriptionOutlinedIcon
                    sx={{ fontSize: { xs: 48, sm: 64 }, color: '#582E92' }}
                  />
                );
              }
              // Ensure title and sameOrigin
              meta.title = meta.title || c.feature_name || 'Content';
              meta.sameOrigin =
                typeof meta.sameOrigin === 'boolean' ? meta.sameOrigin : true;
              return { ...c, meta };
            }
            return c;
          });

          // Configurable Content tile (enabled by default; set NEXT_PUBLIC_SHOW_CONTENT_TILE=false to disable)
          const showContentTile =
            (process.env.NEXT_PUBLIC_SHOW_CONTENT_TILE ?? 'true') !== 'false';
          if (showContentTile) {
            const contentTitle =
              process.env.NEXT_PUBLIC_CONTENT_TILE_TITLE || 'Content';
            const contentUrl =
              process.env.NEXT_PUBLIC_CONTENT_TILE_URL || '/content/content';
            const alreadyExists = cards.some(
              (c) =>
                c?.feature_code === 'content' ||
                c?.meta?.url === contentUrl ||
                c?.meta?.title === contentTitle
            );
            if (!alreadyExists) {
              cards.push({
                enabled: true,
                meta: {
                  title: contentTitle,
                  icon: (
                    <DescriptionOutlinedIcon
                      sx={{ fontSize: { xs: 48, sm: 64 }, color: '#582E92' }}
                    />
                  ),
                  url: contentUrl,
                  sameOrigin: true,
                },
              });
            }
          }

          setCardData(cards);
          localStorage.setItem(
            'theme',
            JSON.stringify(data.result[1].meta.theme)
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
    router.push(``);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleCardClick = (card) => {
    // router.push(`${card.url}`);
    buildProgramUrl(card.url, card.sameOrigin);
  };

  const buildProgramUrl = (path: string, sameOrigin: boolean): string => {
    if (sameOrigin) {
      router.push(`${path}`);
    } else {
      window.location.href = path + localStorage.getItem('accToken');
    }
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
            marginTop: { xs: '30px', sm: '90px' },
            marginBottom: { xs: '60px', sm: '90px' },
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
                cardData.map((card, index) =>
                  card.enabled == true ? (
                    <DynamicCard
                      key={index}
                      title={card.meta.title}
                      icon={card.meta.icon}
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
                      onClick={() => handleCardClick(card.meta)}
                    />
                  ) : null
                )}
            </Box>
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
                  cardData.map((card, index) =>
                    card.enabled == true ? (
                      <DynamicCard
                        key={index}
                        title={card.meta.title}
                        icon={card.meta.icon}
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
                        onClick={() => handleCardClick(card.meta)}
                      />
                    ) : null
                  )}
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
