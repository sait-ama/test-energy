'use client';

import React, { lazy, Suspense } from 'react';

import { PromotionDetailDialogProvider as DialogStoreProvider } from '~entities/promotion/model/store';

// Lazy load the dialog component
const PromotionDetailDialog = lazy(() =>
  import('~entities/promotion/ui/promotion-detail-dialog').then((module) => ({
    default: module.PromotionDetailDialog,
  }))
);

interface PromotionDetailDialogProviderProps {
  children: React.ReactNode;
}

export const PromotionDetailDialogProvider: React.FC<PromotionDetailDialogProviderProps> = ({
  children,
}) => {
  return (
    <DialogStoreProvider>
      {children}
      <Suspense fallback={null}>
        <PromotionDetailDialog />
      </Suspense>
    </DialogStoreProvider>
  );
};
