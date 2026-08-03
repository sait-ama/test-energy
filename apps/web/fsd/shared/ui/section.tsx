import type { CSSProperties, ReactNode } from 'react';

import type { TextVariants } from '@re/ui-kit/ui/text';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

export interface SectionTitleProps {
  children?: ReactNode;
  aside?: ReactNode;
  className?: string;
  size?: TextVariants['size'];
  textClassName?: string;
}

export const SectionTitle = ({
  children,
  aside,
  className,
  textClassName,
  size = 'lg',
}: SectionTitleProps) => (
  <div className={cn('flex items-center justify-between', className)}>
    <ReText
      component="h3"
      size={size}
      weight="semibold"
      className={cn('leading-[1.25]', textClassName)}
    >
      {children}
    </ReText>
    {aside}
  </div>
);

export interface SectionProps {
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
  withBorder?: boolean;
}

export const Section = ({ className, children, withBorder = true, ...rest }: SectionProps) => (
  <section
    className={cn(
      'cs-section',
      'flex flex-col gap-3 rounded-md p-4',
      'dark:bg-background bg-white',
      withBorder && 'border-border border dark:border-1',
      className
    )}
    {...rest}
  >
    {children}
  </section>
);

export interface SectionContentProps {
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}

export const SectionContent = ({ className, children, ...rest }: SectionContentProps) => (
  <div className={cn('flex', className)} {...rest}>
    {children}
  </div>
);
