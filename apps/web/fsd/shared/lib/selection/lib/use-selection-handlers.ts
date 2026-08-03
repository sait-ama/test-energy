import { useEffect, useMemo, useRef } from 'react';

import type { UseSelectionContext } from '../_internal/root';
import { useSelection } from '../_internal/root';
//todo
type SelectionHandler = (options: { dataAttr: string; control: UseSelectionContext }) => any;

export enum SelectionHandlersFeatures {
  SelectMultipleDelegated,
  // SelectMultipleTouchDelegated,
}

const _handlers: Record<SelectionHandlersFeatures, SelectionHandler> = {
  [SelectionHandlersFeatures.SelectMultipleDelegated]: ({ dataAttr, control }) => {
    const { select, unselect } = control;

    let prevId: number | null = null;

    return {
      onPointerOver: (e) => {
        if (!e.shiftKey) return;

        const { target } = e;

        const item = target?.closest(`[data-${dataAttr}]`);

        if (!(item instanceof HTMLElement)) return;

        const id = Number(item.dataset[dataAttr]);

        if (e.shiftKey && (prevId == null || prevId !== id)) {
          select(id);
        }
        if (e.shiftKey && e.ctrlKey && (prevId == null || prevId !== id)) {
          unselect(id);
        }

        prevId = id;
      },
    };
  },
  // fifty/fifty
  // [SelectionHandlersFeatures.SelectMultipleTouchDelegated]: ({ dataAttr, control }) => {
  //     const { switchSelection } = control;

  //     let prevTouchedId: number | null = null;
  //     let prevCoords: { x: number; y: number } | null = null;

  //     // const onTouchMove = throttle((e) => {
  //     //     const [touch] = e.touches;

  //     //     const currCoords = { x: touch.clientX, y: touch.clientY };

  //     //     let isSelectionEnabled;

  //     //     if (prevCoords) {
  //     //         const diffX = prevCoords.x - currCoords.x;
  //     //         const diffY = prevCoords.y - currCoords.y;

  //     //         const angle = (Math.atan2(diffY, diffX) * 180) / Math.PI;

  //     //         // isSelectionEnabled = true;
  //     //         isSelectionEnabled = (angle > -30 && angle < 30) || angle > 150 || angle < -150;
  //     //     } else {
  //     //         isSelectionEnabled = true;
  //     //     }

  //     //     prevCoords = currCoords;

  //     //     if (!isSelectionEnabled) {
  //     //         return;
  //     //     } else {
  //     //         e.preventDefault()
  //     //     }

  //     //     const touchedElement = document.elementFromPoint(touch.clientX, touch.clientY);

  //     //     const item = touchedElement?.closest(`[data-${dataAttr}]`);

  //     //     if (!(item instanceof HTMLElement)) return;

  //     //     const id = Number(item.dataset[dataAttr]);

  //     //     if (prevTouchedId == null || prevTouchedId !== id) switchSelection(id);

  //     //     prevTouchedId = id;
  //     // }, 16);

  //     let touchStart: number | null = null;

  //     const onTouchMove = (e) => {
  //         const [touch] = e.touches;

  //         const now = Date.now();
  //         // const currCoords = { x: touch.clientX, y: touch.clientY };

  //         // let isSelectionEnabled = true;
  //         // let movedEnough = true;

  //         // if (prevCoords) {
  //         //     const diffX = prevCoords.x - currCoords.x;
  //         //     const diffY = prevCoords.y - currCoords.y;

  //         //     movedEnough = Math.abs(diffX) + Math.abs(diffY) > 50;

  //         //     if (movedEnough) {
  //         //         const angle = (Math.atan2(diffY, diffX) * 180) / Math.PI;

  //         //         isSelectionEnabled = (angle > -30 && angle < 30) || angle > 150 || angle < -150;
  //         //     } else {
  //         //         isSelectionEnabled = false;
  //         //     }
  //         // }

  //         // if (!prevCoords || movedEnough) {
  //         //     prevCoords = currCoords;
  //         // }

  //         // if (!isSelectionEnabled) {
  //         //     return;
  //         // } else {
  //         //     e.preventDefault();
  //         // }

  //         if (!touchStart || touchStart - now < 400) {
  //             return;
  //         }

  //         const touchedElement = document.elementFromPoint(touch.clientX, touch.clientY);

  //         const item = touchedElement?.closest(`[data-${dataAttr}]`);

  //         if (!(item instanceof HTMLElement)) return;

  //         const id = Number(item.dataset[dataAttr]);

  //         if (prevTouchedId == null || prevTouchedId !== id) switchSelection(id);

  //         prevTouchedId = id;
  //     };

  //     const onTouchStart = (e) => {
  //         touchStart = Date.now();
  //     };

  //     return {
  //         native: [
  //             ['touchmove', onTouchMove, { passive: false }],
  //             ['touchstart', onTouchStart],
  //         ],
  //     };
  // },
};

export interface UseSelecitonHandlersOptions {
  dataAttr: string;
  features: SelectionHandlersFeatures[];
  enabled?: boolean;
}

export const useSelecitonHandlers = (options: UseSelecitonHandlersOptions) => {
  const { dataAttr, features, enabled = true } = options;

  const control = useSelection();
  const configArr = useMemo(() => features.map((v) => _handlers[v]({ dataAttr, control })), []);

  const elemRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const elem = elemRef.current;

    if (!elem || !enabled) return;

    const handlerArgsArr: [eventName: string, handler: any, options: any][] = [];

    for (const config of configArr) {
      if (!('native' in config)) continue;

      for (const handlerArgs of config.native) {
        handlerArgsArr.push(handlerArgs);
        const [eventName, handler, options] = handlerArgs;

        elem.addEventListener(eventName, handler, options);
      }
    }

    return () => {
      for (const handlerArgs of handlerArgsArr) {
        const [eventName, handler] = handlerArgs;

        elem.removeEventListener(eventName, handler);
      }
    };
  }, [elemRef.current, enabled]);

  const combinedHandlers = enabled
    ? {
        // refactor later
        onPointerOver: (e) => {
          configArr.forEach((config) => config.onPointerOver?.(e));
        },
      }
    : {};

  return {
    ref: (elem) => (elemRef.current = elem),
    ...combinedHandlers,
  };
};
