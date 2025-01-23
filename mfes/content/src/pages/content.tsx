'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Box } from '@mui/material';
import { CommonCard, CommonTabs, Layout, IMAGES, Circular } from '@shared-lib';
import { ContentSearch } from '../services/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import Grid from '@mui/material/Grid2';
import { useRouter, useSearchParams } from 'next/navigation';
import MailIcon from '@mui/icons-material/Mail';
import { hierarchyAPI } from '../services/Hierarchy';
import { contentReadAPI } from '../services/Read';
import Details from './details';

interface ContentItem {
  name: string;
  gradeLevel: string[];
  language: string[];
  artifactUrl: string;
  identifier: string;
  appIcon: string;
  contentType: string;
  mimeType: string;
}

export default function Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifier = searchParams.get('identifier');
  const [searchValue, setSearchValue] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [contentData, setContentData] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
      let result;
      if (identifier) {
        result = await hierarchyAPI(identifier);
        if (result) setContentData([result]);
      } else {
        result = await fetch(
          `/api/contentSearch?identifier=${searchValue}`
        ).then((res) => res.json());
        setContentData(result || []);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setIsLoading(false);
    }
  }, [identifier]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleAccountClick = () => {
    console.log('Account clicked');
  };

  const handleSearchClick = () => {
    if (searchValue.trim()) {
      fetchContent();
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
          'application/vnd.sunbird.questionset',
        ].includes(contentMimeType)
      ) {
        await contentReadAPI(identifier);
        router.push(`/content-details/${identifier}`);
      } else {
        const result = await hierarchyAPI(identifier);
        setSelectedContent(result);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => (
    <Box sx={{ flexGrow: 1 }}>
      {isLoading ? (
        <Circular />
      ) : (
        <Grid container spacing={2}>
          {contentData.map((item) => (
            <Grid key={item?.identifier} size={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
              <CommonCard
                title={item?.name.trim()}
                content={`Grade: ${
                  item?.gradeLevel?.join(', ') || 'N/A'
                }, Language: ${item.language.join(', ') || 'N/A'}`}
                image={item?.appIcon || IMAGES.DEFAULT_PLACEHOLDER}
                subheader={item?.contentType}
                orientation="horizontal"
                onClick={() =>
                  handleCardClick(item?.identifier, item?.mimeType)
                }
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const tabs = [
    {
      label: 'Content',
      content: renderTabContent(),
    },
    {
      label: 'Tab',
      content: <Box>No content</Box>,
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

  if (showDetails && selectedContent) {
    return <Details details={selectedContent} />;
  }

  return (
    <Layout
      showTopAppBar={{
        title: 'Content Library',
        showMenuIcon: true,
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
      drawerItems={drawerItems}
      onItemClick={handleItemClick}
      isFooter={false}
      showLogo={true}
      showBack={true}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          bgcolor: '#FEF7FF',
          flexDirection: 'column',
        }}
      >
        <CommonTabs
          tabs={tabs}
          value={tabValue}
          onChange={handleTabChange}
          ariaLabel="Custom icon label tabs"
        />
      </Box>
    </Layout>
  );
}
