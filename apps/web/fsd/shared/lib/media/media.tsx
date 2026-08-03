'use client';
import { createMedia } from '@artsy/fresnel';

import { breakpoints } from './const';

const { MediaContextProvider, Media, createMediaStyle } = createMedia({
  breakpoints,
});

const mediaStyles = createMediaStyle();

export { Media, MediaContextProvider, mediaStyles };
