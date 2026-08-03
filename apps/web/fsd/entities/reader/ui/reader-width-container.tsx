import { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';

import { cn } from '@re/ui-kit/utils/cn';


export interface ReaderWidthContainer extends ComponentPropsWithRef<'div'> {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}
export const ReaderWidthContainer = ({
  children,
  className,
  ref,
  ...rest
}: ReaderWidthContainer) => {
  return (
    <div
      ref={ref}
      data-reader-vars-scope
      className={cn(
        'w-[var(--reader-container-width)] md:w-[calc(var(--reader-container-width)/2)]',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
