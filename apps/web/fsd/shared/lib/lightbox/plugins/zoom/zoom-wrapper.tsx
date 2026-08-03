import * as React from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { useIsomorphicEffect } from '~shared/hooks/use-isomorphic-effect';
import { useLightboxProps } from '~shared/lib/lightbox/stores/lightbox-props';

import { ImageSlide } from '../../components';
import { CLASS_SLIDE_WRAPPER, CLASS_SLIDE_WRAPPER_INTERACTIVE } from '../../consts';
import { useLightboxState } from '../../stores/lightbox-state';
import type { ContainerRect, LightboxProps, RenderSlideProps } from '../../types';
import { cssClass, isImageSlide } from '../../utils';
import { isResponsiveImageSlide, ResponsiveImage } from './responsive-image';
import { useZoom } from './zoom-controller';

// using the non-augmented `render` here
export type ZoomWrapperProps = Pick<LightboxProps, 'render'> & RenderSlideProps;

/** Zoom wrapper */
export function ZoomWrapper({ render, slide, offset, rect }: ZoomWrapperProps) {
  const [imageDimensions, setImageDimensions] = React.useState<ContainerRect>();
  const zoomWrapperRef = React.useRef<HTMLDivElement>(null);

  const { zoom, maxZoom, offsetX, offsetY, setZoomWrapper } = useZoom();
  const interactive = zoom > 1;

  const { carousel, on } = useLightboxProps();
  const { currentIndex } = useLightboxState();

  useIsomorphicEffect(() => {
    if (offset === 0) {
      setZoomWrapper({ zoomWrapperRef, imageDimensions });
      return () => setZoomWrapper(undefined);
    }
    return () => {};
  }, [offset, imageDimensions, setZoomWrapper]);

  let rendered = render.slide?.({ slide, offset, rect, zoom, maxZoom });

  if (!rendered && isImageSlide(slide)) {
    const slideProps = {
      slide,
      offset,
      rect,
      render,
      imageFit: carousel.imageFit,
      imageProps: carousel.imageProps,
      onClick: offset === 0 ? () => on.click?.({ index: currentIndex }) : undefined,
    };

    rendered = isResponsiveImageSlide(slide) ? (
      <ResponsiveImage
        {...slideProps}
        slide={slide}
        interactive={interactive}
        rect={offset === 0 ? { width: rect.width * zoom, height: rect.height * zoom } : rect}
      />
    ) : (
      <ImageSlide
        onLoad={(img) => setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })}
        {...slideProps}
      />
    );
  }

  if (!rendered) return null;

  return (
    <div
      ref={zoomWrapperRef}
      className={cn(
        'h-full w-full',
        'flex content-center items-center justify-center transition duration-200',
        cssClass(CLASS_SLIDE_WRAPPER),
        interactive && cssClass(CLASS_SLIDE_WRAPPER_INTERACTIVE)
      )}
      style={
        offset === 0
          ? { transform: `scale(${zoom}) translateX(${offsetX}px) translateY(${offsetY}px)` }
          : undefined
      }
    >
      {rendered}
    </div>
  );
}
