import type { ComponentProps } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { HalloweenGiftsContainer } from '~widgets/halloween-gift/ui/halloween-gifts-container';
import { AppLayoutModals } from '~widgets/layout/ui/app-layout-modal';

interface AppLayoutContentProps extends ComponentProps<'main'> {
  fullheight?: boolean;
  withPaddingTop?: boolean;
}

export const AppLayoutContent = (props: AppLayoutContentProps) => {
  const { fullheight = true, withPaddingTop = true, className, children, ...rest } = props;

  return (
    <main
      {...rest}
      className={cn(
        'z-[2] flex h-full flex-1 flex-col items-center',
        { 'min-h-screen': fullheight },
        { 'pt-[60px]': withPaddingTop }, // TODO: change to CSS var
        className
      )}
    >
      {children}
      <AppLayoutModals />
      <HalloweenGiftsContainer />
    </main>
  );
};

interface AppLayoutRootProps extends ComponentProps<'div'> {}

export const AppLayoutRoot = (props: AppLayoutRootProps) => {
  const { className, children, ...rest } = props;

  return (
    <div {...rest} className={cn('bg-background flex w-full max-w-screen flex-col', className)}>
      {children}
    </div>
  );
};
