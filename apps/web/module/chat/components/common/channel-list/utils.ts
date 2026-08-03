export function reorder<T>(
  list: T[],
  startIndex: number,
  endIndex: number,
  dataToUpdate?: Partial<T>
) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, dataToUpdate ? ({ ...removed, ...dataToUpdate } as T) : removed!);

  return result;
}

export function findItemIndexById<T extends { id: number }>(list: T[], id: number) {
  return list.findIndex((v) => v.id === id);
}

export const updateItemByIndex = <T extends { id: number }>(
  list: T[],
  index: number,
  dataToUpdate: Partial<T>
) => {
  const result = Array.from(list);
  result[index] = { ...result[index], ...dataToUpdate } as T;
  return result;
};
