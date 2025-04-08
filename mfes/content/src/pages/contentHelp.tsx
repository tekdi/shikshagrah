'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Menu,
  MenuItem,
  Fab,
  Typography,
  Button,
  TextField,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  CommonCard,
  CommonTabs,
  Layout,
  Circular,
  CommonDialog,
  CommonTextField,
} from '@shared-lib';
import { ContentSearch } from '../services/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import Grid from '@mui/material/Grid2';
import { useRouter, useSearchParams } from 'next/navigation';
import MailIcon from '@mui/icons-material/Mail';
import { hierarchyAPI } from '../services/Hierarchy';
import { contentReadAPI } from '../services/Read';
import HelpIcon from '@mui/icons-material/Help';
import { useTheme } from '@mui/material/styles';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

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
}

export default function ContentHelp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifier = searchParams.get('identifier');
  const [searchValue, setSearchValue] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [contentData, setContentData] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [limit, setLimit] = useState(5); // Set default limit
  const [offset, setOffset] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [filterValues, setFilterValues] = useState({});
  const theme = useTheme();
  const [showBackToTop, setShowBackToTop] = useState(false);

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

            setContentData((prevData) => [...prevData, ...result]);
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

  useEffect(() => {
    const type = tabValue === 0 ? 'Course' : 'Learning Resource';
    // setContentData([]);
    fetchContent(type, searchValue, filterValues);
  }, [tabValue, filterValues]);

  const handleLoadMore = (event: React.MouseEvent) => {
    event.preventDefault();

    const newOffset = offset + limit;
    setOffset(newOffset);

    const currentScrollPosition = window.scrollY;

    const type = tabValue === 0 ? 'Course' : 'Learning Resource';

    fetchContent(type, searchValue, filterValues, limit, newOffset).then(() => {
      setTimeout(() => {
        window.scrollTo({ top: currentScrollPosition, behavior: 'auto' });
      }, 0);
    });
  };

  const handleAccountClick = (event: React.MouseEvent<HTMLElement>) => {
    console.log('Account clicked');
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    localStorage.removeItem('accToken');
    localStorage.removeItem('refToken');
    let LOGIN = process.env.NEXT_PUBLIC_LOGIN;
    //@ts-ignore
    window.location.href = LOGIN;
  };

  const handleSearchClick = () => {
    if (searchValue.trim()) {
      const type = tabValue === 0 ? 'Course' : 'Learning Resource';
      fetchContent(type, searchValue, filterValues);
    } else {
      const type = tabValue === 0 ? 'Course' : 'Learning Resource';
      fetchContent(type);
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
    <Box sx={{ flexGrow: 1 }}>
      {isLoading ? (
        <Circular />
      ) : (
        <>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {contentData?.map((item) => (
              <Grid
                key={item?.identifier}
                size={{ xs: 6, sm: 6, md: 3, lg: 3 }}
              >
                <CommonCard
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
                  status={'Not started'}
                  progress={0}
                  onClick={() =>
                    handleCardClick(item?.identifier, item?.mimeType)
                  }
                />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
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
    {
      label: 'Courses',
      content: renderTabContent(),
    },
    {
      label: 'Content',
      content: renderTabContent(),
    },
  ];

  const handleItemClick = (to: string) => {
    router.push(to);
  };

  const drawerItems = [
    { text: 'Home', icon: <MailIcon />, to: '/' },
    { text: 'Page2', icon: <MailIcon />, to: '/page-2' },
    { text: 'Content', icon: <MailIcon />, to: '/content' },
  ];

  //   sort: true,
  //   language: [
  //     'Mathematics',
  //     'Science',
  //     'Environmental Sciences',
  //     'English',
  //     'Hindi',
  //   ],
  //   subject: [
  //     'Mathematics',
  //     'Science',
  //     'Environmental Sciences',
  //     'English',
  //     'Hindi',
  //   ],
  //   contentType: ['Video', 'PDF', 'E-Book', 'Quiz'],
  // };
  // Initialize as an empty object
  // useEffect(() => {
  //   const type = tabValue === 0 ? 'Course' : 'Learning Resource';
  //   fetchContent(type, searchValue, filterValues);
  // }, [filterValues]);
  //@ts-ignore
  const handleApplyFilters = (selectedValues) => {
    setFilterValues(selectedValues);
    console.log('Filter selectedValues:', selectedValues);
  };

  //get filter framework
  const [frameworkFilter, setFrameworkFilter] = useState(false);
  useEffect(() => {
    fetchFramework();
  }, [router]);
  const fetchFramework = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_SSUNBIRD_BASE_URL}/api/framework/v1/read/${process.env.NEXT_PUBLIC_FRAMEWORK}`;
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
  const handleOtpSubmit = async () => {
    console.log(issueData);
    const queryString = new URLSearchParams(issueData).toString();
    const frappeDeskUrl = `http://localhost:8000/helpdesk/tickets/new?${queryString}`;
    router.push(frappeDeskUrl);
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
        title: 'Shiksha: Home',
        showMenuIcon: true,
        actionButtonLabel: 'Action',
        actionIcons: [
          {
            icon: <LogoutIcon />,
            ariaLabel: 'Account',
            onLogoutClick: (e: any) => handleAccountClick(e),
            anchorEl: anchorEl,
          },
        ],
        onMenuClose: handleClose,
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
      drawerItems={drawerItems}
      showFilter={true}
      // filter={filter}
      frameworkFilter={frameworkFilter}
      onItemClick={handleItemClick}
      isFooter={false}
      showLogo={true}
      showBack={true}
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
        }}
      >
        <CommonTabs
          tabs={tabs}
          value={tabValue}
          onChange={handleTabChange}
          ariaLabel="Custom icon label tabs"
        />
      </Box>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {/* <MenuItem onClick={handleClose}>Logout</MenuItem> */}
      </Menu>
      <Fab
        color="primary"
        aria-label="help"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          '&:hover': {
            bgcolor: theme.palette.primary.dark,
          },
        }}
        onClick={handleHelpClick}
      >
        <HelpIcon />
      </Fab>
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

      <CommonDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        header="Help desk"
        content={
          <Grid container spacing={2}>
            <Typography>We’ve sent an your issue to help desk</Typography>
            <Grid
              size={{ xs: 12, sm: 6, md: 12, lg: 12 }}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                borderRadius: '20px 20px 0 0',
                padding: '15px',
                backgroundColor: '#FFFFFF',
              }}
            >
              <CommonTextField
                label="Subject"
                value={issueData.subject}
                type="text"
                variant="outlined"
                onChange={handleChange('subject')}
              />
              <CommonTextField
                label="Description"
                type="text"
                variant="outlined"
                multiline
                rows={4}
                value={issueData.description}
                onChange={handleChange('description')}
              />
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Status</InputLabel>
                <Select
                  fullWidth
                  value={issueData.status}
                  onChange={handleChange('status')}
                >
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Priority</InputLabel>

                <Select
                  fullWidth
                  value={issueData.priority}
                  onChange={handleChange('priority')}
                  sx={{ mt: 2 }}
                >
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        }
        actions={
          <Button
            onClick={handleOtpSubmit}
            sx={{
              color: '#FFFFFF',
              width: '20%',
              height: '40px',
              bgcolor: '#024F9D',
              borderRadius: '50px',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Submit
          </Button>
        }
      />
    </Layout>
  );
}
