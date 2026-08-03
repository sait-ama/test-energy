'use client';

import dynamic from 'next/dynamic';

import { useIsMobile } from '@re/ui-kit/hooks/use-mobile';

export const PresetSaveDialogAsync = dynamic(
  () => import('./dialog').then((mod) => mod.PresetSaveDialog),
  {
    ssr: false,
  }
);

export const PresetSaveDialog = dynamic(
  () => import('./drawer').then((mod) => mod.PresetSaveDialog),
  {
    ssr: false,
  }
);

export const PresetSaveResponsiveModal = () => {
  const isMobile = useIsMobile();

  return isMobile ? <PresetSaveDialog /> : <PresetSaveDialogAsync />;
};
