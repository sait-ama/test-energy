import * as React from 'react';

import { PLUGIN_ZOOM } from '~shared/lib/lightbox/consts';
import type { Callback, RenderFunction } from '~shared/lib/lightbox/types';

import { Zoom } from './zoom';

declare module '../../types' {
  interface LightboxProps {
    /** Zoom plugin settings */
    zoom?: {
      /** Zoom plugin ref */
      ref?: React.ForwardedRef<ZoomRef>;
      /** ratio of image pixels to physical pixels at maximum zoom level */
      maxZoomPixelRatio?: number;
      /** zoom-in multiplier */
      zoomInMultiplier?: number;
      /** @deprecated - double-tap maximum time delay */
      doubleTapDelay?: number;
      /** @deprecated - double-click maximum time delay */
      doubleClickDelay?: number;
      /** maximum number of zoom-in stops via double-click or double-tap */
      doubleClickMaxStops?: number;
      /** keyboard move distance */
      keyboardMoveDistance?: number;
      /** wheel zoom distance factor */
      wheelZoomDistanceFactor?: number;
      /** pinch zoom distance factor */
      pinchZoomDistanceFactor?: number;
      /** if `true`, enables image zoom via scroll gestures for mouse and trackpad users */
      scrollToZoom?: boolean;
    };
  }

  // noinspection JSUnusedGlobalSymbols
  interface AnimationSettings {
    /** zoom animation duration */
    zoom?: number;
  }

  interface Render {
    /** render custom Zoom control in the toolbar */
    buttonZoom?: RenderFunction<ZoomRef>;
    /** render custom Zoom In icon */
    iconZoomIn?: RenderFunction;
    /** render custom Zoom Out icon */
    iconZoomOut?: RenderFunction;
  }

  interface Labels {
    'Zoom in'?: string;
    'Zoom out'?: string;
  }

  // noinspection JSUnusedGlobalSymbols
  interface RenderSlideProps {
    /** current zoom level */
    zoom?: number;
    /** maximum zoom level */
    maxZoom?: number;
  }

  // noinspection JSUnusedGlobalSymbols
  interface Callbacks {
    /** zoom callback */
    zoom?: Callback<ZoomCallbackProps>;
  }

  /** Zoom callback props */
  interface ZoomCallbackProps {
    /** current zoom level */
    zoom: number;
  }

  // noinspection JSUnusedGlobalSymbols
  interface ToolbarButtonKeys {
    [PLUGIN_ZOOM]: null;
  }

  /** Zoom plugin ref */
  interface ZoomRef {
    /** current zoom level */
    zoom: number;
    /** maximum zoom level */
    maxZoom: number;
    /** horizontal offset */
    offsetX: number;
    /** vertical offset */
    offsetY: number;
    /** if `true`, zoom is unavailable for the current slide */
    disabled: boolean;
    /** increase zoom level using `zoomInMultiplier` */
    zoomIn: Callback;
    /** decrease zoom level using `zoomInMultiplier` */
    zoomOut: Callback;
    /** change zoom level */
    changeZoom: (targetZoom: number, rapid?: boolean, dx?: number, dy?: number) => void;
  }
}

export default Zoom;
