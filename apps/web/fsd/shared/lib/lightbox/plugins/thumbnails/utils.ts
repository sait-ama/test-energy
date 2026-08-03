import { PLUGIN_THUMBNAILS } from '../../consts';
import { composePrefix } from '../../utils';

export const cssPrefix = (value?: string) => composePrefix(PLUGIN_THUMBNAILS, value);

export const cssThumbnailPrefix = (value?: string) => cssPrefix(composePrefix('thumbnail', value));
