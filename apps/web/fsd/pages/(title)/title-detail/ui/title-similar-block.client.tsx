'use client';

import type { ReactNode } from 'react';

import { Media } from '~shared/lib/media';
import { Display } from '~shared/lib/media/const';

import { TitleDetailPageTabs } from '../model/const';
import { useTitleTabs } from '../model/store';

export interface TitleSimilarBlockResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

export const TitleSimilarBlockResponsiveContainer = ({
  children,
  className,
}: TitleSimilarBlockResponsiveContainerProps) => {
  const { tab } = useTitleTabs();

  return (
    <>
      <Media greaterThanOrEqual={Display.xl} className={className}>
        {children}
      </Media>
      <Media lessThan={Display.xl} className={className}>
        {tab === TitleDetailPageTabs.MAIN ? children : null}
      </Media>
    </>
  );
};
