'use client';

import { useLayoutEffect } from 'react';
import dynamic from 'next/dynamic';

import { useIsMobile } from '@re/ui-kit/hooks/use-mobile';

import { useBottomActions } from '~shared/lib/bottom-bar/use-bottom-actions';

const READING_BUTTON_BOTTOM_ACTION_ID = 'title-page-reading-btn';

const BottomActionsAsync = dynamic(
  () => import('./bottom-actions').then((mod) => mod.BottomActions),
  {
    ssr: false,
  }
);

export const BottomActionsMobile = () => {
  const { register, unregister } = useBottomActions();
  const isMobile = useIsMobile();

  useLayoutEffect(() => {
    if (isMobile) {
      register({
        key: READING_BUTTON_BOTTOM_ACTION_ID,
        index: 0,
        node: <BottomActionsAsync />,
      });
    }

    return () => unregister(READING_BUTTON_BOTTOM_ACTION_ID);
  }, [isMobile]);

  return null;
};
