import * as React from 'react';

import {
  EVENT_ON_POINTER_CANCEL,
  EVENT_ON_POINTER_DOWN,
  EVENT_ON_POINTER_LEAVE,
  EVENT_ON_POINTER_MOVE,
  EVENT_ON_POINTER_UP,
} from '../consts';
import { cleanup } from '../utils';
import { UseSensors } from './use-sensors';

export function usePointerEvents<T extends Element = Element>(
  subscribeSensors: UseSensors<T>['subscribeSensors'],
  onPointerDown: (event: React.PointerEvent) => void,
  onPointerMove: (event: React.PointerEvent) => void,
  onPointerUp: (event: React.PointerEvent) => void,
  disabled?: boolean
) {
  React.useEffect(
    () =>
      !disabled
        ? cleanup(
            subscribeSensors(EVENT_ON_POINTER_DOWN, onPointerDown),
            subscribeSensors(EVENT_ON_POINTER_MOVE, onPointerMove),
            subscribeSensors(EVENT_ON_POINTER_UP, onPointerUp),
            subscribeSensors(EVENT_ON_POINTER_LEAVE, onPointerUp),
            subscribeSensors(EVENT_ON_POINTER_CANCEL, onPointerUp)
          )
        : () => {},
    [subscribeSensors, onPointerDown, onPointerMove, onPointerUp, disabled]
  );
}
