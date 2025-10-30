import React, { Suspense } from 'react';
import HomeItemsInterface from '@/components/home-items/HomeItemsInterface';

const HomeItemsPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <HomeItemsInterface />
      </Suspense>
    </div>
  );
};

export default HomeItemsPage;