'use client';
import type {
  ComponentProps,
  ComponentPropsWithoutRef,
  ComponentType,
  ReactElement,
  ReactNode,
} from 'react';
import React, { cloneElement } from 'react';
import type { LinkProps } from 'next/link';
import Link from 'next/link';

import { createContext } from '@re/core/utils/create-context';
import type { BadgeProps } from '@re/ui-kit/ui/badge';
import { Badge } from '@re/ui-kit/ui/badge';
import type { IconProps } from '@re/ui-kit/ui/icon';
import { SkeletonV2 } from '@re/ui-kit/ui/skeleton';
import { Slot } from '@re/ui-kit/ui/slot';
import type { TextElements, TextVariants } from '@re/ui-kit/ui/text';
import { ReText, textVariants } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import type { ContainerProps } from '~shared/ui/container';
import { Container } from '~shared/ui/container';
import { RichText } from '~shared/ui/rich-text';
import type { SectionProps } from '~shared/ui/section';
import { Section, SectionContent, SectionTitle } from '~shared/ui/section';

interface EntityLayout {
  wallpaper?: string;
}

const { Provider: EntityLayoutProvider, useStore: useEntityLayout } = createContext<
  EntityLayout,
  EntityLayout
>((v) => v);

interface EntityLayoutRootProps extends ComponentPropsWithoutRef<'div'> {
  wallpaper?: string;
}

export const EntityLayoutRoot = (props: EntityLayoutRootProps) => {
  const { children, wallpaper, className, ...rest } = props;

  return (
    <EntityLayoutProvider
      value={{
        wallpaper,
      }}
    >
      <div {...rest} className={cn('cs-layout-root flex w-full flex-col gap-4', className)}>
        {children}
      </div>
    </EntityLayoutProvider>
  );
};

interface EntityLayoutHeaderProps extends ComponentPropsWithoutRef<'div'> {}

export const EntityLayoutHeader = (props: EntityLayoutHeaderProps) => {
  const { children, className, ...rest } = props;
  // const wallpaper = useEntityLayout((v) => v.wallpaper);

  return (
    <div
      {...rest}
      className={cn(
        'cs-layout-header relative m-auto flex w-full max-w-[885px] shrink-0 basis-auto flex-col gap-6 p-4 md:flex-row',
        // { 'mt-[108px]': wallpaper },
        className
      )}
    >
      {children}
    </div>
  );
};

interface EntityLayoutWallpaperProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  children: ({ wallpaper }: { wallpaper: string }) => ReactNode;
}

export const EntityLayoutWallpaper = (props: EntityLayoutWallpaperProps) => {
  const { children } = props;

  const wallpaper = useEntityLayout((v) => v.wallpaper);

  if (!wallpaper) return null;

  return children({ wallpaper });
};

interface EntityLayoutAvatarContainerProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  children: ReactNode | ((props: { size: number; priority: boolean }) => ReactNode);
}

export const EntityLayoutAvatarContainer = (props: EntityLayoutAvatarContainerProps) => {
  const { children, className, ...rest } = props;

  return (
    <div
      className={cn(
        'cs-layout-avatar-container flex shrink-0 flex-col items-center justify-center gap-2',
        className
      )}
      {...rest}
    >
      {typeof children === 'function' ? children({ size: 158, priority: true }) : children}
    </div>
  );
};

interface EntityLayoutHeadingContainerProps extends ComponentPropsWithoutRef<'div'> {
  hasWallpaper?: boolean;
}

