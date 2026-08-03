import * as React from 'react';

import ZoomIn from '@re/ui-kit/icons/zoom-in';
import ZoomOut from '@re/ui-kit/icons/zoom-out';

import { useLightboxProps } from '~shared/lib/lightbox/stores/lightbox-props';

import { IconButton } from '../../components';
import { useZoom } from './zoom-controller';

/** Zoom button props */
export type ZoomButtonProps = {
  zoomIn?: boolean;
  onLoseFocus: () => void;
};

/** Zoom button */
export const ZoomButton = React.forwardRef<HTMLButtonElement, ZoomButtonProps>(function ZoomButton(
  { zoomIn, onLoseFocus },
  ref
) {
  const wasEnabled = React.useRef(false);
  const wasFocused = React.useRef(false);

  const {
    zoom,
    maxZoom,
    zoomIn: zoomInCallback,
    zoomOut: zoomOutCallback,
    disabled: zoomDisabled,
  } = useZoom();
  const { render } = useLightboxProps();

  const disabled = zoomDisabled || (zoomIn ? zoom >= maxZoom : zoom <= 1);

  React.useEffect(() => {
    if (disabled && wasEnabled.current && wasFocused.current) {
      onLoseFocus();
    }
    if (!disabled) {
      wasEnabled.current = true;
    }
  }, [disabled, onLoseFocus]);

  return (
    <IconButton
      ref={ref}
      disabled={disabled}
      label={zoomIn ? 'Zoom in' : 'Zoom out'}
      icon={zoomIn ? ZoomIn : ZoomOut}
      renderIcon={zoomIn ? render.iconZoomIn : render.iconZoomOut}
      onClick={zoomIn ? zoomInCallback : zoomOutCallback}
      onFocus={() => {
        wasFocused.current = true;
      }}
      onBlur={() => {
        wasFocused.current = false;
      }}
    />
  );
});
