import {
  ACTION_CLOSE,
  MODULE_NO_SCROLL,
  MODULE_PORTAL,
  PLUGIN_INLINE,
} from '~shared/lib/lightbox/consts';
import { PluginProps } from '~shared/lib/lightbox/types';

import { createModule } from '../../config';
import { InlineContainer } from './inline-container';

/** Inline plugin */
export function Inline({ augment, replace, remove }: PluginProps) {
  augment(
    ({
      toolbar: { buttons, ...restToolbar },
      open,
      close,
      controller: { focus, aria, touchAction, ...restController },
      className,
      ...restProps
    }) => ({
      open: true,
      /* c8 ignore next */
      close: () => {},
      toolbar: {
        buttons: buttons.filter((button) => button !== ACTION_CLOSE),
        ...restToolbar,
      },
      inline: { style: { width: '100%', height: '100%' }, className },
      // TODO v4: implement `touch-action` similar to `overscroll-behavior`
      controller: { focus: false, aria: true, touchAction: 'pan-y', ...restController },
      className,
      ...restProps,
    })
  );

  remove(MODULE_NO_SCROLL);
  replace(MODULE_PORTAL, createModule(PLUGIN_INLINE, InlineContainer));
}
