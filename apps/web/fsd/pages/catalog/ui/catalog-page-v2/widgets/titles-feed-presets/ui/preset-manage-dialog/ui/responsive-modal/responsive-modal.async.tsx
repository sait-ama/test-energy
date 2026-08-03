'use client';

import dynamic from 'next/dynamic';

import { useIsMobile } from '@re/ui-kit/hooks/use-mobile';

export const PresetManageDialogAsync = dynamic(
  () => import('./dialog').then((mod) => mod.PresetManageDialog),
  {
    ssr: false,
  }
);

export const PresetManageDialogDrawer = dynamic(
  () => import('./drawer').then((mod) => mod.PresetManageDialog),
  {
    ssr: false,
  }
);

export const PresetManageResponsiveModal = () => {
  const isMobile = useIsMobile();

  return isMobile ? <PresetManageDialogDrawer /> : <PresetManageDialogAsync />;
};