export const EntityLayoutHeadingContainer = (props: EntityLayoutHeadingContainerProps) => {
  const { children, className, hasWallpaper, ...rest } = props;
  const wallpaper = useEntityLayout((v) => v.wallpaper);

  return (
    <div
      className={cn(
        'cs-layout-heading-container flex w-full flex-col gap-3',
        { 'md:mt-[96px]': wallpaper || hasWallpaper, 'my-auto': !wallpaper && !hasWallpaper },
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

interface EntityLayoutTitleContainerProps extends ComponentPropsWithoutRef<'div'> {}

export const EntityLayoutTitleContainer = (props: EntityLayoutTitleContainerProps) => {
  const { children, className, ...rest } = props;

  return (
    <div
      className={cn(
        'cs-layout-title-container flex w-full flex-col justify-center gap-4 md:flex-row md:items-center md:justify-between',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

type EntityLayoutTitleProps = TextVariants &
  ComponentPropsWithoutRef<'p'> & {
    icon?: ReactNode;
    rightActions?: ReactNode;
    innerClassName?: string;
  };

export const EntityLayoutTitle = (props: EntityLayoutTitleProps) => {
  const { children, icon, className, innerClassName, rightActions, ...rest } = props;

  return (
    <>
      <div
        className={cn(
          'cs-layout-title flex items-center justify-center gap-2 md:justify-start',
          className
        )}
      >
        <ReText
          size="2xl"
          weight="bold"
          className={cn(
            'cs-layout-title-text break-word leading-lg mx-2 text-center md:px-0 md:text-left',
            innerClassName
          )}
          {...rest}
        >
          {children}
        </ReText>
        {icon}
      </div>
      {rightActions}
    </>
  );
};

type EntityLayoutSubtitleProps = TextVariants & ComponentPropsWithoutRef<'p'>;

export const EntityLayoutSubtitle = (props: EntityLayoutSubtitleProps) => {
  const { children, className, ...rest } = props;

  return (
    <ReText
      color="muted-foreground"
      size="sm"
      className={cn('cs-layout-subtitle mx-2 w-full text-center md:text-left', className)}
      {...rest}
    >
      {children}
    </ReText>
  );
};

interface EntityLayoutTitleIconProps {
  children: ({ size }: { size: number }) => ReactNode;
}

export const EntityLayoutTitleIcon = (props: EntityLayoutTitleIconProps) => {
  const { children } = props;

  return children({ size: 28 });
};

interface EntityLayoutActionsProps extends ComponentPropsWithoutRef<'div'> {}

export const EntityLayoutActions = (props: EntityLayoutActionsProps) => {
  const { children, className, ...rest } = props;

  return (
    <div
      className={cn(
        'cs-layout-actions flex items-center justify-center gap-2 md:justify-start',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

interface EntityLayoutContentProps extends ContainerProps {}

export const EntityLayoutContent = (props: EntityLayoutContentProps) => {
  const { children, className, ...rest } = props;

  return (
    <Container {...rest} className={cn('cs-layout-content px-2 lg:px-0', className)}>
      {children}
    </Container>
  );
};

interface EntityLayoutDescriptionProps extends Omit<SectionProps, 'children'> {
  title?: React.ReactNode;
  children: string;
  lineClamp?: number;
}

export const EntityLayoutDescription = (props: EntityLayoutDescriptionProps) => {
  const { children, title, lineClamp, className, ...rest } = props;

  if (!children) return null;

  return (
    <Section {...rest} className={cn('cs-layout-description cs-section', className)}>
      {title}
      <RichText lineClamp={lineClamp}>{children}</RichText>
    </Section>
  );
};

export const EntityLayoutDescriptionTitle = SectionTitle;

interface EntityLayoutStatsRootProps extends ComponentProps<'ul'> {}

export const EntityLayoutStatsRoot = (props: EntityLayoutStatsRootProps) => {
  const { children, className, ...rest } = props;

  return (
    <ul
      {...rest}
      className={cn('cs-layout-stats-root cs-section grid w-full grid-cols-2 gap-2', className)}
    >
      {children}
    </ul>
  );
};

interface EntityLayoutStatsItemProps {
  icon: ComponentType<IconProps>;
  label: string;
  value: string;
  className?: string;
}

export const EntityLayoutStatsItem = (props: EntityLayoutStatsItemProps) => {
  const { icon: Icon, className, value, label } = props;

  return (
    <li
      className={cn(
        'cs-layout-stats-item border-border bg-card flex flex-col rounded-md border p-4 max-sm:pb-3',
        className
      )}
    >
      <Icon className="size-6 text-current md:size-8" />

      <ReText
        component="h4"
        size="sm"
        weight="medium"
        color="muted-foreground"
        className="mt-auto max-sm:mt-3"
      >
        {label}
      </ReText>
      <ReText component="p" size="xl" weight="semibold" className="text-current max-sm:text-lg">
        {value}
      </ReText>
    </li>
  );
};

export const EntityLayoutStatsItemSkeleton = () => {
  return (
    <li className="cs-layout-stats-item border-border bg-card rounded-md border p-4">
      <SkeletonV2 className="bg-skeleton size-5" />
      <SkeletonV2 className="bg-skeleton mt-2 h-4 w-3/4" />
      <SkeletonV2 className="bg-skeleton mt-1 h-8 w-1/2" />
    </li>
  );
};

export const EntityLayoutContactsRoot = Section;

export const EntityLayoutContactsTitle = SectionTitle;
export const EntityLayoutContactsContent = SectionContent;

interface EntityLayoutContactProps extends LinkProps, Omit<ComponentPropsWithoutRef<'a'>, 'href'> {
  children?: ReactNode;
  icon: ComponentType<IconProps>;
}

export const EntityLayoutContact = (props: EntityLayoutContactProps) => {
  const { children, icon: Icon, href, className, ...rest } = props;

  return (
    <Link
      shallow={false}
      prefetch={false}
      target="_blank"
      rel="nofollow"
      className={cn('cs-layout-contact group inline-flex items-center gap-2 p-3', className)}
      href={href}
      {...rest}
    >
      <Icon className="text-foreground group-hover:text-primary transition-all" />
      <ReText size="md" className="group-hover:text-primary transition-all">
        {children}
      </ReText>
    </Link>
  );
};

interface EntityLayoutStatsShortRootProps extends ComponentPropsWithoutRef<'div'> {}

export const EntityLayoutStatsShortRoot = (props: EntityLayoutStatsShortRootProps) => {
  const { className, children, ...rest } = props;

  return (
    <div
      className={cn(
        'cs-layout-stats-short-root flex flex-wrap justify-center gap-2 md:justify-start',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

interface EntityLayoutStatsItemShortProps extends BadgeProps {
  icon?: ReactElement;
  withBackground?: boolean;
  textClassName?: string;
}

export const EntityLayoutStatsItemShort = (props: EntityLayoutStatsItemShortProps) => {
  const { icon, className, textClassName, children, withBackground = true, ...rest } = props;

  return (
    <Badge
      className={cn(
        'cs-layout-stats-item-short flex items-center gap-2 bg-transparent py-1',
        { 'bg-secondary': withBackground }, //backdrop-blur supports-[backdrop-filter]:bg-secondary/50
        className
      )}
      color="secondary"
      {...rest}
    >
      {!!icon && cloneElement(icon, { className: 'w-[18px] text-muted-foreground' })}
      <ReText
        size="sm"
        weight="regular"
        color="foreground"
        className={cn('flex items-center gap-2 whitespace-nowrap', textClassName)}
      >
        {children}
      </ReText>
    </Badge>
  );
};

interface EntityLayoutStatsLineRootProps extends ComponentPropsWithoutRef<'div'> {}

export const EntityLayoutStatsLineRoot = (props: EntityLayoutStatsLineRootProps) => {
  const { className, children, ...rest } = props;

  return (
    <div className={cn('cs-layout-stats-line-root flex flex-col gap-2', className)} {...rest}>
      {children}
    </div>
  );
};

interface EntityLayoutStatsLineItemProps extends ComponentPropsWithoutRef<'div'> {}

export const EntityLayoutStatsLineItem = (props: EntityLayoutStatsLineItemProps) => {
  const { className, children, ...rest } = props;

  return (
    <div className={cn('cs-layout-stats-line-item flex', className)} {...rest}>
      {children}
    </div>
  );
};

type EntityLayoutStatsLineItemTitleProps = TextVariants & ComponentPropsWithoutRef<'p'>;

export const EntityLayoutStatsLineItemTitle = (props: EntityLayoutStatsLineItemTitleProps) => {
  const { className, children, ...rest } = props;

  return (
    <ReText
      color="muted-foreground"
      size="sm"
      className={cn('cs-layout-stats-line-item-title w-[150px] flex-[0_0_auto]', className)}
      {...rest}
    >
      {children}
    </ReText>
  );
};

type EntityLayoutStatsLineItemContentProps = TextVariants &
  ComponentPropsWithoutRef<'p'> & {
    component?: TextElements;
    asChild?: boolean;
  };

export const EntityLayoutStatsLineItemContent = (props: EntityLayoutStatsLineItemContentProps) => {
  const { className, children, asChild, ...rest } = props;

  const Component = asChild ? Slot : 'div';

  return (
    <Component
      className={cn(textVariants({ size: 'sm' }), 'cs-layout-stats-line-item-content', className)}
      {...rest}
    >
      {children}
    </Component>
  );
};
