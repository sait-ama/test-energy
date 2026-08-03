type Func = (...args: any) => void;

export const mergeFunc = (...funcs: Func[]) => {
  if (funcs.length === 1) return funcs[0];

  return (...args: unknown[]) => {
    for (const func of funcs) {
      func(...args);
    }
  };
};
