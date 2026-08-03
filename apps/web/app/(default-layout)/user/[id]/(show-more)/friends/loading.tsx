// 'use client';

import { FriendCardSkeleton } from '~entities/friend/ui/friend-card-skeketon';

export default () => (
  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
    {new Array(7).fill({}).map((_, i) => (
      <FriendCardSkeleton key={i} />
    ))}
  </div>
);
