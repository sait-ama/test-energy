import * as React from 'react';
import { memo, ReactNode } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { useScrollOffsetTrigger } from '~shared/hooks/use-scroll-offset-trigger';
import { Container } from '~shared/ui/container';

export interface HeaderContainerProps {
  children?: ReactNode;
  transparent?: boolean;
  className?: string;
  style?: React.CSSProperties;
  containerClassName?: string;
  disableScrollEffect?: boolean;
}

export const HeaderContainer = memo((props: HeaderContainerProps) => {
  const { style, containerClassName, children, transparent, className, disableScrollEffect } =
    props;

  const hasScrolled = useScrollOffsetTrigger(10, disableScrollEffect);

  return (
    <div
      className={cn(
        'no-wrap flex min-h-[var(--bottom-bar-height)] w-full items-center',
        {
          'bg-background': !transparent,
          // shadow-[0px_4px_24px_0px_rgba(0,0,0,0.08)]
          'dark:border-border/30 dark:border-b dark:shadow-none': hasScrolled,
          'border-border/50 border-b': !hasScrolled,
        }, //backdrop-blur supports-[backdrop-filter]:bg-background/80

        containerClassName
      )}
      style={style}
    >
      <Container slim className={cn('flex md:pl-2', className)}>
        {children}
      </Container>
    </div>
  );
});

export const HeaderBase = (
  props: HeaderContainerProps & {
    subheader: ReactNode;
    headerLeft?: ReactNode;
    headerRight?: ReactNode;
    headerCenter?: ReactNode;
  }
) => {
  const { headerLeft, headerCenter, headerRight, subheader, className, transparent, style } = props;

  return (
    <header
      className={cn('fixed top-0 right-0 left-0 z-[1000] w-screen transition-transform', className)}
      style={style}
    >
      <HeaderContainer
        transparent={transparent}
        className="min-h-[var(--bottom-bar-height)] w-full flex-col"
      >
        <div className={cn('no-wrap m-auto flex h-[60px] w-full flex-row')}>
          <div className="w-full">{headerLeft}</div>
          {headerCenter}
          <div className="w-full">{headerRight}</div>
        </div>
        {subheader}
      </HeaderContainer>
    </header>
  );
};
