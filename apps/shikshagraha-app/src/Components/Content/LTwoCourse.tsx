import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import CommonModal from './common-modal';
import LevelUp from '../LTwoContent/LevelUp';
import ResponseRecorded from '../LTwoContent/ResponseRecorded';
import {
  fetchUserCoursesWithContent,
  createL2Course,
} from '../../utils/API/contentService';
import { checkAuth } from '@shared-lib-v2/utils/AuthService';
import { showToastMessage } from '../ToastComponent/Toastify';
import { getUserDetails } from '../../utils/API/userService';

export interface TopicProp {
  topic: string;
  courses?: any[];
}
const getCustomFieldValueFromArray = (customFields: any, label: string[]) => {
  const fieldValue = label.reduce((acc, curr) => {
    const field = customFields.find((f: any) => f.label === curr);
    return { ...acc, [curr]: field?.selectedValues?.[0]?.value || '' };
  }, {});
  return JSON.parse(JSON.stringify(fieldValue));
};

const LTwoCourse: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [topics, setTopics] = useState<TopicProp[]>([]);
  const [userResponse, setUserResponse] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = React.useState<
    TopicProp | undefined
  >(undefined);

  useEffect(() => {
    const fetchTopics = async () => {
      if (checkAuth()) {
        const userId = localStorage.getItem('userId');
        const tenantId = localStorage.getItem('tenantId');
        if (userId && tenantId) {
          try {
            const { result } = await getUserDetails(userId, true);
            const customFieldsJson = getCustomFieldValueFromArray(
              result?.userData?.customFields,
              [
                'MOTHER_NAME',
                'STATE',
                'DISTRICT',
                'BLOCK',
                'VILLAGE',
                'HIGHEST_EDCATIONAL_QUALIFICATION_OR_LAST_PASSED_GRADE',
              ]
            );
            setUserResponse({
              ...(result.userData || {}),
              ...customFieldsJson,
            });
            const courses = await fetchUserCoursesWithContent(userId, tenantId);
            setTopics(courses);
          } catch (error) {
            console.error('Error fetching user courses:', error);
            showToastMessage(`Error fetching user courses: ${error}`, 'error');
          }
        }
      }
    };
    fetchTopics();
  }, []);

  // Return null if there are no topics
  if (topics.length === 0) {
    return null;
  }

  const handleInterestClick = () => {
    setIsModalOpen(true);

    // if (userResponse) {
    //   const { email, dob } = userResponse;
    //   // @ts-ignore
    //   const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //   const dobPattern = /^\d{4}-\d{2}-\d{2}$/;

    //   if (!emailPattern.test(email) || !dobPattern.test(dob)) {
    //     showToastMessage(
    //       'Complete your profile with a valid email and DOB in YYYY-MM-DD format',
    //       'error'
    //     );
    //   } else {
    //     setIsModalOpen(true);
    //   }
    // } else {
    //   showToastMessage(
    //     'Complete your profile with a valid email and DOB in YYYY-MM-DD format',
    //     'error'
    //   );
    // }
  };

  const handleSubmit = async () => {
    try {
      // Get user data
      const userData = {
        first_name: userResponse?.firstName ?? '',
        middle_name: userResponse?.middleName ?? '',
        last_name: userResponse?.lastName ?? '',
        mother_name: userResponse?.MOTHER_NAME ?? '',
        gender: userResponse?.gender ?? '',
        email_address: userResponse?.email ?? '',
        dob: userResponse?.dob ?? '',
        enrollmentId: userResponse?.enrollmentId ?? '',
        qualification:
          userResponse?.HIGHEST_EDCATIONAL_QUALIFICATION_OR_LAST_PASSED_GRADE ??
          '',
        phone_number: userResponse?.mobile?.toString() ?? '',
        state: userResponse?.STATE ?? '',
        district: userResponse?.DISTRICT ?? '',
        block: userResponse?.BLOCK ?? '',
        village: userResponse?.VILLAGE ?? '',
        blood_group: '',
        userId: userResponse?.userId ?? '',
        courseId: selectedTopic?.courses?.[0]?.courseId ?? '',
        courseName: selectedTopic?.courses?.[0]?.name ?? '',
        topicName: selectedTopic?.topic ?? '',
      };

      // Call createL2Course API
      await createL2Course(userData);

      setCount(1);
      if (count == 1) {
        setIsModalOpen(false);
        setCount(0);
      }
    } catch (error: any) {
      const response = error?.response;
      console.error(
        'Error in handleSubmit:',
        response?.data?.message?.join('') ?? error
      );
      showToastMessage(
        `Error in handleSubmit: ${response?.data?.message?.join('') ?? error}`,
        'error'
      );
      // Handle error appropriately
    }
  };

  const handleCloseResponse = () => {
    setIsModalOpen(false);
    setCount(0);
  };

  const handleTopicChange = (event: TopicProp) => {
    setSelectedTopic(event);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setCount(0);
  };

  return (
    <Box sx={{ py: '56px', px: '48px', bgcolor: 'white' }}>
      <Typography variant="h1" gutterBottom sx={{ color: '#78590C' }}>
        {/* {t('LEARNER_APP.L_TWO_COURSE.TITLE')} */}
        Title
      </Typography>
      <Box
        sx={{
          width: '100%',
          mb: 2,
          background: '#F3EDF7',
          padding: '24px 56px 24px 56px',
          borderRadius: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          '@media (max-width: 600px)': {
            flexDirection: 'column',
            alignItems: 'center',
          },
        }}
      >
        <Box
          sx={{ width: '38%', '@media (max-width: 600px)': { width: '100%' } }}
        >
          <Typography variant="h1" sx={{ color: '#1F1B13' }} gutterBottom>
            {/* {t('LEARNER_APP.L_TWO_COURSE.DESCRIPTION')} */}
            Two course
          </Typography>
          <Typography variant="body1" color="#635E57" gutterBottom>
            {/* {t('LEARNER_APP.L_TWO_COURSE.SUB_DESCRIPTION')} */}
            sub desc
          </Typography>
        </Box>
        <Box>
          <Button
            sx={{ padding: '10px 55px', fontSize: '16px', fontWeight: '500' }}
            variant="contained"
            color="primary"
            onClick={handleInterestClick}
          >
            {/* {t('LEARNER_APP.L_TWO_COURSE.INTEREST_BUTTON')} */}
            Course intreset
          </Button>
        </Box>
        {count == 0 ? (
          <CommonModal
            handleSubmit={handleSubmit}
            isOpen={isModalOpen}
            onClose={handleClose}
            submitText="SUBMIT"
          >
            <LevelUp
              handleTopicChange={handleTopicChange}
              selectedTopic={selectedTopic?.topic ?? ''}
              topics={topics}
            />
          </CommonModal>
        ) : (
          <CommonModal
            handleSubmit={handleCloseResponse}
            isOpen={isModalOpen}
            onClose={handleClose}
            submitText="OKAY"
          >
            <ResponseRecorded />
          </CommonModal>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(LTwoCourse);
