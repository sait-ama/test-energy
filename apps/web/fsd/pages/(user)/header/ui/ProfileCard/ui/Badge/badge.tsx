import { lazy, Suspense } from 'react';
import { useParams } from 'next/navigation';

import { useUserSuspenseQuery } from '~entities/user/model/queries';
import { useSession } from '~shared/lib/session/use-session';

import { BadgeBase } from './badge-base';

const BadgeEdit = lazy(() =>
  import(/* webpackChunkName: "BadgeEdit" */ './badge-edit').then((m) => ({ default: m.BadgeEdit }))
);

export const Badge = ({ className }: { className?: string }) => {
  const { id: userId } = useParams<{ id: string }>();
  const { data } = useUserSuspenseQuery({ variables: { params: { userId } } });
  const session = useSession();

  const isCurrentUser = session?.id === +userId;

  return isCurrentUser ? (
    <Suspense fallback={<BadgeBase loading />}>
      <BadgeEdit className={className} />
    </Suspense>
  ) : data?.tagline ? (
    <BadgeBase tagline={data.tagline} className={className} />
  ) : null;
};
