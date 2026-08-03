import { sanitize } from 'isomorphic-dompurify';

import { DOMPURIFY_CONFIG } from './const';

export const sanitizeSync = (text) => {
    return sanitize(text, DOMPURIFY_CONFIG);
};
