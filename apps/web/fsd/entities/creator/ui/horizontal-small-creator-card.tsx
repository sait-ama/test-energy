import { ComponentProps, memo } from 'react';
import Link from 'next/link';

import { AvatarSkeletonSlot } from '@re/ui-kit/ui/avatar';
import { SkeletonSlot } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { CreatorAvatar } from '~entities/creator/ui/creator-avatar';
import type { CreatorSchemaFragment } from '~shared/api/models/creator';
import { Routing } from '~shared/config/routing';

interface HorizontalCreatorCardProps<T extends CreatorSchemaFragment> extends ComponentProps<'a'> {
  model: T;
  isLoading?: boolean;
  className?: string;
}

export const HorizontalSmallCreatorCard = memo(
  <T extends CreatorSchemaFragment>(props: HorizontalCreatorCardProps<T>) => {
    const { model, isLoading, ref, className, ...rest } = props;

    return (
      <Link
        prefetch={false}
        href={Routing.Creator.detail({
          params: {
            id: model?.id,
          },
        })}
        ref={ref}
        className={cn(
          'hover-card group flex items-center gap-3 overflow-hidden rounded-md px-2 py-1',
          className
        )}
        {...rest}
      >
        <AvatarSkeletonSlot
          size={24}
          show={isLoading}
          render={() => (
            <CreatorAvatar
              shape="circle"
              src={model?.cover?.mid ?? ''}
              alt={model?.name}
              size={24}
            />
          )}
        />
        <ReText size="sm" lineClamp={1} component="span" className="!leading-none">
          <SkeletonSlot show={isLoading} width="50%" render={model.name} />
        </ReText>
      </Link>
    );
  }
);
