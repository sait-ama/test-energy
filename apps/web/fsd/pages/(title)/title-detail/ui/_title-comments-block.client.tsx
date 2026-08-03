'use client';

import type { ReactNode } from 'react';

import { Media } from '~shared/lib/media';
import { Display } from '~shared/lib/media/const';

import { TitleDetailPageTabs } from '../model/const';
import { useTitleTabs } from '../model/store';

interface TitleCommentsVisibilityControlProps {
  children: ReactNode;
  className?: string;
}
export const TitleCommentsVisibilityControl = (props: TitleCommentsVisibilityControlProps) => {
  const { tab } = useTitleTabs();
  const { className, children } = props;

  if (
    tab === TitleDetailPageTabs.ANIME ||
    tab === TitleDetailPageTabs.MAIN ||
    tab === TitleDetailPageTabs.VOICEOVER
  ) {
    return (
      <Media className={className} greaterThanOrEqual={Display.md}>
        {children}
      </Media>
    );
  }

  return null;
};
