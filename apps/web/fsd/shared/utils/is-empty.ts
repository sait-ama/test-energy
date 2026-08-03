import { logger } from '~shared/lib/logger';

export const isEmpty = (value: object | string | number | undefined | null): boolean => {
  if (typeof value === 'object') {
    if (!value) return true;

    if (Array.isArray(value)) {
      return !value.length;
    }

    return Object.keys(value).length === 0;
  }

  if (typeof value === 'string') {
    return !value;
  }

  if (typeof value === 'number') {
    return false; // Numbers (including 0) are not considered empty
  }

  if (typeof value === 'undefined') {
    return true;
  }

  if (process.env.NODE_ENV === 'development') {
    logger.error(`Can not use 'isEmpty' on non-object values. Used with ${JSON.stringify(value)}`, {
      scope: ['local'],
    });
  }

  return true;
};
