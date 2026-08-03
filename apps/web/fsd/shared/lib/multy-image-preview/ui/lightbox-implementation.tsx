import { cn } from '@re/ui-kit/utils/cn';

import { Lightbox } from '~shared/lib/lightbox/lightbox';
import { Thumbnails } from '~shared/lib/lightbox/plugins/thumbnails/thumbnails';
import { Zoom } from '~shared/lib/lightbox/plugins/zoom/zoom';
import type { LightboxExternalProps } from '~shared/lib/lightbox/types';

import {
  doubleClickDelay,
  doubleClickMaxStops,
  doubleTapDelay,
  keyboardMoveDistance,
  maxZoomPixelRatio,
  pinchZoomDistanceFactor,
  scrollToZoom,
  wheelZoomDistanceFactor,
  zoomInMultiplier,
} from '../model/consts';

export const LightboxImplementation = ({
  slides,
  zoom,
  className,
  controller,
  ...props
}: LightboxExternalProps) => {
  const filteredPlugins = [(slides?.length ?? 0) > 1 ? Thumbnails : null, Zoom].filter(Boolean);
  return (
    <Lightbox
      styles={{
        icon: {
          '--yarl__icon_size': '24px',
        },
        container: {
          '--yarl__container_padding': '0px',
        },
        slide: {
          '--yarl__carousel_spacing_percent': 0,
        },
        thumbnail: {
          '--yarl__thumbnails_thumbnail_active_border_color': 'hsl(var(--r-primary))',
          '--yarl__thumbnails_thumbnail_border_color': 'rgba(255,255,255,0.24)',
        },
        toolbar: {
          gap: '1rem',
        },
        root: {
          '--yarl__color_backdrop': 'rgba(0,0,0,0)',
        },
      }}
      carousel={{ finite: (slides?.length ?? 0) <= 2, spacing: 0 }}
      render={{
        buttonPrev: (slides?.length ?? 0) <= 1 ? () => null : undefined,
        buttonNext: (slides?.length ?? 0) <= 1 ? () => null : undefined,
      }}
      className={cn('bg-black/80', className)}
      /*@ts-ignore*/
      plugins={filteredPlugins}
      slides={slides}
      {...props}
      noScroll={{ disabled: false }}
      controller={{
        closeOnBackdropClick: true,
        closeOnPullDown: true,
        closeOnPullUp: true,
        ...controller,
      }}
      animation={{ zoom: 300 }}
      zoom={{
        scrollToZoom,
        wheelZoomDistanceFactor,
        pinchZoomDistanceFactor,
        keyboardMoveDistance,
        maxZoomPixelRatio,
        zoomInMultiplier,
        doubleTapDelay,
        doubleClickDelay,
        doubleClickMaxStops,
        ...zoom,
      }}
    />
  );
};
