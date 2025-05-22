'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { courseWiseLernerList } from '../../utils/API/contentService';

const Content = dynamic(() => import('@Content'), {
  ssr: false,
});

const ContentComponent = ({
  limit = 4,
  hasMoreData = false,
  getContentData,
}: any) => {
  const [identifier, setIdentifier] = useState([]);

  useEffect(() => {
    const fetchDOIds = async () => {
      try {
        const userId = localStorage.getItem('userId');
        let courseIds: never[] = [];
        if (userId) {
          const res = await courseWiseLernerList({
            filters: { userId: [userId], status: ['inprogress'] },
          });
          const courseIdList = res?.data;
          courseIds = courseIdList.map((course: any) => course.courseId);
          setIdentifier(courseIds);
        }
        if (courseIds.length <= 0) {
          getContentData(courseIds.length);
        }
      } catch (error) {
        console.error('Failed to fetch tenant info:', error);
      }
    };

    fetchDOIds();
  }, []);

  if (identifier.length <= 0) {
    return null;
  }

  return (
    <Content
      isShowLayout={false}
      contentTabs={['Course']}
      showFilter={false}
      showSearch={false}
      showHelpDesk={false}
      filters={{
        limit: limit,
        filters: {
          identifier: identifier,
        },
      }}
      hasMoreData={hasMoreData}
      _config={{
        _box: { sx: { pt: 4 } },
        default_img: '/images/image_ver.png',
        _card: { isHideProgress: true },
        default_img_alt: 'No image available',
        getContentData: getContentData,
      }}
    />
  );
};

export default ContentComponent;
