import { useLightboxProps } from '../../stores/lightbox-props';
import type { LightboxProps } from '../../types';

export const defaultVideoProps = {
  controls: true,
  playsInline: true,
};

export const resolveVideoProps = (video: LightboxProps['video']) => ({
  ...defaultVideoProps,
  ...video,
});

export function useVideoProps() {
  const { video } = useLightboxProps();
  return resolveVideoProps(video);
}
