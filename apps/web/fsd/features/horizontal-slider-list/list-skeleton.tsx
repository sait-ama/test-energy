import * as React from 'react';

import { HorizontalTitleCard } from '~entities/title/ui/horizontal-title-card';

export const ListSkeleton = () => (
  <div className="flex w-full flex-col gap-4 pl-2 md:pl-0">
    {new Array(5)
      .fill(0)
      .slice(0, 5)
      .map((item, index) => (
        <HorizontalTitleCard size="xs" key={index} isLoading model={null} />
      ))}
  </div>
);
