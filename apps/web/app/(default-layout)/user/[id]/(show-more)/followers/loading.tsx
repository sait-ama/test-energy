'use client';
import { FollowerCard } from '~entities/user-subscriptions/ui/follower-card';
import { type FollowerSchema } from '~shared/api/models/follower';

export default function FollowersLoading() {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
      {new Array(20).fill({}).map((_, idx) => (
        <FollowerCard subType="author_users" isLoading model={{} as FollowerSchema} key={idx} />
      ))}
    </div>
  );
}
