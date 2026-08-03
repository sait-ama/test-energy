import * as React from 'react';

import { useLightboxProps } from '~shared/lib/lightbox/stores/lightbox-props';

import ZoomButtonsGroup from './zoom-buttons-group';
import { useZoom } from './zoom-controller';

export function ZoomToolbarControl() {
  const { render } = useLightboxProps();
  const zoomRef = useZoom();

  if (render.buttonZoom) {
    return <>{render.buttonZoom(zoomRef)}</>;
  }

  return <ZoomButtonsGroup />;
}
