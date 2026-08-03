import { createModule } from '../../config';
import { MODULE_CONTROLLER, PLUGIN_FULLSCREEN, PLUGIN_THUMBNAILS } from '../../consts';
import type { PluginProps } from '../../types';
import { addToolbarButton } from '../../utils';
import { resolveThumbnailsProps } from './props';
import { ThumbnailsButton } from './thumbnails-button';
import { ThumbnailsContextProvider } from './thumbnails-context';

/** Thumbnails plugin */
export function Thumbnails({ augment, contains, append, addParent }: PluginProps) {
  augment(({ thumbnails: thumbnailsProps, toolbar, ...restProps }) => {
    const thumbnails = resolveThumbnailsProps(thumbnailsProps);
    return {
      toolbar: addToolbarButton(
        toolbar,
        PLUGIN_THUMBNAILS,
        thumbnails.showToggle ? <ThumbnailsButton /> : null
      ),
      thumbnails,
      ...restProps,
    };
  });

  const module = createModule(PLUGIN_THUMBNAILS, ThumbnailsContextProvider);
  if (contains(PLUGIN_FULLSCREEN)) {
    append(PLUGIN_FULLSCREEN, module);
  } else {
    addParent(MODULE_CONTROLLER, module);
  }
}
