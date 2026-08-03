// reusable type guard
export const valueIs = <T>(_value: unknown, exact: boolean): _value is T => exact;
