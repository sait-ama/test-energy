'use client';
import { cva } from 'class-variance-authority';

import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { TITLE_PREVIEW_SIZE } from '~entities/title/model/consts';
import { TitleImage } from '~entities/title/ui/title-image';

const layoutVariants = cva('cs-text', {});

export const HorizontalTitleCardLayout = (props) => {
  const {
    ref,
    component: Component = 'div',
    actions,
    style,
    className,
    size = 'md',
    withHover,
    subtitle,
    ...rest
  } = props;

  return (
    <Component
      ref={ref}
      className={cn(
        'group dark:bg-card relative flex w-full items-center gap-4 overflow-hidden !rounded-md bg-white p-2 select-none',
        withHover && 'dark:hover:border-primary dark:hover:bg-accent/20 transition-colors',
        className
      )}
      style={style}
      {...rest}
    >
      <div className="flex flex-col">
        {title}
        <div className="mb-1.5">
          <ReText size="md" weight="medium" lineClamp={2} className="leading-sm text-balance">
            {description}
          </ReText>
        </div>
        {subtitle}
      </div>
      {actions}
    </Component>
  );
};

export const HorizontalTitleCardImage = (props) => {
  return (
    <TitleImage
      isLoading={isLoading}
      src={model?.cover?.[TITLE_PREVIEW_SIZE]}
      alt={model?.main_name ?? 'Тайтл'}
      fill
      priority
      blur={explicit}
      className={cn(
        size === 'xs' && 'w-16 md:w-16 lg:w-20',
        size === 'sm' && 'w-20 md:w-22 lg:w-24',
        size === 'md' && 'w-20 md:w-24 lg:w-28'
      )}
    />
  );
};

export const HorizontalCardTitle = (props) => {
  const { children } = props;

  return (
    <ReText size="xs" indent="xxs" color="muted-foreground" lineClamp={1} className="text-ellipsis">
      {children}
    </ReText>
  );
};
