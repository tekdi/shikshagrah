// 'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { getMetadata } from '../../../../../utils/API/metabaseService';
import { Layout } from '@shared-lib-v1';

export async function generateMetadata({ params }: any) {
  return await getMetadata(params.identifier);
}

const ContentDetails = dynamic(
  () => import('../../../../../Components/Content/Player'),
  {
    ssr: false,
  }
);

const HomePage: React.FC = () => {
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
      <ContentDetails />
    </Layout>
  );
};

export default HomePage;
