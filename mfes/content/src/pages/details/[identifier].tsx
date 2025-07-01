import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, IconButton } from '@mui/material';
import { Layout } from '@shared-lib';
import Grid from '@mui/material/Grid2';
import CommonCollapse from '../../components/CommonCollapse'; // Adjust the import if needed
import { hierarchyAPI } from '../../services/Hierarchy';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface DetailsProps {
  details: any;
}

export default function Details({ details }: DetailsProps) {
  const router = useRouter();
  const { identifier } = router.query;
  const [selectedContent, setSelectedContent] = useState<any>(null);

  useEffect(() => {
    if (identifier) {
      getDetails(identifier as string);
    }
  }, [identifier]);

  const getDetails = async (identifier: string) => {
    try {
      const result = await hierarchyAPI(identifier);
      setSelectedContent(result);
      router.push(`/details/${identifier}`);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    }
  };

  const renderNestedChildren = (children: any) => {
    if (!Array.isArray(children)) return null;

    return children.map((item: any) => {
      const artifactUrl = item.artifactUrl || item.children?.artifactUrl;

      // const copyAction = {
      //   label: 'Copy URL',
      //   onClick: (e: React.MouseEvent) => {
      //     e.stopPropagation(); // Prevent accordion toggle
      //     if (artifactUrl) {
      //       navigator.clipboard
      //         .writeText(artifactUrl)
      //         .then(() => alert('Copied artifact URL to clipboard!'))
      //         .catch(() => alert('Failed to copy artifact URL.'));
      //     } else {
      //       alert('No artifact URL available to copy.');
      //     }
      //   },
      //   icon: <ContentCopyIcon fontSize="small" />,
      // };

      return (
        <CommonCollapse
          key={item.id}
          identifier={item.identifier as string}
          title={item.name}
          data={item.children}
          defaultExpanded={false}
          progress={20}
          status={'Not started'}
         
        />
      );
    });
  };

  const onBackClick = () => {
    router.back();
  };

  return (
    <Layout
      showTopAppBar={{
        title: 'Content',
        showMenuIcon: false,
        showBackIcon: true,
        backIconClick: onBackClick,
      }}
      showLogo={true}
      showBack={true}
    >
      <Box sx={{ width: '100%', marginTop: '70px' }}>
        <Grid container spacing={2}>
          <Grid fontSize={{ xs: 12 }}>
            <Typography
              variant="h6"
              sx={{ marginTop: '60px', fontWeight: 'bold' }}
            >
              {/* {selectedContent?.name} */}
            </Typography>
          </Grid>
        </Grid>

        {selectedContent?.children?.length > 0 &&
          renderNestedChildren(selectedContent.children)}
      </Box>
    </Layout>
  );
}
