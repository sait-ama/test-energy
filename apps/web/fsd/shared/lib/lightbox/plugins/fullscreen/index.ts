import * as React from 'react';

import { PLUGIN_FULLSCREEN } from '../../consts';
import type { Callback, RenderFunction } from '../../types';
import { FullScreen } from './full-screen';

declare module '../../types' {
  interface LightboxProps {
    /** FullScreen plugin settings */
    fullscreen?: {
      /** FullScreen plugin ref */
      ref?: React.ForwardedRef<FullscreenRef>;
      /** if `true`, enter fullscreen mode automatically when the lightbox opens */
      auto?: boolean;
    };
  }

  // noinspection JSUnusedGlobalSymbols
  interface Render {
    /** render custom Enter/Exit FullScreen button */
    buttonFullscreen?: RenderFunction<FullscreenRef>;
    /** render custom Enter FullScreen icon */
    iconEnterFullscreen?: RenderFunction;
    /** render custom Exit FullScreen icon */
    iconExitFullscreen?: RenderFunction;
  }

  interface Labels {
    // TODO v4: change FullScreen to lowercase
    'Enter Fullscreen'?: string;
    'Exit Fullscreen'?: string;
  }

  // noinspection JSUnusedGlobalSymbols
  interface Callbacks {
    /** a callback called when the lightbox enters fullscreen mode */
    enterFullscreen?: Callback;
    /** a callback called when the lightbox exits fullscreen mode */
    exitFullscreen?: Callback;
  }

  // noinspection JSUnusedGlobalSymbols
  interface ToolbarButtonKeys {
    [PLUGIN_FULLSCREEN]: null;
  }

  /** FullScreen plugin ref */
  interface FullscreenRef {
    /** current fullscreen status */
    fullscreen: boolean;
    /** if `true`, fullscreen features are not available */
    disabled: boolean | undefined;
    /** enter fullscreen mode */
    enter: Callback;
    /** exit fullscreen mode */
    exit: Callback;
  }
}

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Document {
    webkitFullscreenEnabled?: boolean;
    mozFullScreenEnabled?: boolean;
    msFullscreenEnabled?: boolean;

    webkitExitFullscreen?: () => void;
    mozCancelFullScreen?: () => void;
    msExitFullscreen?: () => void;

    webkitFullscreenElement?: Element;
    mozFullScreenElement?: Element;
    msFullscreenElement?: Element;
  }

  // noinspection JSUnusedGlobalSymbols
  interface HTMLElement {
    webkitRequestFullscreen?: () => void;
    mozRequestFullScreen?: () => void;
    msRequestFullscreen?: () => void;
  }
}

export default FullScreen;
