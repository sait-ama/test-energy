import type { LightboxProps } from '../../types';

export const defaultFullscreenProps = {
  auto: false,
  ref: null,
};

export const resolveFullscreenProps = (fullscreen: LightboxProps['fullscreen']) => ({
  ...defaultFullscreenProps,
  ...fullscreen,
});
