import type { ForwardedRef, ReactNode } from 'react';
import React, { forwardRef } from 'react';
import type { LinkProps } from 'next/link';
import Link from 'next/link';

import { SkeletonSlot } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import type { CharacterSchemaFragment } from '~shared/api/models/character';
import { Routing } from '~shared/config/routing';

import { CharacterAvatar } from './character-avatar';

interface HorizontalCharacterCardProps<T extends CharacterSchemaFragment>
  extends Omit<LinkProps, 'href'> {
  model: T | null;
  isLoading?: boolean;
  className?: string;
  actions?: ReactNode;
}

export const HorizontalCharacterCard = forwardRef(
  <T extends CharacterSchemaFragment>(
    props: HorizontalCharacterCardProps<T>,
    ref: ForwardedRef<HTMLAnchorElement>
  ) => {
    const { model, className, isLoading, actions, ...rest } = props;

    return (
      <Link
        href={!model ? '' : Routing.Character.main({ params: { id: model.id } })}
        className={cn(
          'bg-background-content group border-border flex items-center gap-2 overflow-hidden rounded-md border p-2',
          isLoading && 'hover-card',
          className
        )}
        ref={ref}
        {...rest}
      >
        <SkeletonSlot
          show={isLoading}
          width={64}
          height={64}
          render={() => <CharacterAvatar size={64} src={model?.cover?.mid} alt={model?.name} />}
        />
        <div className="flex p-2"></div>
        <div className="flex w-full flex-col gap-1 pr-2">
          <ReText size="md" lineClamp={1}>
            <SkeletonSlot show={isLoading} width="70%" render={model?.name} />
          </ReText>
          <ReText size="xs" color="muted-foreground" className="whitespace-nowrap">
            <SkeletonSlot show={isLoading} width="50%" render={model?.alt_name} />
          </ReText>
        </div>
        {actions}
      </Link>
    );
  }
);
