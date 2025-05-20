import { useRouter } from 'next/router';
import React from 'react';
import { Layout, SunbirdPlayer } from '@shared-lib';
import { Box } from '@mui/material';
interface PlayerPageProps {
  id: string; // Define the type for the 'id' prop
}
const PlayerPage: React.FC<PlayerPageProps> = ({ id }) => {
  const router = useRouter();
  const { identifier } = router.query; // Access the identifier from the URL
  console.log('id', identifier);
  if (!identifier) {
    return <div>Loading...</div>;
  }
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
      <Box sx={{ marginTop: '5%' }}>
        <SunbirdPlayer identifier={id ? id : (identifier as string)} />;
      </Box>
    </Layout>
  );
};

export default PlayerPage;
