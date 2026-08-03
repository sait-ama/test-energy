'use client';

import * as React from 'react';

import { cva, VariantProps } from 'class-variance-authority';

import { generatePairOfColorsFromString } from '../../theme/colors';
import { cn } from '../../utils/cn';
import { SkeletonSlot, SkeletonSlotProps } from '../skeleton';

import * as MediaPrimitive from './../media';
import { getWholeChar } from './utils';

const avatarVariants = cva('relative flex shrink-0 overflow-hidden', {
  variants: {
    size: {
      xs: 'size-8',
      sm: 'size-10',
      md: 'size-12',
      lg: 'size-16',
      xl: 'size-24',
    },
    shape: {
      circle: 'rounded-full',
      square: 'rounded-xl',
    },
  },
  defaultVariants: {
    shape: 'square',
  },
});

export type AvatarSizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarShapes = 'circle' | 'square';
export type AvatarVariants = VariantProps<typeof avatarVariants>;
export type AvatarSizeType = AvatarSizes | number;

export const sizeVariantToPixels: Record<AvatarSizes, number> = {
  xs: 32,
  sm: 40,
  md: 48,
  lg: 64,
  xl: 96,
};

export type AvatarProps = React.ComponentProps<typeof MediaPrimitive.Root> &
  Omit<AvatarVariants, 'size'> & {
    size?: AvatarSizeType;
  };

function Avatar({ className, shape, size, style, ...props }: AvatarProps) {
  return (
    <MediaPrimitive.Root
      data-slot="avatar"
      className={cn(
        avatarVariants({ size: typeof size === 'string' ? size : undefined, shape }),
        className
      )}
      style={{
        ...(typeof size === 'number' ? { width: size, height: size } : {}),
        ...style,
      }}
      {...props}
    />
  );
}

export type AvatarImageProps = React.ComponentProps<typeof MediaPrimitive.Content> & {
  alt?: string;
  size?: AvatarSizeType;
};

function AvatarImage({ className, size, ...props }: AvatarImageProps) {
  return (
    <MediaPrimitive.Content
      data-slot="avatar-image"
      className={cn('z-[1] aspect-square size-full object-cover select-none', className)}
      {...(typeof size === 'number' ? { width: size, height: size } : {})}
      {...props}
    />
  );
}

export type AvatarFallbackProps = React.ComponentProps<typeof MediaPrimitive.Fallback>;

function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  const colors = generatePairOfColorsFromString(
    props.children?.toString().slice(0, 4) || undefined
  );

  return (
    <MediaPrimitive.Fallback
      data-slot="avatar-fallback"
      style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
      className={cn(
        'bg-muted text-primary-foreground flex size-full items-center justify-center font-bold',
        className
      )}
      {...props}
    >
      {typeof props.children === 'string'
        ? getWholeChar(props.children, 0).toUpperCase()
        : props.children}
    </MediaPrimitive.Fallback>
  );
}

export type AvatarSkeletonSlotProps = SkeletonSlotProps & {
  size?: AvatarSizeType | number;
  shape?: AvatarShapes;
  className?: string;
};

function AvatarSkeletonSlot(props: React.PropsWithChildren<AvatarSkeletonSlotProps>) {
  const { size, show, shape, className, render, style, ...rest } = props;
  const sizeVariant = typeof size === 'string' ? (size as AvatarSizes) : undefined;
  const sizeAsProp = typeof size === 'number' ? size : undefined;

  return (
    <SkeletonSlot
      show={show}
      size={sizeAsProp}
      containerClassName={cn(avatarVariants({ size: sizeVariant, shape }), className)}
      render={render}
      style={style}
      {...rest}
    />
  );
}

export { Avatar, AvatarFallback, AvatarImage, AvatarSkeletonSlot };
