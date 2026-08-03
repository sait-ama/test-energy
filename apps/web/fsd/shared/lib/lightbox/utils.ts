import * as React from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { getDevicePixelRatio, hasWindow } from '~shared/utils/device';
import { calculateSoSoArrayIndex4Slides, round } from '~shared/utils/number';

import { IMAGE_FIT_CONTAIN, IMAGE_FIT_COVER } from './consts';
import {
  CarouselSettings,
  ContainerRect,
  Label,
  Labels,
  LengthOrPercentage,
  LightboxProps,
  Slide,
  SlideImage,
  ToolbarSettings,
} from './types';

import classes from './classes.module.scss';
import { parseLengthPercentage } from '~shared/utils/css';

export function classNames(...args: (string | boolean | undefined)[]): string {
  return cn(...args);
}

export function cssClass(name: string): string {
  return classes[name] || name;
}

export function cssVar(name: string): string {
  return `--yarl__${name}`;
}

export function composePrefix(prefix: string, value?: string): string {
  return value ? `${prefix}_${value}` : prefix;
}

export function makeComposePrefix(base: string) {
  return (prefix?: string) => composePrefix(base, prefix);
}

export function label(labels: Labels | undefined, defaultLabel: Label) {
  return labels?.[defaultLabel] ?? defaultLabel;
}

export function cleanup(...cleaners: (() => void)[]) {
  return () => {
    cleaners.forEach((cleaner) => {
      cleaner();
    });
  };
}

export function makeUseContext<T>(
  name: string,
  contextName: string,
  context: React.Context<T | null>
) {
  return () => {
    const ctx = React.useContext(context);
    if (!ctx) {
      throw new Error(`${name} must be used within a ${contextName}.Provider`);
    }
    return ctx;
  };
}

export function isImageSlide(slide: Slide): slide is SlideImage {
  return slide.type === undefined || slide.type === 'image';
}

export function isImageFitCover(
  image: SlideImage,
  imageFit?: LightboxProps['carousel']['imageFit']
) {
  return (
    image.imageFit === IMAGE_FIT_COVER ||
    (image.imageFit !== IMAGE_FIT_CONTAIN && imageFit === IMAGE_FIT_COVER)
  );
}

export function computeSlideRect(containerRect: ContainerRect, padding: LengthOrPercentage) {
  const paddingValue = parseLengthPercentage(padding);
  const paddingPixels =
    paddingValue.percent !== undefined
      ? (containerRect.width / 100) * paddingValue.percent
      : (paddingValue.pixel ?? 0);
  return {
    width: Math.max(containerRect.width - 2 * paddingPixels, 0),
    height: Math.max(containerRect.height - 2 * paddingPixels, 0),
  };
}

export function hasSlides(slides: Slide[]): slides is [Slide, ...Slide[]] {
  return slides.length > 0;
}

export function getSlide(slides: [Slide, ...Slide[]], index: number) {
  return slides[calculateSoSoArrayIndex4Slides(index, slides.length)];
}

export function getSlideIfPresent(slides: Slide[], index: number) {
  return hasSlides(slides) ? getSlide(slides, index) : undefined;
}

export function getSlideKey(slide: Slide) {
  return isImageSlide(slide) ? slide.src : undefined;
}

// Re-export shared utilities
export {
  getDevicePixelRatio,
  calculateSoSoArrayIndex4Slides as getSlideIndex,
  hasWindow,
  type LengthOrPercentage,
  parseLengthPercentage,
  round,
};

export function devicePixelRatio() {
  return (hasWindow() ? window?.devicePixelRatio : undefined) || 1;
}

export function addToolbarButton(toolbar: ToolbarSettings, key: string, button: React.ReactNode) {
  if (!button) return toolbar;

  const { buttons, ...restToolbar } = toolbar;
  const index = buttons.findIndex((item) => item === key);
  const buttonWithKey = React.isValidElement(button)
    ? React.cloneElement(button, { key }, null)
    : button;

  if (index >= 0) {
    const result = [...buttons];
    result.splice(index, 1, buttonWithKey);
    return { buttons: result, ...restToolbar };
  }

  return { buttons: [buttonWithKey, ...buttons], ...restToolbar };
}

// TODO v4: remove
export function stopNavigationEventsPropagation() {
  const stopPropagation = (event: React.PointerEvent | React.KeyboardEvent | React.WheelEvent) => {
    event.stopPropagation();
  };

  return { onPointerDown: stopPropagation, onKeyDown: stopPropagation, onWheel: stopPropagation };
}

export function calculatePreload(carousel: CarouselSettings, slides: Slide[], minimum = 0) {
  return Math.min(
    carousel.preload,
    Math.max(carousel.finite ? slides.length - 1 : Math.floor(slides.length / 2), minimum)
  );
}

const isReact19 = Number(React.version.split('.')[0]) >= 19;

// this hack is necessary to support `inert` attribute breaking change in React 19 - https://github.com/facebook/react/pull/24730
export function makeInertWhen(condition: boolean) {
  const legacyValue = condition ? '' : undefined;
  return { inert: isReact19 ? condition : legacyValue } as { inert: boolean };
}
export const clsx = cn;
