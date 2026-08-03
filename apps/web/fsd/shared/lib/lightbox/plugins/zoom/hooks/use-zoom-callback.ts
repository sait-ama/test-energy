import * as React from 'react';

import { useEventCallback } from '~shared/hooks/use-event-callback';

import { useLightboxProps } from '../../../stores/lightbox-props';

export function useZoomCallback(zoom: number, disabled: boolean) {
  const { on } = useLightboxProps();

  const onZoomCallback = useEventCallback(() => {
    if (!disabled) {
      on.zoom?.({ zoom });
    }
  });

  React.useEffect(onZoomCallback, [zoom, onZoomCallback]);
}
