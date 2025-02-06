import React from 'react';
import dynamic from 'next/dynamic';

// eslint-disable-next-line @nx/enforce-module-boundaries
const CollectionEditor = dynamic(() => import('@collection'), {
  ssr: false,
});

export const Collection = () => {
  return <CollectionEditor />;
};

export default Collection;
