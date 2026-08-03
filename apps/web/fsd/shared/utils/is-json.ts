export const isJson = (str: unknown): str is string => {
  if (typeof str !== 'string') {
    return false;
  }

  try {
    JSON.parse(str);
  } catch {
    return false;
  }

  return true;
};
