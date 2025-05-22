import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography } from '@mui/material';
import { Layout } from '@shared-lib';
import LogoutIcon from '@mui/icons-material/Logout';

import Grid from '@mui/material/Grid2';
import CommonCollapse from '../../components/CommonCollapse'; // Adjust the import based on your folder structure
import { hierarchyAPI } from '../../services/Hierarchy';
import { trackingData } from '../../services/TrackingService';
import {
  courseIssue,
  courseUpdate,
  getUserByToken,
} from '../../services/Certificate';

interface DetailsProps {
  details: any;
}

export default function Details({ details }: DetailsProps) {
  const router = useRouter();
  const { identifier } = router.query; // Fetch the 'id' from the URL
  const [searchValue, setSearchValue] = useState('');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const [selectedContent, setSelectedContent] = useState<any>(null);
  useEffect(() => {
    if (identifier) {
      console.log('Details:', identifier);
    }
  }, [identifier]);

  const handleAccountClick = (event: React.MouseEvent<HTMLElement>) => {
    console.log('Account clicked');
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    localStorage.removeItem('accToken');
    router.push(`${process.env.NEXT_PUBLIC_LOGIN}`);
  };

  const handleMenuClick = () => {
    console.log('Menu icon clicked');
  };

  const handleSearchClick = () => {
    console.log('Search button clicked');
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };
  export const getLeafNodes = (node: any) => {
    const result = [];

    // If the node has leafNodes, add them to the result array
    if (node?.leafNodes) {
      result.push(...node.leafNodes);
    }

    // If the node has children, iterate through them and recursively collect leaf nodes
    if (node?.children) {
      node.children.forEach((child: any) => {
        result.push(...getLeafNodes(child));
      });
    }

    return result;
  };
  const getDetails = async (identifier: string) => {
    try {
      const result = await hierarchyAPI(identifier);
      //@ts-ignore
      const trackable = result?.trackable;
      setSelectedContent(result);
      try {
        let courseList = result?.childNodes; // Extract all identifiers
        if (!courseList) {
          courseList ??= getLeafNodes(result);
        }
        const userId = localStorage.getItem('subId');
        const userIdArray = userId?.split(',');
        if (!userId) return;
        const course_track_data = await trackingData(userIdArray, courseList);
        if (course_track_data?.data) {
          //@ts-ignore
          const userTrackData =
            course_track_data.data.find(
              (course: any) => course.userId === userId
            )?.course ?? [];
          console.log('userTrackData', result);
          if (userTrackData.length > 0) {
            const updateCourseData = await courseUpdate({
              userId: localStorage.getItem('userId') ?? '',
              courseId: identifier,
            });
            const accessToken = localStorage.getItem('accToken');

            if (updateCourseData?.result?.status === 'completed') {
              if (accessToken) {
                const response = await getUserByToken(accessToken);

                const today = new Date();
                const expiration = new Date();
                expiration.setDate(today.getDate() + 8);
                const payload = {
                  issuanceDate: new Date().toISOString(),
                  expirationDate: expiration.toISOString(),
                  credentialId: '12345',
                  firstName: response?.firstName,
                  middleName: response?.middleName,
                  lastName: response?.lastName,
                  userId: updateCourseData?.result?.usercertificateId ?? '',
                  courseId: updateCourseData?.result?.courseId ?? '',
                  courseName: result?.name ?? '',
                };
                const issueData = await courseIssue(payload);
                console.log('issueCertificateData', issueData);
              }
            }
          }
          setTrackData(userTrackData);
        }
        // if (trackable?.autoBatch?.toString().toLowerCase() === 'no') {
        //   router.push(`/content-details/${identifier}`);
        // } else {
        router.push(`/details/${identifier}`);
      } catch (error) {
        console.error('Failed to fetch content:', error);
      }

      // }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    }
  };
  useEffect(() => {
    getDetails(identifier as string);
  }, [identifier]);
  const renderNestedChildren = (children: any) => {
    if (!Array.isArray(children)) {
      return null;
    }
    return children?.map((item: any) => (
      <CommonCollapse
        key={item.id}
        identifier={item.identifier as string}
        title={item.name}
        data={item?.children}
        defaultExpanded={false}
        progress={20}
        status={'Not started'}
      />
    ));
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
      // isFooter={true}
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
