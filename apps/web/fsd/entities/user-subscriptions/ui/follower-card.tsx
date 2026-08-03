import type { ForwardedRef } from 'react';
import { forwardRef } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import type { HorizontalUserCardProps } from '~entities/user/ui/horizontal-user-card';
import { VerticalUserCardV2 } from '~entities/user/ui/vertical-user-card';
import type { FollowerSchema } from '~shared/api/models/follower';
import type { SubContentType } from '~shared/api/models/user-subscriptions';

const SubContentTypeLabel = {
  author_users: 'На посты',
  author_publishers: 'На посты',
  titles_publishers: 'На тайтлы',
} satisfies Record<SubContentType, string>;

interface FollowerCardProps<T extends FollowerSchema> extends HorizontalUserCardProps<T> {
  subType: SubContentType;
  className?: string;
}

export const FollowerCard = forwardRef(
  <T extends FollowerSchema>(props: FollowerCardProps<T>, ref: ForwardedRef<HTMLAnchorElement>) => {
    const { model, subType, className, isLoading, ...rest } = props;

    return (
      <VerticalUserCardV2
        isLoading={isLoading}
        className={cn('h-full w-full !border-none', className)}
        ref={ref}
        {...rest}
        model={model}
        subtitle={SubContentTypeLabel[subType]}
      />
    );
  }
);
