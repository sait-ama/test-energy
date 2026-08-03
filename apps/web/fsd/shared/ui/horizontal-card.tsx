'use client';
import type { ForwardedRef, ReactNode } from 'react';
import { forwardRef } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@re/ui-kit/ui/avatar';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { UrlFormatter } from '~shared/utils/url-formatter';

export interface HorizontalCardProps {
  image: string;
  imageWidth?: number;
  imageHeight?: number;
  isLoading?: boolean;
  className?: string;
  actions?: ReactNode;
  name: string;
  subtitle?: string;
  [key: `data-${string}`]: NumberIsomorphic | boolean;
}

export const HorizontalCard = forwardRef(
  (props: HorizontalCardProps, ref: ForwardedRef<HTMLDivElement>) => {
    const {
      actions,
      className,
      imageWidth = 80,
      imageHeight = 80,
      isLoading,
      name,
      subtitle,
      image,
      ...rest
    } = props;

    const Comp = 'div';

    return (
      <Comp
        ref={ref}
        className={cn(
          'cs-horizontal-title-card border-border bg-background-content flex w-full flex-col items-center justify-between gap-4 overflow-hidden !rounded-md border p-4 md:flex-row',
          !isLoading && 'dark:hover:border-primary dark:hover:bg-accent/20 transition-colors',
          className
        )}
        {...rest}
      >
        <div className="flex w-full items-center gap-4">
          <Avatar
            src={UrlFormatter.media(image || '')}
            className="aspect-square overflow-hidden rounded-sm select-none"
            style={{ width: imageWidth, height: imageHeight }}
          >
            <AvatarImage alt={name || ''} width={40} height={40} className="rounded-sm" />
            <AvatarFallback>{name}</AvatarFallback>
          </Avatar>

          <div className="mb-2">
            <ReText lineClamp={2} align="start" size="md" className="mt-2">
              {name}
            </ReText>
            {subtitle ? (
              <ReText
                lineClamp={1}
                align="start"
                size="sm"
                color="muted-foreground"
                className="mb-auto"
              >
                {subtitle}
              </ReText>
            ) : null}
          </div>
        </div>
        {actions}
      </Comp>
    );
  }
);
