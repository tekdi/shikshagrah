import { useRouter } from 'next/router';
import React from 'react';
import { SunbirdPlayer } from '@shared-lib';
interface PlayerPageProps {
  id: string; // Define the type for the 'id' prop
}
const PlayerPage: React.FC<PlayerPageProps> = ({ id }) => {
  const router = useRouter();
  const { identifier } = router.query; // Access the identifier from the URL
  if (!id) {
    return <div>Loading...</div>;
  }

  return <SunbirdPlayer identifier={id as string} />;
};

export default PlayerPage;
