import { LightboxProps } from '~shared/lib/lightbox/types';

export const defaultSlideshowProps = {
  autoplay: false,
  delay: 3000,
  ref: null,
};

export const resolveSlideshowProps = (slideshow: LightboxProps['slideshow']) => ({
  ...defaultSlideshowProps,
  ...slideshow,
});
