import type { ForwardedRef } from 'react';
import { forwardRef } from 'react';
import Link from 'next/link';

import { AvatarSkeletonSlot } from '@re/ui-kit/ui/avatar';
import { SkeletonSlot } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { CreatorAvatar } from '~entities/creator/ui/creator-avatar';
import type { CreatorSchemaFragment } from '~shared/api/models/creator';
import { Routing } from '~shared/config/routing';

interface HorizontalCreatorCardProps<T extends CreatorSchemaFragment> {
  model: T | null;
  isLoading?: boolean;
  className?: string;
}

export const HorizontalCreatorCard = forwardRef(
  <T extends CreatorSchemaFragment>(
    props: HorizontalCreatorCardProps<T>,
    ref: ForwardedRef<HTMLAnchorElement>
  ) => {
    const { model, isLoading, className, ...rest } = props;

    return (
      <Link
        href={Routing.Creator.detail({
          params: {
            id: model?.id,
          },
        })}
        ref={ref}
        className={cn(
          'bg-background-content group flex gap-4 overflow-hidden rounded-sm p-2',
          !isLoading && 'hover-card',
          className
        )}
        {...rest}
      >
        <AvatarSkeletonSlot
          size="lg"
          show={isLoading}
          render={() => <CreatorAvatar src={model?.cover?.mid ?? ''} alt={model?.name} size="lg" />}
        />
        <div className="flex w-full flex-col justify-center pr-2">
          <ReText size="md" lineClamp={1}>
            <SkeletonSlot show={isLoading} width="50%" render={model?.name} />
          </ReText>
          <ReText component="span" size="xs" lineClamp={2} color="muted-foreground">
            <SkeletonSlot show={isLoading} width={40} render={model?.alt_name} />
          </ReText>
        </div>
      </Link>
    );
  }
);
