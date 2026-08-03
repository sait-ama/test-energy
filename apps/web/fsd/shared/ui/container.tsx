import type { ComponentPropsWithoutRef, FC } from 'react';

import { Slot } from '@re/ui-kit/ui/slot';
import { cn } from '@re/ui-kit/utils/cn';

export interface ContainerProps extends ComponentPropsWithoutRef<'div'> {
  // @deprecated
  slim?: boolean;
  layout?: 'tiny' | 'extraslim' | 'slim' | 'wide';
  asChild?: boolean;
  ref?: React.Ref<HTMLDivElement>;
}

export const Container: FC<ContainerProps> = (props) => {
  const { asChild, slim, children, className, layout: layoutProp, ref } = props;

  const Component = asChild ? Slot : 'div';

  const layout = layoutProp ?? (slim ? 'slim' : 'wide');

  return (
    <Component
      ref={ref}
      className={cn(
        'mx-auto w-full px-2 sm:px-4 md:px-4',
        {
          'lg:max-w-screen-md': layout === 'tiny',
          'lg:max-w-screen-lg': layout === 'extraslim',
          'lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-xl': layout === 'slim',
          'lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl': layout === 'wide',
        },
        className
      )}
    >
      {children}
    </Component>
  );
};
