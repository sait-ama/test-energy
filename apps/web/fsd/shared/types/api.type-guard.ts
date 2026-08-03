import type { ApiError } from '~shared/lib/error-handling/errors';

export const isApiError = (apiError: unknown): apiError is ApiError => {
  if (!apiError) return false;
  if (typeof apiError !== 'object') return false;
  if (!('data' in apiError)) return false;
  if (!apiError.data || typeof apiError.data !== 'object') return false;

  return 'detail' in apiError.data;
};

export const isBackendValidationError = (error: unknown): error is BackendValidationError => {
  if (!error) return false;
  if (typeof error !== 'object') return false;

  return 'detail' in error;
};
