import * as React from 'react';

import { createModule } from '~shared/lib/lightbox/config';
import { PLUGIN_SLIDESHOW } from '~shared/lib/lightbox/consts';
import { PluginProps } from '~shared/lib/lightbox/types';
import { addToolbarButton } from '~shared/lib/lightbox/utils';

import { resolveSlideshowProps } from './props';
import { SlideshowButton } from './slideshow-button';
import { SlideshowContextProvider } from './slideshow-context';

/** SlideShow plugin */
export function SlideShow({ augment, addModule }: PluginProps) {
  augment(({ slideshow, toolbar, ...restProps }) => ({
    toolbar: addToolbarButton(toolbar, PLUGIN_SLIDESHOW, <SlideshowButton />),
    slideshow: resolveSlideshowProps(slideshow),
    ...restProps,
  }));

  addModule(createModule(PLUGIN_SLIDESHOW, SlideshowContextProvider));
}
