export const isFieldChanged = (value: Record<string, unknown> | undefined): boolean => {
  if (!value) return false;
  return Object.values(value).some((it) => {
    if (typeof it !== 'boolean') return isFieldChanged(it);
    return it;
  });
};
