import * as React from 'react';

import { Spinner } from '@re/ui-kit/ui/spinner';
import { cn } from '@re/ui-kit/utils/cn';

import { useEventCallback } from '~shared/hooks/use-event-callback';

import {
  activeSlideStatus,
  ELEMENT_ICON,
  SLIDE_STATUS_COMPLETE,
  SLIDE_STATUS_ERROR,
  SLIDE_STATUS_LOADING,
  SLIDE_STATUS_PLACEHOLDER,
  SlideStatus,
} from '../consts';
import { useEvents } from '../stores/events';
import { useTimeouts } from '../stores/timeouts';
import { CarouselSettings, ContainerRect, Render, SlideImage } from '../types';
import { cssClass, hasWindow, isImageFitCover, makeComposePrefix } from '../utils';
import { ErrorIcon } from './icons';

const slidePrefix = makeComposePrefix('slide');
const slideImagePrefix = makeComposePrefix('slide_image');

export type ImageSlideProps = Partial<Pick<CarouselSettings, 'imageFit' | 'imageProps'>> & {
  slide: SlideImage;
  offset?: number;
  render?: Render;
  rect?: ContainerRect;
  onClick?: () => void;
  onLoad?: (image: HTMLImageElement) => void;
  onError?: () => void;
  style?: React.CSSProperties;
};

export function ImageSlide({
  slide: image,
  offset,
  render,
  rect,
  imageFit,
  imageProps,
  onClick,
  onLoad,
  onError,
  style,
}: ImageSlideProps) {
  const [status, setStatus] = React.useState<SlideStatus>(SLIDE_STATUS_LOADING);

  const { publish } = useEvents();
  const { setTimeout } = useTimeouts();

  const imageRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (offset === 0) {
      publish(activeSlideStatus(status));
    }
  }, [offset, status, publish]);

  const handleLoading = useEventCallback((img: HTMLImageElement) => {
    const loadImage = () => {
      if (!img.parentNode) return;
      setStatus(SLIDE_STATUS_COMPLETE);

      setTimeout(() => {
        onLoad?.(img);
      }, 0);
    };

    if ('decode' in img) {
      img
        .decode()
        .catch(() => {})
        .then(loadImage);
    } else {
      loadImage();
    }
  });

  const setImageRef = React.useCallback(
    (img: HTMLImageElement | null) => {
      imageRef.current = img;

      if (img?.complete) {
        Promise.resolve().then(() => {
          handleLoading(img);
        });
      }
    },
    [handleLoading]
  );

  const handleOnLoad = React.useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      handleLoading(event.currentTarget);
    },
    [handleLoading]
  );

  const handleOnError = useEventCallback(() => {
    setStatus(SLIDE_STATUS_ERROR);
    onError?.();
  });

  const cover = isImageFitCover(image, imageFit);

  const nonInfinite = (value: number, fallback: number) =>
    Number.isFinite(value) ? value : fallback;

  const maxWidth = nonInfinite(
    Math.max(
      ...(image.srcSet?.map((x) => x.width) ?? [])
        .concat(image.width ? [image.width] : [])
        .filter(Boolean)
    ),
    imageRef.current?.naturalWidth || 0
  );

  const maxHeight = nonInfinite(
    Math.max(
      ...(image.srcSet?.map((x) => x.height) ?? [])
        .concat(image.height ? [image.height] : [])
        .filter(Boolean)
    ),
    imageRef.current?.naturalHeight || 0
  );

  const defaultStyle =
    maxWidth && maxHeight
      ? {
          maxWidth: `min(${maxWidth}px, 100%)`,
          maxHeight: `min(${maxHeight}px, 100%)`,
        }
      : {
          maxWidth: '100%',
          maxHeight: '100%',
        };

  const srcSet = image.srcSet
    ?.sort((a, b) => a.width - b.width)
    .map((item) => `${item.src} ${item.width}w`)
    .join(', ');

  const estimateActualWidth = () =>
    rect && !cover && image.width && image.height
      ? (rect.height / image.height) * image.width
      : Number.MAX_VALUE;

  const sizes =
    srcSet && rect && hasWindow()
      ? `${Math.round(Math.min(estimateActualWidth(), rect.width))}px`
      : undefined;

  const {
    style: imagePropsStyle,
    className: imagePropsClassName,
    ...restImageProps
  } = imageProps || {};

  return (
    <>
      <img
        ref={setImageRef}
        onLoad={handleOnLoad}
        onError={handleOnError}
        onClick={onClick}
        draggable={false}
        className={cn(
          'rounded-sm',
          cssClass(slideImagePrefix()),
          cover && cssClass(slideImagePrefix('cover')),
          status !== SLIDE_STATUS_COMPLETE && cssClass(slideImagePrefix('loading')),
          imagePropsClassName
        )}
        style={{ ...defaultStyle, ...style, ...imagePropsStyle }}
        {...restImageProps}
        alt={image.alt}
        sizes={sizes}
        srcSet={srcSet}
        src={image.src}
      />

      {status !== SLIDE_STATUS_COMPLETE && (
        <div className={cssClass(slidePrefix(SLIDE_STATUS_PLACEHOLDER))}>
          {status === SLIDE_STATUS_LOADING &&
            (render?.iconLoading ? (
              render.iconLoading()
            ) : (
              <Spinner
                className={cn(cssClass(ELEMENT_ICON), cssClass(slidePrefix(SLIDE_STATUS_LOADING)))}
              />
            ))}
          {status === SLIDE_STATUS_ERROR &&
            (render?.iconError ? (
              render.iconError()
            ) : (
              <ErrorIcon
                className={cn(cssClass(ELEMENT_ICON), cssClass(slidePrefix(SLIDE_STATUS_ERROR)))}
              />
            ))}
        </div>
      )}
    </>
  );
}
