// reusable type guard
export const is = <T>(_value: unknown, exact: boolean): _value is T => exact;
export type ExcludeType<T, G> = T extends G ? never : T;
