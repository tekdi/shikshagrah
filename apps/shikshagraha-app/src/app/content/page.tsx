'use client';
import React from 'react';
// import { Layout } from '@shared-lib';
import { Layout } from '@shared-lib-v1';
import LearnerCourse from '../../Components/Content/LearnerCourse';
import { Box, Button, Grid, Typography } from '@mui/material';
import { gredientStyle } from '../../utils/style';
import LTwoCourse from '../../Components/Content/LTwoCourse';
import { useEffect, useState } from 'react';
import { getTenantInfo } from '../../utils/API/ProgramService';
import ContentComponent from '../../Components/Content/Content';
import { checkAuth } from '@shared-lib-v2/utils/AuthService';
import { CompleteProfileBanner } from '../../Components/CompleteProfileBanner/CompleteProfileBanner';
import { profileComplitionCheck } from '../../utils/API/userService';
import { usePathname } from 'next/navigation';

const MyComponent: React.FC = () => {
  const pathname = usePathname();
  const [filter, setFilter] = useState<Record<string, any> | null>(null);
  const [isLogin, setIsLogin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isShow, setIsShow] = useState(false);
  const [isProfileCard, setIsProfileCard] = useState(false);

  useEffect(() => {
    const fetchTenantInfo = async () => {
      try {
        if (checkAuth()) {
          setIsLogin(true);
          const result = await profileComplitionCheck();
          setIsProfileCard(!result);
        } else {
          setIsLogin(false);
        }
        const res = await getTenantInfo();
        console.log('res--', res?.result);
        const youthnetContentFilter = res?.name === 'Shikshagraha' ? res : null;

        const storedChannelId = localStorage.getItem('channelId');
        if (!storedChannelId) {
          const channelId = youthnetContentFilter?.channelId;
          if (channelId) {
            localStorage.setItem('channelId', channelId);
          }
        }

        const storedTenantId = localStorage.getItem('tenantId');
        if (!storedTenantId) {
          const tenantId = youthnetContentFilter?.tenantId;
          if (tenantId) {
            localStorage.setItem('tenantId', tenantId);
          }
        }

        const storedCollectionFramework = localStorage.getItem(
          'collectionFramework'
        );
        if (!storedCollectionFramework) {
          const collectionFramework =
            youthnetContentFilter?.collectionFramework;
          if (collectionFramework) {
            localStorage.setItem('collectionFramework', collectionFramework);
          }
        }
        setTimeout(() => {
          setFilter({ filters: youthnetContentFilter?.contentFilter });
          localStorage.setItem(
            'filter',
            JSON.stringify(youthnetContentFilter?.contentFilter)
          );
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch tenant info:', error);
      }
    };
    fetchTenantInfo();
  }, [pathname]);

  return (
    <Layout
      showTopAppBar={{
        title: 'Content',
        showMenuIcon: true,
        showBackIcon: false,
      }}
      isFooter={true}
      showLogo={true}
      showBack={false}
    >
      {/* {isProfileCard && <CompleteProfileBanner />}
      {isLogin && (
        <>
          <Box
            sx={{
              height: 24,
              display: 'flex',
              alignItems: 'center',
              py: '36px',
              px: '34px',
              bgcolor: '#fff',
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 500,
                fontSize: 16,
                lineHeight: '24px',
                color: '#1F1B13',
                textTransform: 'capitalize',
              }}
            >
              <span role="img" aria-label="wave">
                👋
              </span>
              Welcome, {localStorage.getItem('firstName')}!
            </Typography>
          </Box>
          <Grid
            container
            style={gredientStyle}
            {...(isShow ? {} : { sx: { display: 'none' } })}
          >
            <Grid
              item
              xs={12}
              md={3}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                px: '48px',
                py: '32px',
                gap: 3,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 400,
                    fontSize: '22px',
                    lineHeight: '28px',
                    letterSpacing: '0px',
                    verticalAlign: 'middle',
                    color: '#06A816',
                  }}
                >
                  progress title
                </Typography>
                <Typography
                  variant="body1"
                  gutterBottom
                  sx={{
                    fontSize: 16,
                  }}
                >
                  text
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Button variant="contained" color="primary" href="/in-progress">
                  Course
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={9} sx={{ pl: { xs: '48px', md: '0px' } }}>
              <ContentComponent
                getContentData={(e: any) => setIsShow(e.count)}
              />
            </Grid>
          </Grid>

          <Grid container>
            <Grid
              item
              xs={12}
              md={12}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <LTwoCourse />
            </Grid>
          </Grid>
        </>
      )} */}

      <Grid container style={gredientStyle} sx={{ marginTop: '3%' }}>
        <Grid item xs={12}>
          {filter && (
            <LearnerCourse
              // title={'LEARNER_APP.COURSE.GET_STARTED'}
              _content={{
                staticFilter: {
                  se_domains:
                    typeof filter.filters?.domain === 'string'
                      ? [filter.filters?.domain]
                      : filter.filters?.domain,
                  program:
                    typeof filter.filters?.program === 'string'
                      ? [filter.filters?.program]
                      : filter.filters?.program,
                },
              }}
            />
          )}
        </Grid>
      </Grid>
    </Layout>
  );
};

export default MyComponent;
