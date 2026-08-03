import { useLightboxProps } from '../../../stores/lightbox-props';
import { resolveZoomProps } from '../props';

export function useZoomProps() {
  const { zoom } = useLightboxProps();
  return resolveZoomProps(zoom);
}
