import * as React from 'react';

import { useEventCallback } from '~shared/hooks/use-event-callback';

import { ControllerSettings } from '../../types';

/**
 * Prevent default effects of the wheel stores:
 * - prevent browser back/forward navigation on touchpad left/right swipe (especially noticeable in Safari)
 * - prevent vertical scroll in inline mode when `scrollToZoom` option is enabled
 * - prevent page zoom when Zoom plugin is enabled
 */
export function usePreventWheelDefaults<T extends HTMLElement = HTMLElement>({
  preventDefaultWheelX,
  preventDefaultWheelY,
}: Pick<ControllerSettings, 'preventDefaultWheelX' | 'preventDefaultWheelY'>): (
  node: T | null
) => void {
  const ref = React.useRef<T | null>(null);

  const listener = useEventCallback((event: WheelEvent) => {
    const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
    if (
      (horizontal && preventDefaultWheelX) ||
      (!horizontal && preventDefaultWheelY) ||
      event.ctrlKey
    ) {
      event.preventDefault();
    }
  });

  return React.useCallback(
    (node: T | null) => {
      if (node) {
        // this has to be done via non-passive native event handler
        node.addEventListener('wheel', listener, { passive: false });
      } else {
        ref.current?.removeEventListener('wheel', listener);
      }

      ref.current = node;
    },
    [listener]
  );
}
