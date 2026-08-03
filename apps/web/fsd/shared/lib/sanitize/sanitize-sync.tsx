import type { Config } from 'dompurify';

import { DOMPURIFY_CONFIG } from './const';

export type TransformSanitizeConfig = (config: typeof DOMPURIFY_CONFIG) => Config;

export const sanitizeSync = (text: string, transformConfig?: TransformSanitizeConfig) => {
  const { sanitize } = require('isomorphic-dompurify');
  const config = transformConfig?.(DOMPURIFY_CONFIG) ?? DOMPURIFY_CONFIG;

  return sanitize(text, config);
};
