export const objectOptional = <Value>(cond: boolean, value: Value) =>
  cond ? value : ({} as const);
