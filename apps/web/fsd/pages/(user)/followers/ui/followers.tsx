import type { ComponentPropsWithoutRef, PropsWithChildren } from 'react';

import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { BackButton } from '~entities/user/ui/back-button';
import { FollowersOrdering } from '~entities/user-subscriptions/ui/ordering';
import { FollowersList } from '~pages/(user)/followers/ui/followers-list';
import { Underline } from '~shared/ui/underline';

const Container = ({
  children,
  className,
  ...other
}: PropsWithChildren<ComponentPropsWithoutRef<'div'>>) => (
  <div className={cn('flex w-full flex-col gap-6', className)} {...other}>
    {children}
  </div>
);

const FollowersHeader = ({ className, ...other }: ComponentPropsWithoutRef<'div'>) => (
  <div className={cn('flex flex-col', className)} {...other}>
    <Underline>
      <ReText size="2xl" component="h2">
        Подписчики
      </ReText>
    </Underline>
  </div>
);

export const Followers = Object.assign(Container, {
  List: FollowersList,
  Header: FollowersHeader,
  HeaderOver: BackButton,
  Ordering: FollowersOrdering,
});
