import { Suspense } from 'react';

import { TopContent, TopContentSkeleton } from './ui';

export const TopCategoryPage = () => {
  return (
    <Suspense fallback={<TopContentSkeleton />}>
      <TopContent />
    </Suspense>
  );
};
