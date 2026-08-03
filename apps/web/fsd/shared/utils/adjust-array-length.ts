function adjustArrayLength<T, R extends T[]>(
  array: T[],
  options: {
    columns: number;
    minRows?: number;
    fillFunc?: (index: number) => T;
  }
): R;
function adjustArrayLength<T, R extends T[]>(
  array: T[],
  options: {
    length: number;
    fillFunc?: (index: number) => T;
    cutOnOverflow?: boolean;
  }
): R;
function adjustArrayLength<T, R extends T[]>(
  array: T[],
  options: {
    length?: number;
    columns?: number;
    minRows?: number;
    fillFunc?: (index: number) => T;
    cutOnOverflow?: boolean;
  }
): R {
  const { columns, minRows, length, fillFunc, cutOnOverflow = true } = options;

  let newArr: T[];
  let toFill: number;

  if (columns) {
    newArr = [...array];
    toFill = Math.ceil(newArr.length / columns) * columns - newArr.length;

    if (minRows) {
      toFill = Math.max(toFill, minRows * columns - newArr.length);
    }
  } else {
    newArr = cutOnOverflow ? array.slice(0, length) : [...array];
    toFill = length! - newArr.length;
  }

  for (let i = 0; i < toFill; i++) {
    newArr.push(fillFunc?.(i) ?? (null as T));
  }

  return newArr as R;
}

export { adjustArrayLength };
