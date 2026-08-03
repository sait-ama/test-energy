export const getDevicePixelRatio = () =>
  (typeof window !== 'undefined' ? window?.devicePixelRatio : undefined) || 1;

export const hasWindow = () => typeof window !== 'undefined';
