import type { CSSProperties, PropsWithChildren, ReactElement, ReactNode } from 'react';
import React, { memo } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

export interface SkeletonStyleProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
  inline?: boolean;
  size?: number | string;
}

function styleOptionsToCssProperties({
  width,
  height,
  size,
  borderRadius,
  circle,
}: SkeletonStyleProps & {
  circle: boolean;
}): CSSProperties & Record<`--${string}`, string> {
  const style: ReturnType<typeof styleOptionsToCssProperties> = {};

  if (typeof size === 'string' || typeof size === 'number') {
    style.width = size;
    style.height = size;
  }

  if (typeof width === 'string' || typeof width === 'number') style.width = width;
  if (typeof height === 'string' || typeof height === 'number') style.height = height;

  if (typeof borderRadius === 'string' || typeof borderRadius === 'number')
    style.borderRadius = borderRadius;

  if (circle) style.borderRadius = '50%';

  return style;
}

export interface SkeletonProps extends SkeletonStyleProps {
  count?: number;
  wrapper?: React.FunctionComponent<PropsWithChildren>;

  className?: string;
  containerClassName?: string;
  containerTestId?: string;

  circle?: boolean;
  style?: CSSProperties;
}

export const Skeleton = memo(
  ({
    count = 1,
    wrapper: Wrapper,

    className: customClassName,
    containerClassName,
    containerTestId,

    circle = false,

    style: styleProp,
    ...originalPropsStyleOptions
  }: SkeletonProps): ReactElement => {
    const propsStyleOptions = { ...originalPropsStyleOptions };

    for (const [key, value] of Object.entries(originalPropsStyleOptions)) {
      if (typeof value === 'undefined') {
        delete propsStyleOptions[key as keyof typeof propsStyleOptions];
      }
    }

    const styleOptions = {
      ...propsStyleOptions,
      circle,
    };

    const style = {
      ...styleProp,
      ...styleOptionsToCssProperties(styleOptions),
    };

    const className = cn(
      'inline-flex w-full overflow-hidden rounded-sm bg-skeleton dark:bg-skeleton/40',
      customClassName
    );

    const inline = styleOptions.inline ?? false;

    const elements: ReactElement[] = [];

    const countCeil = Math.ceil(count);

    for (let i = 0; i < countCeil; i++) {
      let thisStyle = style;

      if (countCeil > count && i === countCeil - 1) {
        const width = thisStyle.width ?? '100%';

        const fractionalPart = count % 1;

        const fractionalWidth =
          typeof width === 'number' ? width * fractionalPart : `calc(${width} * ${fractionalPart})`;

        thisStyle = { ...thisStyle, width: fractionalWidth };
      }

      const skeletonSpan = (
        <span className={className} style={thisStyle} key={i}>
          &zwnj;
        </span>
      );

      if (inline) {
        elements.push(skeletonSpan);
      } else {
        elements.push(
          <React.Fragment key={i}>
            {skeletonSpan}
            <br />
          </React.Fragment>
        );
      }
    }

    return (
      <span className={containerClassName} data-testid={containerTestId} aria-live="polite">
        {Wrapper ? elements.map((el, i) => <Wrapper key={i}>{el}</Wrapper>) : elements}
      </span>
    );
  }
);

export interface SkeletonSlotProps extends SkeletonProps {
  show: boolean | undefined;
  render: ReactNode | (() => ReactNode);
  force?: boolean | number | string;
}

export const SkeletonSlot = (props: SkeletonSlotProps) => {
  const { show, render, containerClassName, ...rest } = props;

  if (show) {
    return <Skeleton containerClassName={cn('leading-none', containerClassName)} {...rest} />;
  }

  return typeof render === 'function' ? render() : render;
};

export const SkeletonV2 = memo(({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'bg-card transform-gpu animate-pulse rounded-md will-change-[opacity] backface-hidden',
        className
      )}
      {...props}
    />
  );
});
