import type { LightboxProps } from '../../types';

export const defaultZoomProps = {
  maxZoomPixelRatio: 1,
  zoomInMultiplier: 1.5,
  doubleTapDelay: 300,
  doubleClickDelay: 500,
  doubleClickMaxStops: 2,
  keyboardMoveDistance: 50,
  wheelZoomDistanceFactor: 100,
  pinchZoomDistanceFactor: 100,
  scrollToZoom: false,
};

export const resolveZoomProps = (zoom: LightboxProps['zoom']) => ({
  ...defaultZoomProps,
  ...zoom,
});
