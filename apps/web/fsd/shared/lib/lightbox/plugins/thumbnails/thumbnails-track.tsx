import * as React from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { useAnimation } from '~shared/hooks/use-animation';
import { useEventCallback } from '~shared/hooks/use-event-callback';
import { useRtl } from '~shared/hooks/use-rtl';
import { useKeyboardNavigation } from '~shared/lib/lightbox/modules/navigation/use-keyboard-navigation';
import { useEvents } from '~shared/lib/lightbox/stores/events';
import { useLightboxState } from '~shared/lib/lightbox/stores/lightbox-state';

import { ACTION_NEXT, ACTION_PREV, ACTION_SWIPE } from '../../consts';
import { useSensors } from '../../hooks/use-sensors';
import { useLightboxProps } from '../../stores/lightbox-props';
import type { Slide } from '../../types';
import {
  calculatePreload,
  cleanup,
  cssClass,
  cssVar,
  getSlide,
  getSlideKey,
  hasSlides,
} from '../../utils';
import { defaultThumbnailsProps, useThumbnailsProps } from './props';
import { Thumbnail } from './thumbnail';
import { cssPrefix, cssThumbnailPrefix } from './utils';

import classes from './classes.module.scss';

function isHorizontal(position: ReturnType<typeof useThumbnailsProps>['position']) {
  return ['top', 'bottom'].includes(position);
}

function boxSize(thumbnails: ReturnType<typeof useThumbnailsProps>, dimension: number) {
  return dimension + 2 * (thumbnails.border + thumbnails.padding) + thumbnails.gap;
}

function getThumbnailKey(slide?: Slide | null) {
  const { thumbnail, poster } = (slide as {
    thumbnail?: unknown;
    poster?: unknown;
  }) || { thumbnail: 'placeholder' };

  return (
    (typeof thumbnail === 'string' && thumbnail) ||
    (typeof poster === 'string' && poster) ||
    (slide && getSlideKey(slide)) ||
    undefined
  );
}

export type ThumbnailsTrackProps = {
  visible: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
};

