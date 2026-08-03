import { PLUGIN_SHARE } from '../../consts';
import type { Callback, RenderFunction } from '../../types';
import { Share } from './share';

export { isShareSupported } from './utils';

declare module '../../types' {
  interface GenericSlide {
    /** share url or share props */
    share?:
      | boolean
      | string
      | {
          /** share url  */
          url?: string;
          /** share text  */
          text?: string;
          /** share title  */
          title?: string;
        };
  }

  interface LightboxProps {
    /** Share plugin settings */
    share?: {
      /** custom share function */
      share?: ({ slide }: ShareFunctionProps) => void;
    };
  }

  interface Render {
    /** render custom Share button */
    buttonShare?: RenderFunction;
    /** render custom Share icon */
    iconShare?: RenderFunction;
  }

  interface Labels {
    Share?: string;
  }

  // noinspection JSUnusedGlobalSymbols
  interface Callbacks {
    /** a callback called on slide share */
    share?: Callback<ShareCallbackProps>;
  }

  // noinspection JSUnusedGlobalSymbols
  interface ToolbarButtonKeys {
    [PLUGIN_SHARE]: null;
  }

  interface ShareCallbackProps {
    index: number;
  }

  interface ShareFunctionProps {
    slide: Slide;
  }
}

export default Share;
