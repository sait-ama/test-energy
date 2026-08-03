import { type ComponentProps, useMemo } from 'react';
import { Merge } from 'react-hook-form';
import type { ImageProps } from 'next/image';
import NextImage from 'next/image';

import { cn } from '@re/ui-kit/utils/cn';

interface LinearGradientBaseProps extends ComponentProps<'div'> {
  before?: boolean;
  after?: boolean;
}

export const LinearGradientBase = (props: LinearGradientBaseProps) => {
  const { className, after = true, children, before, style, ...rest } = props;
  const computedStyles = useMemo(
    () =>
      cn(
        `before:[--r-linear-gradient-color:hsl(var(--r-background))] after:[--r-linear-gradient-color:hsl(var(--r-background))]`,
        'relative before:absolute after:absolute',
        'after:bottom-[-2px] before:bottom-[100%]',
        'after:left-0 before:left-0',
        'after:block before:block',
        'after:h-[30%]',
        'after:w-full before:w-full',
        'after:bg-gradient-to-b after:from-transparent after:to-[var(--r-linear-gradient-color)]',
        'before:bg-gradient-to-t before:top-auto before:to-transparent before:from-[var(--r-linear-gradient-color)]',
        'before:content-[""] after:content-[""]',
        `before:h-[10%]`,
        { 'before:block': before, 'before:hidden': !before },
        { 'after:block': after, 'after:hidden': !after },
        className
      ),
    [before, after, className]
  );

  return (
    <div style={style} className={computedStyles} {...rest}>
      {children}
    </div>
  );
};

interface ImageWithLinearGradientProps
  extends Merge<Omit<LinearGradientBaseProps, keyof ImageProps | 'ref'>, ImageProps> {
  imgClassName?: string;
  src: string;
  before?: boolean;
  alt: string;
}

/**
 * linearPercentHeight dosnt work, use className=after:h-[20%]
 * **/
//todo linearPercentHeight dosnt work, use after:h-[20%]
export const LinearGradient = (props: ImageWithLinearGradientProps) => {
  const { src, width, before, height, alt, imgClassName, className, style, ...rest } = props;

  return (
    <LinearGradientBase style={style} className={className} before={before}>
      <NextImage
        style={{ maxWidth: '150%' }}
        width={width}
        height={height}
        src={src}
        className={cn('pointer-events-none select-none', imgClassName)}
        alt={alt}
        {...rest}
      />
    </LinearGradientBase>
  );
};
