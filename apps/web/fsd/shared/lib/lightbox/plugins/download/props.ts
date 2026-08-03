import type { LightboxProps } from '../../types';

export const defaultDownloadProps = {
  download: undefined,
};

export const resolveDownloadProps = (download: LightboxProps['download']) => ({
  ...defaultDownloadProps,
  ...download,
});