export function ThumbnailsTrack({ visible, containerRef }: ThumbnailsTrackProps) {
  const track = React.useRef<HTMLDivElement>(null);

  const isRTL = useRtl();
  const { publish, subscribe } = useEvents();
  const { carousel, styles } = useLightboxProps();
  const { slides, globalIndex, animation } = useLightboxState();
  const { registerSensors, subscribeSensors } = useSensors();

  useKeyboardNavigation(subscribeSensors);

  const thumbnails = useThumbnailsProps();
  const {
    position,
    width,
    height,
    border,
    borderStyle,
    borderColor,
    borderRadius,
    padding,
    gap,
    vignette,
  } = thumbnails;

  const isTwoSlides = slides?.length === 2;
  const offset = (animation?.duration !== undefined && animation?.increment) || 0;
  const effectiveOffset = isTwoSlides ? 0 : Math.abs(offset);
  const animationDuration = animation?.duration || 0;

  const { prepareAnimation } = useAnimation<number>(track, (snapshot) => ({
    keyframes: isHorizontal(position)
      ? [
          {
            transform: `translateX(${(isRTL ? -1 : 1) * boxSize(thumbnails, width) * offset + snapshot}px)`,
          },
          { transform: 'translateX(0)' },
        ]
      : [
          {
            transform: `translateY(${boxSize(thumbnails, height) * offset + snapshot}px)`,
          },
          { transform: 'translateY(0)' },
        ],
    duration: animationDuration,
    easing: animation?.easing,
  }));

  const handleControllerSwipe = useEventCallback(() => {
    let animationOffset = 0;
    if (containerRef.current && track.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const trackRect = track.current.getBoundingClientRect();
      animationOffset = isHorizontal(position)
        ? trackRect.left - containerRect.left - (containerRect.width - trackRect.width) / 2
        : trackRect.top - containerRect.top - (containerRect.height - trackRect.height) / 2;
    }

    prepareAnimation(animationOffset);
  });

  React.useEffect(
    () => cleanup(subscribe(ACTION_SWIPE, handleControllerSwipe)),
    [subscribe, handleControllerSwipe]
  );

  const preload = isTwoSlides ? 0 : calculatePreload(carousel, slides);
  const items: { key: React.Key; index: number; slide: Slide | null }[] = [];

  if (hasSlides(slides)) {
    if (isTwoSlides) {
      // Для двух слайдов всегда показываем только два слайда
      [0, 1].forEach((index) => {
        const slide = getSlide(slides, index) || null;
        const key = [`${index}`, getThumbnailKey(slide)].filter(Boolean).join('|');
        items.push({ key, index, slide });
      });
    } else {
      // Стандартная логика для более чем двух слайдов
      for (
        let index = globalIndex - preload - effectiveOffset;
        index <= globalIndex + preload + effectiveOffset;
        index += 1
      ) {
        const placeholder =
          (carousel.finite && (index < 0 || index > slides.length - 1)) ||
          (offset < 0 && index < globalIndex - preload) ||
          (offset > 0 && index > globalIndex + preload);
        const slide = !placeholder ? getSlide(slides, index) || null : null;
        const key = [`${index}`, getThumbnailKey(slide)].filter(Boolean).join('|');
        items.push({ key, index, slide });
      }
    }
  }

  const handleClick = (slideIndex: number) => () => {
    if (slideIndex > globalIndex) {
      publish(ACTION_NEXT, { count: slideIndex - globalIndex });
    } else if (slideIndex < globalIndex) {
      publish(ACTION_PREV, { count: globalIndex - slideIndex });
    }
  };

  return (
    <div
      className={cn(
        cssClass(cssPrefix('container')),
        classes.container,
        'flex content-center items-center justify-center'
      )}
      style={{
        ...(!visible ? { display: 'none' } : null),
        ...(width !== defaultThumbnailsProps.width
          ? { [cssVar(cssThumbnailPrefix('width'))]: `${width}px` }
          : null),
        ...(height !== defaultThumbnailsProps.height
          ? { [cssVar(cssThumbnailPrefix('height'))]: `${height}px` }
          : null),
        ...(border !== defaultThumbnailsProps.border
          ? { [cssVar(cssThumbnailPrefix('border'))]: `${border}px` }
          : null),
        ...(borderStyle ? { [cssVar(cssThumbnailPrefix('border_style'))]: borderStyle } : null),
        ...(borderColor ? { [cssVar(cssThumbnailPrefix('border_color'))]: borderColor } : null),
        ...(borderRadius !== defaultThumbnailsProps.borderRadius
          ? { [cssVar(cssThumbnailPrefix('border_radius'))]: `${borderRadius}px` }
          : null),
        ...(padding !== defaultThumbnailsProps.padding
          ? { [cssVar(cssThumbnailPrefix('padding'))]: `${padding}px` }
          : null),
        ...(gap !== defaultThumbnailsProps.gap
          ? { [cssVar(cssThumbnailPrefix('gap'))]: `${gap}px` }
          : null),
        ...styles.thumbnailsContainer,
      }}
    >
      <nav
        ref={track}
        style={styles.thumbnailsTrack}
        className={cn(
          classes.track,
          cssClass(cssPrefix('track')),
          'flex content-center items-center justify-center'
        )}
        tabIndex={-1}
        {...registerSensors}
      >
        {items.map(({ key, index, slide }) => {
          const fadeAnimationDuration = animationDuration / Math.abs(offset || 1);

          // Модифицированная логика fade для двух слайдов
          const fadeIn = isTwoSlides
            ? undefined
            : (offset > 0 &&
                  index > globalIndex + preload - offset &&
                  index <= globalIndex + preload) ||
                (offset < 0 &&
                  index < globalIndex - preload - offset &&
                  index >= globalIndex - preload)
              ? {
                  duration: fadeAnimationDuration,
                  delay:
                    ((offset > 0
                      ? index - (globalIndex + preload - offset)
                      : globalIndex - preload - offset - index) -
                      1) *
                    fadeAnimationDuration,
                }
              : undefined;

          const fadeOut = isTwoSlides
            ? undefined
            : (offset > 0 && index < globalIndex - preload) ||
                (offset < 0 && index > globalIndex + preload)
              ? {
                  duration: fadeAnimationDuration,
                  delay:
                    (offset > 0
                      ? offset - (globalIndex - preload - index)
                      : -offset - (index - (globalIndex + preload))) * fadeAnimationDuration,
                }
              : undefined;

          // Модифицированная логика активного состояния для двух слайдов
          const isActive = isTwoSlides ? index === globalIndex : index === globalIndex;

          return (
            <Thumbnail
              key={key}
              slide={slide}
              active={isActive}
              fadeIn={fadeIn}
              fadeOut={fadeOut}
              placeholder={!slide}
              onClick={handleClick(index)}
              onLoseFocus={() => track.current?.focus()}
            />
          );
        })}
      </nav>
      {vignette && <div className={cssClass(cssPrefix('vignette'))} />}
    </div>
  );
}
