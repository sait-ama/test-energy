'use client';

import { memo } from 'react';

import ArrowLeft from '@re/ui-kit/icons/arrow-left';
import { cn } from '@re/ui-kit/utils/cn';

import { usePresetManageDialog } from '../../model/context';

interface PresetManageHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const PresetManageHeader = memo<PresetManageHeaderProps>(({ children, className }) => {
  const { showBackButton, backButtonAction } = usePresetManageDialog();

  return (
    <div
      className={cn('flex items-center gap-3', showBackButton && 'group cursor-pointer', className)}
      role="button"
      onClick={() => showBackButton && backButtonAction?.()}
    >
      {showBackButton && backButtonAction && (
        <div className="group-hover:bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-md p-0">
          <ArrowLeft className="h-4 w-4" />
        </div>
      )}
      {children}
    </div>
  );
});

PresetManageHeader.displayName = 'PresetManageHeader';
