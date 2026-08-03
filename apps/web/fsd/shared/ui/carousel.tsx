'use client';
import * as React from 'react';
import { ComponentProps, memo } from 'react';

import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';

import { createContext } from '@re/core/utils/create-context';
import ChevronLeft from '@re/ui-kit/icons/chevron-left';
import ChevronRight from '@re/ui-kit/icons/chevron-right';
import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';
import { Slot } from '@re/ui-kit/ui/slot';
import { cn } from '@re/ui-kit/utils/cn';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

interface CarouselProps {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: CarouselApi) => void;
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const { useStore: useCarousel, Provider: CarouselProvider } = createContext<
  CarouselContextProps,
  CarouselContextProps
>((v) => v, 'Carousel');

const CarouselSkeleton = ({ className, children, ...props }: ComponentProps<'div'>) => (
  <CarouselProvider
    // @ts-ignore
    value={{
      orientation: 'horizontal',
    }}
  >
    <div
      className={cn('relative', className)}
      role="region"
      aria-roledescription="carousel"
      {...props}
    >
      {children}
    </div>
  </CarouselProvider>
);

const Carousel = memo((props: ComponentProps<'div'> & CarouselProps) => {
  const {
    orientation = 'horizontal',
    ref,
    opts,
    setApi,
    plugins,
    className,
    children,
    ...rest
  } = props;
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) {
      return;
    }

    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);
  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  React.useEffect(() => {
    if (!api || !setApi) {
      return;
    }

    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    onSelect(api);
    api.on('reInit', onSelect);
    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselProvider
      value={{
        carouselRef,
        api,
        opts,
        orientation: orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        ref={ref}
        data-slot="carousel"
        onKeyDownCapture={handleKeyDown}
        className={cn('relative', className)}
        role="region"
        aria-roledescription="carousel"
        {...rest}
      >
        {children}
      </div>
    </CarouselProvider>
  );
});

const CarouselContent = ({
  className,
  ref,
  carouselClassName,
  ...props
}: ComponentProps<'div'> & { carouselClassName?: string }) => {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className={cn('overflow-hidden', carouselClassName)}
      data-slot="carousel-content"
    >
      <div
        ref={ref}
        className={cn('flex', orientation === 'horizontal' ? '' : 'flex-col', className)}
        {...props}
      />
    </div>
  );
};

const CarouselItem = memo(
  ({
    asChild,
    className,
    ref,
    withPadding = true,
    ...props
  }: ComponentProps<'div'> & { asChild?: boolean; withPadding?: boolean }) => {
    const { orientation } = useCarousel();

    const Component = asChild ? Slot : 'div';

    return (
      <Component
        ref={ref}
        role="group"
        data-slot="carousel-item"
        aria-roledescription="slide"
        className={cn(
          '[--padding:16px]',
          'min-w-0 shrink-0 grow-0 basis-full',
          !withPadding
            ? ''
            : orientation === 'horizontal'
              ? 'pr-[var(--padding)]'
              : 'pb-[var(--padding)]',
          className
        )}
        {...props}
      />
    );
  }
);

interface CarouselNextProps extends ButtonProps {
  yAxis?: NumberIsomorphic;
  xAxis?: NumberIsomorphic;
}

const CarouselPrevious = (props: CarouselNextProps) => {
  const {
    xAxis = 16,
    yAxis = '50%',
    className,
    ref,
    style,
    variant = 'flat',
    color = 'secondary',
    size = 'lg',
    circle = true,
    onClick,
    ...rest
  } = props;
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  const translateProp = orientation === 'horizontal' ? 'Y' : 'X';

  const xAxisValue = orientation === 'horizontal' ? xAxis : yAxis;
  const yAxisValue = orientation === 'horizontal' ? yAxis : xAxis;

  return (
    <Button
      ref={ref}
      variant={variant}
      color={color}
      circle={circle}
      data-slot="carousel-previous"
      size={size}
      className={cn(
        'bg-background/50 text-secondary-foreground supports-[backdrop-filter]:bg-background/60 absolute z-[3] max-sm:hidden',
        { 'rotate-90': orientation === 'vertical' },
        orientation === 'horizontal'
          ? 'md:left-4 xl:-left-14'
          : '-top-12 left-1/2 -translate-x-1/2 rotate-90',

        //backdrop-blur,
        className
      )}
      style={{
        // left: xAxisValue,
        top: yAxisValue,
        transform: `translate${translateProp}(-${yAxis})`,
        ...style,
      }}
      disabled={!canScrollPrev}
      onClick={(e) => {
        scrollPrev();
        onClick?.(e);
      }}
      {...rest}
    >
      <ChevronLeft size={20} />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
};

interface CarouselNextProps extends ButtonProps {
  yAxis?: NumberIsomorphic;
  xAxis?: NumberIsomorphic;
}

const CarouselNext = (props: CarouselNextProps) => {
  const {
    xAxis = 16,
    yAxis = '50%',
    className,
    ref,
    style,
    variant = 'flat',
    color = 'secondary',
    size = 'lg',
    onClick,
    circle = true,
    ...rest
  } = props;
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  const xProp = orientation === 'horizontal' ? 'right' : 'left';
  const yProp = orientation === 'horizontal' ? 'top' : 'bottom';
  const translateProp = orientation === 'horizontal' ? 'Y' : 'X';

  const xAxisValue = orientation === 'horizontal' ? xAxis : yAxis;
  const yAxisValue = orientation === 'horizontal' ? yAxis : xAxis;

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      circle={circle}
      color={color}
      data-slot="carousel-next"
      className={cn(
        'bg-background/50 text-secondary-foreground supports-[backdrop-filter]:bg-background/60 absolute z-[3] max-sm:hidden',
        { 'rotate-90': orientation === 'vertical' },
        orientation === 'horizontal'
          ? 'top-1/2 md:right-4 xl:-right-14'
          : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',

        // 'backdrop-blur'
        className
      )}
      style={{
        // [xProp]: xAxisValue,
        [yProp]: yAxisValue,
        transform: `translate${translateProp}(-${yAxis})`,
        ...style,
      }}
      disabled={!canScrollNext}
      onClick={(e) => {
        scrollNext();
        onClick?.(e);
      }}
      {...rest}
    >
      <ChevronRight size={20} />
      <span className="sr-only">Next slide</span>
    </Button>
  );
};

export {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselSkeleton,
};
