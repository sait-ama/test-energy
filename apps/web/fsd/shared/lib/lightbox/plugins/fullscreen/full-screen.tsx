import { createModule } from '../../config';
import { MODULE_CONTROLLER, PLUGIN_FULLSCREEN, PLUGIN_THUMBNAILS } from '../../consts';
import type { PluginProps } from '../../types';
import { addToolbarButton } from '../../utils';
import { FullscreenButton } from './fullscreen-button';
import { FullscreenContextProvider } from './fullscreen-context';
import { resolveFullscreenProps } from './props';

/** FullScreen plugin */
export function FullScreen({ augment, contains, addParent }: PluginProps) {
  augment(({ fullscreen, toolbar, ...restProps }) => ({
    toolbar: addToolbarButton(toolbar, PLUGIN_FULLSCREEN, <FullscreenButton />),
    fullscreen: resolveFullscreenProps(fullscreen),
    ...restProps,
  }));

  addParent(
    contains(PLUGIN_THUMBNAILS) ? PLUGIN_THUMBNAILS : MODULE_CONTROLLER,
    createModule(PLUGIN_FULLSCREEN, FullscreenContextProvider)
  );
}
