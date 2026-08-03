import type { LightboxProps } from '../../types';

export const defaultShareProps = {
  share: undefined,
};

export const resolveShareProps = (share: LightboxProps['share']) => ({
  ...defaultShareProps,
  ...share,
});
