'use client';

import { memo, PropsWithChildren } from 'react';

import { cva } from 'class-variance-authority';

import { Button, ButtonProps } from '@re/ui-kit/ui/button';

import { cn } from '~shared/utils/cn';

import { useTitlesFeedPresetsContext } from '../model/context';
import { Preset } from '../model/types';

type PresetItemProps = ButtonProps & {
  preset: Preset;
  isActive: boolean;
  className?: string;
};

export const presetItemVariants = cva('bg-secondary text-foreground h-9 opacity-100!', {
  variants: {
    isActive: {
      true: 'border-foreground/20 bg-foreground text-background hover:bg-foreground/90 hover:text-background',
      false: 'border border-transparent',
    },
  },
});

export const PresetItemUi = (props: PropsWithChildren<{ isActive?: boolean } & ButtonProps>) => {
  const { children, isActive = false, onClick, className, ...rest } = props;
  const buttonClassName = presetItemVariants({ isActive });
  return (
    <Button variant="ghost" {...rest} className={cn(buttonClassName, className)} onClick={onClick}>
      {children}
    </Button>
  );
};

export const PresetItem = memo((props: PropsWithChildren<PresetItemProps>) => {
  const { togglePreset } = useTitlesFeedPresetsContext();
  const { children, preset, isActive, ...rest } = props;

  const handleClick = () => togglePreset(preset);

  return (
    <PresetItemUi key={preset.name} isActive={isActive} onClick={handleClick} {...rest}>
      {children || preset.name}
    </PresetItemUi>
  );
});
PresetItem.displayName = 'PresetItem';
