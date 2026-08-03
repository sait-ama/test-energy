export const isAbortError = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) return false;

  return (
    ('name' in error && error.name === 'AbortError') ||
    ('code' in error && error.code === 'ABORT_ERR')
  );
};

export const createAbortError = (message = 'Aborted') => {
  return new DOMException(message, 'AbortError');
};
