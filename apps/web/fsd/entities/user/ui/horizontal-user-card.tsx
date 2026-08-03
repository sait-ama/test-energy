import type { ForwardedRef, ReactNode } from 'react';
import React, { forwardRef } from 'react';
import type { LinkProps } from 'next/link';
import Link from 'next/link';

import { SkeletonSlot } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { UserAvatar } from '~entities/user/ui/user-avatar';
import type { UserSchemaFragment } from '~shared/api/models/user';
import { Routing } from '~shared/config/routing';

export interface HorizontalUserCardProps<T extends UserSchemaFragment>
  extends Omit<LinkProps, 'href'> {
  model: T | null;
  isLoading?: boolean;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
  subtitleAsChild?: boolean;
}

export const HorizontalUserCard = forwardRef(
  <T extends UserSchemaFragment>(
    props: HorizontalUserCardProps<T>,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const { model, isLoading, subtitleAsChild, subtitle, actions, className, ...rest } = props;
    const Comp = isLoading ? 'div' : Link;

    const propsLink = isLoading
      ? undefined
      : {
          href: Routing.User.detail({ params: { id: model!.id, tab: 'about' } }), // link :(
        };

    const commonProps = {
      ref,
      className: cn(
        'group flex items-center gap-4 overflow-hidden rounded-md p-2',
        !isLoading && 'hover-card',
        className
      ),
      ...rest,
    };

    return (
      // @ts-ignore
      <Comp {...propsLink}>
        {/*// @ts-ignore*/}
        <div {...commonProps}>
          <SkeletonSlot
            circle
            className="size-16 rounded-full"
            render={
              <UserAvatar
                size="lg"
                withFrameMargin
                frameSrc={model?.frame?.high}
                avatarSrc={model?.avatar?.mid}
                alt="alt"
              />
            }
            show={isLoading}
          />
          <div className="flex w-full flex-col gap-1">
            <div
              className={cn({
                'flex items-center justify-between gap-2 overflow-ellipsis': actions,
              })}
            >
              <ReText size="md" lineClamp={1} className="break-all" weight="semibold">
                <SkeletonSlot
                  className="h-[17px] w-[60px]"
                  show={isLoading}
                  render={model?.username}
                />
              </ReText>
              {actions}
            </div>

            {subtitle ? (
              <ReText
                asChild={subtitleAsChild}
                size="xs"
                color="muted-foreground"
                className="items-center gap-2 whitespace-nowrap"
              >
                <SkeletonSlot className="h-[13px] w-[90px]" show={isLoading} render={subtitle} />
              </ReText>
            ) : null}
          </div>
        </div>
      </Comp>
    );
  }
);
