import type { ReactNode } from 'react';
import React from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { useClickableAreaHandlers, useReaderSettings } from '~entities/reader/model/store';

interface ClickableLayoutAreaRenderFunctionActions {
  onNext: VoidFunction;
  onPrev: VoidFunction;
  onMenu: VoidFunction;
}

type ClickableLayoutAreaRenderFunction = (
  actions: ClickableLayoutAreaRenderFunctionActions,
  preview: boolean
) => ReactNode;

const areaId2Layout: Record<number, ClickableLayoutAreaRenderFunction> = {
  1: ({ onPrev, onMenu, onNext }, preview) => (
    <>
      <div
        className={cn('relative z-[100] h-full w-1/3 select-none', {
          "after:bg-destructive/30 after:absolute after:top-0 after:left-0 after:flex after:h-full after:w-full after:items-center after:justify-center after:content-['Назад']":
            preview,
        })}
        onClick={onPrev}
      />
      <div
        className={cn('relative z-[100] h-full w-1/3 select-none', {
          "after:bg-muted/30 after:absolute after:top-0 after:left-0 after:flex after:h-full after:w-full after:items-center after:justify-center after:content-['Меню']":
            preview,
        })}
        onClick={onMenu}
      />
      <div
        className={cn('relative z-[100] h-full w-1/3 select-none', {
          "after:bg-success/30 after:absolute after:top-0 after:left-0 after:flex after:h-full after:w-full after:items-center after:justify-center after:content-['Вперед']":
            preview,
        })}
        onClick={onNext}
      />
    </>
  ),
};

interface ClickableAreaInZoneEnabledProps {
  area: 'page' | 'full';
  children: ReactNode;
}

export const ClickableAreaToggle = (props: ClickableAreaInZoneEnabledProps) => {
  const { area, children } = props;
  const clickableAreaZone = useReaderSettings((v) => v.value.manga.clickableAreaZone);

  if (area !== clickableAreaZone) return null;

  return children;
};

export const ClickableArea = () => {
  const clickableAreaId = useReaderSettings((v) => v.value.manga.clickableAreaId);
  const actions = useClickableAreaHandlers((v) => v.actions);
  const preview = useClickableAreaHandlers((v) => v.previewMode);
  const renderLayout = areaId2Layout[clickableAreaId ?? 1]!;

  return (
    <div className={cn('absolute inset-0 flex size-full')}>{renderLayout(actions, preview)}</div>
  );
};
