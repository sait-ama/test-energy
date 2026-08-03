import * as React from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { ImageSlide } from '../components';
import { createModule } from '../config';
import { CLASS_SLIDE_WRAPPER, MODULE_CAROUSEL } from '../consts';
import { useDocumentContext } from '../stores/document-store';
import { useLightboxProps } from '../stores/lightbox-props';
import { useLightboxState } from '../stores/lightbox-state';
import { LightBoxComponentProps, Slide } from '../types';
import {
  calculatePreload,
  composePrefix,
  cssClass,
  cssVar,
  getSlide,
  getSlideKey,
  hasSlides,
  isImageSlide,
  makeInertWhen,
  parseLengthPercentage,
} from '../utils';
import { useController } from './controller/store';

import classes from '../classes.module.scss';

function cssPrefix(value?: string) {
  return composePrefix(MODULE_CAROUSEL, value);
}

function cssSlidePrefix(value?: string) {
  return composePrefix('slide', value);
}

type CarouselSlideProps = {
  slide: Slide;
  offset: number;
};

function CarouselSlide({ slide, offset }: CarouselSlideProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { currentIndex } = useLightboxState();
  const { slideRect, close, focus } = useController();
  const {
    render,
    carousel: { imageFit, imageProps },
    on: { click: onClick },
    controller: { closeOnBackdropClick },
    styles: { slide: style },
  } = useLightboxProps();
  const { getOwnerDocument } = useDocumentContext();

  const offscreen = offset !== 0;

  React.useEffect(() => {
    if (offscreen && containerRef.current?.contains(getOwnerDocument().activeElement)) {
      focus();
    }
  }, [offscreen, focus, getOwnerDocument]);

  const renderSlide = () => {
    let rendered = render.slide?.({ slide, offset, rect: slideRect });

    if (!rendered && isImageSlide(slide)) {
      rendered = (
        <ImageSlide
          slide={slide}
          offset={offset}
          render={render}
          rect={slideRect}
          imageFit={imageFit}
          imageProps={imageProps}
          onClick={!offscreen ? () => onClick?.({ index: currentIndex }) : undefined}
        />
      );
    }

    return rendered ? (
      <>
        {render.slideHeader?.({ slide })}
        {(render.slideContainer ?? (({ children }) => children))({ slide, children: rendered })}
        {render.slideFooter?.({ slide })}
      </>
    ) : null;
  };

  const handleBackdropClick: React.MouseEventHandler = (event) => {
    const container = containerRef.current;
    const target = event.target instanceof HTMLElement ? event.target : undefined;
    if (
      closeOnBackdropClick &&
      target &&
      container &&
      (target === container ||
        // detect Zoom and Video wrappers
        (Array.from(container.children).find((x) => x === target) &&
          target.classList.contains(cssClass(CLASS_SLIDE_WRAPPER))))
    ) {
      close();
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={containerRef}
      className={cn(
        classes.slide,
        cssClass(cssSlidePrefix()),
        // marker?
        !offscreen && cssClass(cssSlidePrefix('current')),
        'flex content-center items-center justify-center'
      )}
      {...makeInertWhen(offscreen)}
      onClick={handleBackdropClick}
      style={style}
      role="region"
      aria-roledescription="slide"
    >
      {renderSlide()}
    </div>
  );
}

function Placeholder() {
  const style = useLightboxProps().styles.slide;
  return <div className={classes.slide} style={style} />;
}

export function Carousel({ carousel }: LightBoxComponentProps) {
  const { slides, currentIndex, globalIndex } = useLightboxState();
  const { setCarouselRef } = useController();

  const spacingValue = parseLengthPercentage(carousel.spacing);
  const paddingValue = parseLengthPercentage(carousel.padding);

  const preload = calculatePreload(carousel, slides, 1);
  const items: ({ key: React.Key } & (
    | { slide: Slide; offset: number }
    | { slide?: never; offset?: never }
  ))[] = [];

  if (hasSlides(slides)) {
    for (let index = currentIndex - preload; index <= currentIndex + preload; index += 1) {
      const slide = getSlide(slides, index)!;
      const key = globalIndex - currentIndex + index;
      const placeholder = carousel.finite && (index < 0 || index > slides.length - 1);

      items.push(
        !placeholder
          ? {
              key: [`${key}`, getSlideKey(slide)].filter(Boolean).join('|'),
              offset: index - currentIndex,
              slide,
            }
          : { key }
      );
    }
  }

  return (
    <div
      ref={setCarouselRef}
      className={cn(
        classes.carousel,
        cssClass(cssPrefix()),
        items.length > 0 && classes.withSlides
      )}
      style={{
        [`${cssVar(cssPrefix('slides_count'))}`]: items.length,
        [`${cssVar(cssPrefix('spacing_px'))}`]: spacingValue.pixel || 0,
        [`${cssVar(cssPrefix('spacing_percent'))}`]: spacingValue.percent || 0,
        [`${cssVar(cssPrefix('padding_px'))}`]: paddingValue.pixel || 0,
        [`${cssVar(cssPrefix('padding_percent'))}`]: paddingValue.percent || 0,
      }}
    >
      {items.map(({ key, slide, offset }) =>
        slide ? (
          <CarouselSlide key={key} slide={slide} offset={offset} />
        ) : (
          <Placeholder key={key} />
        )
      )}
    </div>
  );
}

export const CarouselModule = createModule(MODULE_CAROUSEL, Carousel);
