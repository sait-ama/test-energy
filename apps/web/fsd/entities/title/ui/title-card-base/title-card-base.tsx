import { ComponentProps } from 'react';

import Star from '@re/ui-kit/icons/star';
import * as MediaPrimitive from '@re/ui-kit/ui/media';
import { Slot } from '@re/ui-kit/ui/slot';
import { TextProps } from '@re/ui-kit/ui/text';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import Title from '~shared/assets/placeholders/title';
import { UrlFormatter } from '~shared/utils/url-formatter';

export interface TitleCardRootProps extends ComponentProps<'div'> {
  asChild?: boolean;
}

export const TitleCardRoot = (props: TitleCardRootProps) => {
  const { className, children, asChild, ...rest } = props;

  const Component = asChild ? Slot : 'div';

  return (
    <Component
      {...rest}
      className={cn(
        'group cs-title-card cs-title-vertical-card relative flex h-full flex-col gap-2 overflow-hidden select-none md:gap-3',
        className
      )}
    >
      {children}
    </Component>
  );
};

interface TitleCardContent extends ComponentProps<'div'> {}

export const TitleCardContent = (props: TitleCardContent) => {
  const { className, ...rest } = props;

  return <div className={cn('flex flex-col gap-1 px-1 pb-1', className)} {...rest} />;
};

export interface TitleCardTitleProps extends TextProps {}
export const TitleCardTitle = (props: TitleCardTitleProps) => {
  const { children, className, ...rest } = props;

  return (
    <ReText
      className={cn(
        'text-foreground text-[13px] leading-[1.15] font-semibold text-balance md:text-sm dark:font-semibold',
        className
      )}
      color="foreground"
      lineClamp={2}
      {...rest}
    >
      {children}
    </ReText>
  );
};

export interface TitleActionsRootProps extends ComponentProps<'div'> {}

export const TitleActionsRoot = (props: TitleActionsRootProps) => {
  return <div {...props} />;
};

export const TitleImage = (props) => {
  const { src, slot, className, ...rest } = props;

  return (
    <MediaPrimitive.Root
      src={UrlFormatter.media(src)}
      className={cn('relative aspect-[2/3] w-full overflow-hidden rounded-sm select-none')}
    >
      <MediaPrimitive.MediaNativeImage
        withEnterAnimation
        className={cn(
          'w-full scale-100 object-cover transition! duration-100 group-hover:scale-105',
          className
        )}
        {...rest}
      />
      <MediaPrimitive.Fallback className="flex size-full items-center justify-center">
        <Title size={36} className="text-muted-foreground" />
      </MediaPrimitive.Fallback>
      {slot}
    </MediaPrimitive.Root>
  );
};

// export const BookmarkType = (props: TitleBadgeProps) => {
//     const { value, className } = props;
//
//     if (!value) return null;
//
//     const slicedValue = String(value).length > 12 ? String(value).slice(0, 12) + '...' : value;
//
//     return (
//         <ReText
//             size="xs"
//             weight="semibold"
//             color="primary-foreground"
//             className={cn('bg-primary rounded-md px-2 py-[3px] leading-none', className)}
//         >
//             {slicedValue}
//         </ReText>
//     );
// };

export interface TitleCardSubtitleProps extends TextProps {}

export const TitleCardSubtitle = (props: TitleCardSubtitleProps) => {
  const { children, className, ...rest } = props;

  return (
    <ReText
      color="muted-foreground"
      lineClamp={1}
      className={cn('text-[12px]', className)}
      {...rest}
    >
      {children}
    </ReText>
  );
};

interface TitleCardRatingValueProps extends ComponentProps<'p'> {}

export const TitleCardRating = (props: TitleCardRatingValueProps) => {
  const { children, className, ...rest } = props;

  if (!children || children === '0.0') return null;

  return (
    <ReText
      weight="semibold"
      color="foreground"
      className={cn(
        'bg-background/70 flex flex-nowrap items-center gap-2 rounded-md px-3 py-2 text-xs leading-none select-none md:text-sm',
        className
      )}
      {...rest}
    >
      <Star size={10} className="-mr-px mb-px size-2.5 select-none md:size-3" />
      {children}
    </ReText>
  );
};

interface TitleCardBookmarkStateProps extends ComponentProps<'p'> {}

export const TitleCardBookmarkState = (props: TitleCardBookmarkStateProps) => {
  const { children, className, ...rest } = props;

  if (!children || typeof children !== 'string') return null;

  const slicedValue =
    String(children).length > 12 ? String(children).slice(0, 12) + '...' : children;

  return (
    <ReText
      size="sm"
      weight="semibold"
      className={cn(
        'bg-secondary/60 text-muted-foreground rounded-sm px-2 py-1.5 leading-none',
        className
      )}
      {...rest}
    >
      {slicedValue}
    </ReText>
  );
};
