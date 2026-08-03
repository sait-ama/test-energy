'use client';

import { ComponentType, CSSProperties, memo, ReactNode } from 'react';
import * as React from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { Media } from '~shared/lib/media';
import { Display } from '~shared/lib/media/const';
import { NavigationDesktop } from '~widgets/navigation/ui/navigation.desktop';
import { NavigationMobile } from '~widgets/navigation/ui/navigation.mobile';

interface NavigationProps {
  subheader?: ReactNode;
  className?: string;
  style?: CSSProperties;
  HeaderMobile?: ComponentType<{ subheader?: ReactNode }> | null;
  HeaderDesktop?: ComponentType<{ subheader?: ReactNode }> | null;
}

export const DefaultNavigation = memo((props: NavigationProps) => {
  const {
    subheader,
    HeaderMobile = NavigationMobile,
    HeaderDesktop = NavigationDesktop,
    className,
    style,
  } = props;

  return (
    <div className={cn('z-10', className)} style={style}>
      <Media lessThan={Display.md}>{HeaderMobile && <HeaderMobile subheader={subheader} />}</Media>
      <Media greaterThanOrEqual={Display.md}>
        {HeaderDesktop && <HeaderDesktop subheader={subheader} />}
      </Media>
    </div>
  );
});
