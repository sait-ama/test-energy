'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import ArrowLeft from '@re/ui-kit/icons/arrow-left';
import Lock from '@re/ui-kit/icons/lock';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { useUserSuspenseQuery } from '~entities/user/model/queries';
import { Routing } from '~shared/config/routing';
import { useSession } from '~shared/lib/session/use-session';

export const AccountLockedView = () => {
  const t = useTranslations();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3">
      <div className="flex flex-col items-center space-y-4 p-6">
        <Lock className="size-12" />
        <div className="space-y-2">
          <ReText size="xl" weight="semibold" align="center">
            {t('user.private-profile.heading')}
          </ReText>
          <ReText color="muted-foreground" align="center">
            {t('user.private-profile.caption')}
          </ReText>
        </div>
      </div>
      <Link prefetch={false} href={Routing.Home.main({})}>
        <Button startIcon={<ArrowLeft className="h-4 w-4" />} variant="flat">
          {t('reusable.routing.go_back')}
        </Button>
      </Link>
    </div>
  );
};

export const PrivateProfileCheck = ({ children }: { children: ReactNode }) => {
  const session = useSession();
  const params = useParams<{ id: string }>();
  const { data } = useUserSuspenseQuery({ variables: { params: { userId: params.id } } });

  const isCurrentUser = session?.id === Number(params.id);
  const isPrivateUser = data?.is_private;
  const isStaff = session?.is_staff;

  if (isPrivateUser && !isCurrentUser && !isStaff && data.friend_status !== 'friends')
    return <AccountLockedView />;

  return children;
};
