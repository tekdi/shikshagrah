/* eslint-disable no-constant-binary-expression */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Box, Fab, Typography, Button } from '@mui/material';
import { ContentCard, CommonTabs, Layout, Circular } from '@shared-lib';
import { ContentSearch } from '../services/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import Grid from '@mui/material/Grid2';
import { useRouter, useSearchParams } from 'next/navigation';
import CircleIcon from '@mui/icons-material/Circle';
import { hierarchyAPI } from '../services/Hierarchy';
import { contentReadAPI } from '../services/Read';
import { useTheme } from '@mui/material/styles';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { trackingData } from '../services/TrackingService';
interface ContentItem {
  name: string;
  gradeLevel: string[];
  language: string[];
  artifactUrl: string;
  identifier: string;
  appIcon: string;
  contentType: string;
  mimeType: string;
  description: string;
  posterImage: string;
  children: [{}];
}

export default function Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifier = searchParams.get('identifier');
  const [searchValue, setSearchValue] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [contentData, setContentData] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [limit, setLimit] = useState(4); // Set default limit
  const [offset, setOffset] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [filterValues, setFilterValues] = useState({});
  const theme = useTheme();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [frameworkFilter, setFrameworkFilter] = useState(false);
  const [trackData, setTrackData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [issueData, setIssueData] = useState({
    subject: '',
    description: '',
    status: '',
    priority: '',
  });
  const fetchContent = useCallback(
    async (
      type?: string,
      searchValue?: string,
      filterValues?: {},
      limit?: number,
      offset?: number
    ) => {
      setIsLoading(true);
      try {
        //@ts-ignore
        let result;
        if (identifier) {
          result = await hierarchyAPI(identifier);
          //@ts-ignore
          setContentData([result]);
          // if (result) setContentData([result]);
        } else {
          result =
            type &&
            (await ContentSearch(
              type,
              searchValue,
              filterValues,
              limit,
              offset
            ));
          //@ts-ignore
          if (!result || result === undefined || result?.length === 0) {
            setHasMoreData(false); // No more data available
          } else {
            // setContentData(result || []);
            //@ts-ignore
            setContentData((prevData) => [...prevData, ...result]);
            fetchDataTrack(result);
            setHasMoreData(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch content:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [identifier]
  );
  const fetchDataTrack = async (resultData: any) => {
    if (!resultData.length) return; // Ensure contentData is available

    try {
      const courseList = resultData.map((item: any) => item.identifier); // Extract all identifiers
      const userId = localStorage.getItem('subId');
      const userIdArray = userId?.split(',');
      if (!userId || !courseList.length) return; // Ensure required values exist
      //@ts-ignore

      const course_track_data = await trackingData(userIdArray, courseList);

      if (course_track_data?.data) {
        //@ts-ignore

        const userTrackData =
          course_track_data.data.find((course: any) => course.userId === userId)
            ?.course || [];
        setTrackData(userTrackData);
      }
    } catch (error) {
      console.error('Error fetching track data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const type = 'Learning Resource';
    // setContentData([]);
    const cookies = document.cookie.split('; ');
    const subid = cookies
      .find((row) => row.startsWith('subid='))
      ?.split('=')[1];
    //@ts-ignore
    localStorage.setItem('subId', subid);
    fetchContent(type, searchValue, filterValues);
  }, [tabValue, filterValues]);

  const handleLoadMore = (event: React.MouseEvent) => {
    event.preventDefault();

    const newOffset = offset + limit;
    setOffset(newOffset);

    const currentScrollPosition = window.scrollY;

    const type = 'Learning Resource';

    fetchContent(type, searchValue, filterValues, limit, newOffset).then(() => {
      setTimeout(() => {
        window.scrollTo({ top: currentScrollPosition, behavior: 'auto' });
      }, 0);
    });
  };

  const handleAccountClick = (event: React.MouseEvent<HTMLElement>) => {
    // router.push(`${process.env.NEXT_PUBLIC_LOGINPAGE}`);
    const LOGIN = process.env.NEXT_PUBLIC_LOGINPAGE;
    //@ts-ignore
    window.location.href = LOGIN;
    localStorage.removeItem('accToken');
    localStorage.clear();
  };

  const handleSearchClick = async () => {
    if (searchValue.trim()) {
      const type = 'Learning Resource';

      console.log('searchValue', type);
      // fetchContent(type, searchValue, filterValues);
      let result =
        type &&
        (await ContentSearch(type, searchValue, filterValues, limit, offset));
      //@ts-ignore
      if (!result || result === undefined || result?.length === 0) {
        setHasMoreData(false);
      } else {
        // setContentData(result || []);
        //@ts-ignore
        setContentData(result || []);
        setHasMoreData(true);
      }
    } else {
      setSearchValue('');
      setContentData([]);
      const type = 'Learning Resource';
      fetchContent(type, searchValue, filterValues);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    const type = newValue === 0 ? 'Course' : 'Learning Resource';
    setContentData([]);
  };

  const handleCardClick = async (
    identifier: string,
    contentMimeType: string
  ) => {
    setIsLoading(true);
    try {
      if (
        [
          'application/vnd.ekstep.ecml-archive',
          'application/vnd.ekstep.html-archive',
          'application/vnd.ekstep.h5p-archive',
          'application/pdf',
          'video/mp4',
          'video/webm',
          'application/epub',
          'video/x-youtube',
          'application/vnd.sunbird.questionset',
        ].includes(contentMimeType)
      ) {
        await contentReadAPI(identifier);
        router.push(`/player/${identifier}`);
      } else {
        const result = await hierarchyAPI(identifier);
        //@ts-ignore
        const trackable = result?.trackable;
        setSelectedContent(result);

        router.push(`/content-details/${identifier}`);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setIsLoading(false);
    }
  };
  ``;
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderTabContent = () => (
    <Box
      sx={{
        flexGrow: 1,

        // height: { xs: '300px', sm: '400px', md: 'auto' }, // Adjust height for different breakpoints
        // overflowY: 'auto', // Ensures scrolling only when content overflows
        // padding: { xs: 2, sm: 3, md: 4 }, // Responsive padding
      }}
    >
      {isLoading ? (
        <Circular />
      ) : (
        <>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {contentData?.map((item) => (
              <Grid
                key={item?.identifier}
                size={{ xs: 6, sm: 6, md: 2, lg: 2 }}
              >
                <ContentCard
                  title={item?.name.trim()}
                  image={
                    item?.posterImage && item?.posterImage !== 'undefined'
                      ? item?.posterImage
                      : '/assests/images/image_ver.png'
                  }
                  content={item?.description || '-'}
                  // subheader={item?.contentType}
                  actions={item?.contentType}
                  orientation="horizontal"
                  item={[item]}
                  TrackData={trackData}
                  // type={tabValue === 0 ? 'course' : 'content'}
                  type={'content'}
                  onClick={() =>
                    handleCardClick(item?.identifier, item?.mimeType)
                  }
                />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 0 }}>
            {hasMoreData ? (
              <Button
                variant="contained"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </Button>
            ) : (
              <Typography variant="body1" color="textSecondary">
                No more data available
              </Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  );

  const tabs = [
    // {
    //   label: 'Courses',
    //   content: renderTabContent(),
    // },
    {
      label: 'Resource  ',
      content: renderTabContent(),
    },
  ];

  const handleItemClick = (to: string) => {
    router.push(to);
  };

  const drawerItems = [
    { text: 'Home', icon: <CircleIcon fontSize="small" />, to: '/' },
    { text: 'Content', icon: <CircleIcon fontSize="small" />, to: '/content' },
  ];
  const categoriesItems = [
    {
      text: 'Development',
      icon: <ChevronRightIcon />,
      to: '/',
      subCategories: [
        {
          text: 'Primary',
          to: '/education/primary',
          subCategories: [
            { text: 'Quantum Mechanics', to: '/science/physics/quantum' },
            { text: 'Relativity', to: '/science/physics/relativity' },
          ],
        },
        { text: 'Secondary', to: '/education/secondary' },
      ],
    },
    {
      text: 'Marketing',
      icon: <ChevronRightIcon />,
      to: '/page-2',
      subCategories: [
        { text: 'Primary', to: '/education/primary' },
        { text: 'Secondary', to: '/education/secondary' },
      ],
    },
    {
      text: 'Business Studies',
      icon: <ChevronRightIcon />,
      to: '/content',
      subCategories: [
        { text: 'Primary', to: '/education/primary' },
        { text: 'Secondary', to: '/education/secondary' },
      ],
    },
  ];

  //@ts-ignore
  const handleApplyFilters = async (selectedValues) => {
    // setFilterValues(selectedValues);
    setContentData([]);
    const type = tabValue === 0 ? 'Course' : 'Learning Resource';
    let result =
      type &&
      (await ContentSearch(type, searchValue, selectedValues, limit, offset));
    //@ts-ignore
    if (!result || result === undefined || result?.length === 0) {
      setHasMoreData(false); // No more data available
    } else {
      //@ts-ignore
      setContentData(result || []);
      setHasMoreData(true);
    }
    console.log('Filter selectedValues:', selectedValues);
  };

  //get filter framework
  useEffect(() => {
    fetchFramework();
  }, [router]);
  const fetchFramework = async () => {
    try {
      const url = `${
        process.env.NEXT_PUBLIC_SSUNBIRD_BASE_URL
      }/api/framework/v1/read/${localStorage.getItem('frameworkname')}`;
      const frameworkData = await fetch(url).then((res) => res.json());
      const frameworks = frameworkData?.result?.framework;
      setFrameworkFilter(frameworks);
    } catch (error) {
      console.error('Error fetching board data:', error);
    }
  };
  const handleHelpClick = () => {
    // alert('Contact Help Desk at help@shiksha.com');
    setIsDialogOpen(true);
  };
  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };
  const handleChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setIssueData({
        ...issueData,
        [field]: value,
      });
    };

  return (
    <Layout
      showTopAppBar={{
        title: 'Content',
        showMenuIcon: true,
      }}
      isFooter={true}
      showLogo={true}
      showBack={true}
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
      showFilter={true}
      // filter={filter}
      frameworkFilter={frameworkFilter}
      onItemClick={handleItemClick}
      //@ts-ignore
      onApply={handleApplyFilters}
      filterValues={filterValues}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          bgcolor: theme.palette.background.default,
          flexDirection: 'column',
          marginTop: '20px',
          paddingBottom: '80px',
          overflowX: 'hidden',
        }}
      >
        <CommonTabs
          tabs={tabs}
          value={tabValue}
          onChange={handleTabChange}
          ariaLabel="Custom icon label tabs"
        />
      </Box>

      {showBackToTop && (
        <Fab
          color="secondary"
          aria-label="back to top"
          sx={{
            position: 'fixed',
            display: 'table-column',
            bottom: 80,
            right: 16,
            height: '75px',
            borderRadius: '100px',
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
          }}
          onClick={handleBackToTop}
        >
          <ArrowUpwardIcon />
          <Typography fontSize={'10px'}>Back to Top</Typography>
        </Fab>
      )}
    </Layout>
  );
}
