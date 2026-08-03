import * as React from 'react';

import { PLUGIN_SLIDESHOW } from '~shared/lib/lightbox/consts';
import { Callback, RenderFunction } from '~shared/lib/lightbox/types';

import { SlideShow } from './slide-show';

declare module '../../../types' {
  interface LightboxProps {
    /** SlideShow plugin settings */
    slideshow?: {
      /** SlideShow plugin ref */
      ref?: React.ForwardedRef<SlideshowRef>;
      /** if `true`, slideshow is turned on automatically when the lightbox opens */
      autoplay?: boolean;
      /** slideshow delay in milliseconds */
      delay?: number;
    };
  }

  interface Render {
    /** render custom SlideShow Play icon */
    iconSlideshowPlay?: RenderFunction;
    /** render custom SlideShow Pause icon */
    iconSlideshowPause?: RenderFunction;
    /** render custom SlideShow button */
    buttonSlideshow?: RenderFunction<SlideshowRef>;
  }

  interface Labels {
    Play?: string;
    Pause?: string;
  }

  // noinspection JSUnusedGlobalSymbols
  interface Callbacks {
    /** a callback called on slideshow playback start */
    slideshowStart?: Callback;
    /** a callback called on slideshow playback stop */
    slideshowStop?: Callback;
  }

  // noinspection JSUnusedGlobalSymbols
  interface ToolbarButtonKeys {
    [PLUGIN_SLIDESHOW]: null;
  }

  /** SlideShow plugin ref */
  interface SlideshowRef {
    /** current slideshow playback status */
    playing: boolean;
    /** if `true`, the slideshow playback is disabled */
    disabled: boolean;
    /** start the slideshow playback */
    play: Callback;
    /** pause the slideshow playback */
    pause: Callback;
  }
}

export default SlideShow;
