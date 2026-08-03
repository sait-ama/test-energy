import * as React from 'react';

import { LatestChapterItem } from '~entities/latest-chapter/ui/latest-chapter-item';

export const LatestChaptersListSkeleton = () => (
  <>
    {new Array(5)
      .fill(0)
      .slice(0, 5)
      .map((item, index) => (
        <LatestChapterItem key={index} isLoading model={{ type: {}, cover: {} }} />
      ))}
  </>
);
