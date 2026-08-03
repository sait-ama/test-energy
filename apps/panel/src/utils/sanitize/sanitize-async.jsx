import deepmerge from 'deepmerge';

import { DOMPURIFY_CONFIG } from './const';

export const sanitizeAsync = async (text, overrideConfig) => {
  const { default: DOMPurify } = await import('isomorphic-dompurify');
  return DOMPurify.sanitize(text, deepmerge(DOMPURIFY_CONFIG, overrideConfig ?? {}));
};
