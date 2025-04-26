import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography } from '@mui/material';
import { Layout } from '@shared-lib';
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
export default function Details({ details }: DetailsProps) {
  const router = useRouter();
  const { identifier } = router.query; // Fetch the 'id' from the URL
  const [trackData, setTrackData] = useState([]);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getDetails = async (identifier: string) => {
      try {
        const result = await hierarchyAPI(identifier);
        //@ts-ignore
        setSelectedContent(result);
        try {
          let courseList = result.map((item) => item.childNodes); // Extract all identifiers
          if (!courseList || courseList.length === 0) {
            courseList ??= getLeafNodes(result);
          }

          const userId = localStorage.getItem('subId');
          const userIdArray = userId?.split(',');
          if (!userId) return; // Ensure required values exist
          //@ts-ignore
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
                    courseName: result?.map((item) => item.name) ?? [],
                  };
                  const issueData = await courseIssue(payload);
                  console.log('issueCertificateData', issueData);
                }
              }
            }
            setTrackData(userTrackData);
          }
        } catch (error) {
          console.error('Error fetching track data:', error);
        }
      } catch (error) {
        console.error('Failed to fetch content:', error);
      } finally {
        setLoading(false);
      }
    };
    if (identifier) getDetails(identifier as string);
  }, [identifier]);

  const onBackClick = () => {
    router.back();
  };
  return (
    <Layout
      isLoadingChildren={loading}
      showTopAppBar={{
        title: 'Shiksha: Course Details',
        actionButtonLabel: 'Action',
        // ...ProfileMenu(),
      }}
      isFooter={false}
      showLogo={true}
      showBack={true}
      backTitle="Course Details "
      backIconClick={onBackClick}
      sx={{ height: '0vh' }}
    >
      <Box sx={{ p: '8px' }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Typography
              variant="h6"
              sx={{ marginTop: '60px', fontWeight: 'bold' }}
            >
              {selectedContent?.name}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            {selectedContent?.children?.length > 0 && (
              <RenderNestedChildren
                data={selectedContent.children}
                trackData={trackData}
              />
            )}
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}

const RenderNestedChildren = React.memo(function RenderNestedChildren({
  data,
  trackData,
}: {
  data: any[];
  trackData: any[];
}) {
  if (!Array.isArray(data)) {
    return null;
  }
  return data?.map((item: any) => (
    <CommonCollapse key={item.identifier} item={item} TrackData={trackData} />
  ));
});
