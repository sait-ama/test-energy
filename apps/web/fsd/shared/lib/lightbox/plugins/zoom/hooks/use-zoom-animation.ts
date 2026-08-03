import * as React from 'react';

import { useEventCallback } from '~shared/hooks/use-event-callback';
import { useIsomorphicEffect } from '~shared/hooks/use-isomorphic-effect';
import { useMotionPreference } from '~shared/hooks/use-motion-preference';

import { useLightboxProps } from '../../../stores/lightbox-props';

export function useZoomAnimation(
  zoom: number,
  offsetX: number,
  offsetY: number,
  zoomWrapperRef?: React.RefObject<HTMLDivElement | null>
) {
  const zoomAnimation = React.useRef<Animation>(undefined);
  const zoomAnimationStart = React.useRef<CSSStyleDeclaration['transform']>(undefined);

  const { zoom: zoomAnimationDuration } = useLightboxProps().animation;
  const reduceMotion = useMotionPreference();

  const playZoomAnimation = useEventCallback(() => {
    zoomAnimation.current?.cancel();
    zoomAnimation.current = undefined;

    if (zoomAnimationStart.current && zoomWrapperRef?.current) {
      try {
        zoomAnimation.current = zoomWrapperRef.current.animate?.(
          [
            { transform: zoomAnimationStart.current },
            { transform: `scale(${zoom}) translateX(${offsetX}px) translateY(${offsetY}px)` },
          ],
          {
            duration: !reduceMotion ? (zoomAnimationDuration ?? 500) : 0,
            easing: zoomAnimation.current ? 'ease-out' : 'ease-in-out',
          }
        );
      } catch (err) {
        console.error(err);
      }

      zoomAnimationStart.current = undefined;

      if (zoomAnimation.current) {
        zoomAnimation.current.onfinish = () => {
          zoomAnimation.current = undefined;
        };
      }
    }
  });

  useIsomorphicEffect(playZoomAnimation, [zoom, offsetX, offsetY, playZoomAnimation]);

  return React.useCallback(() => {
    zoomAnimationStart.current = zoomWrapperRef?.current
      ? window.getComputedStyle(zoomWrapperRef.current).transform
      : undefined;
  }, [zoomWrapperRef]);
}
