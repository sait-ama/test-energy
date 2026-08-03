export type Optional<T> = {
  [K in keyof T]?: T[K] | undefined;
};
export type OptionalResponse<T> = {
  [K in keyof T]?: T[K];
};
export const removeUnusedQueryParams = <T,>(
  query: Optional<T>,
  deep = 1,
  nullable = true
): OptionalResponse<T> => {
  const cleanObject = (obj: Optional<T>, currentDepth: number): OptionalResponse<T> => {
    if (currentDepth > deep) return obj;

    return Object.fromEntries(
      Object.entries(obj)
        .map(([key, value]) => {
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            return [key, cleanObject(value, currentDepth + 1)];
          }
          return [key, value];
        })
        .filter(([_, v]) => (nullable ? v !== undefined : v !== undefined && v !== null))
    );
  };

  return cleanObject(query, 1) as OptionalResponse<T>;
};
