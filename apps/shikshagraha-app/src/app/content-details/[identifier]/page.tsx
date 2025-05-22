// pages/content-details/[identifier].tsx

import React from 'react';
import { Layout } from '@shared-lib-v1';
// import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Box } from '@mui/material';
import { getMetadata } from '../../../utils/API/metabaseService';

export async function generateMetadata({ params }: any) {
  return await getMetadata(params.identifier);
}
const ContentEnrollDetails = dynamic(() => import('@ContentEnrollDetails'), {
  ssr: false,
});
const App = () => {
  // const router = useRouter();

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
      <Box sx={{ marginTop: '5%' }}>
        <ContentEnrollDetails
          isShowLayout={false}
          _config={{
            default_img: '/images/image_ver.png',
            _infoCard: {
              _cardMedia: { maxHeight: '279px' },
              default_img: '/images/image_ver.png',
            },
          }}
        />
      </Box>
    </Layout>
  );
};

export default App;
