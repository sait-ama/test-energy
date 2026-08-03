import { memo } from 'react';

import { Skeleton } from '@re/ui-kit/ui/skeleton';

import { FlatListLayout } from '~shared/ui/flat-list-v2';

export default memo(() => (
  <FlatListLayout
    className="xs:grid-cols-1 grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1"
    layout="list"
  >
    {new Array(6).fill(null).map((_, mkey) => (
      <Skeleton key={mkey} className="aspect-[1/5] h-[189px] w-full md:aspect-[6/1]" />
    ))}
  </FlatListLayout>
));
