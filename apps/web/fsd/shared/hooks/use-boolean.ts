import { useCallback, useState } from 'react';

/**
 * A hook for managing a boolean value.
 *
 * @param {boolean} [defaultValue=false] - The initial value of the boolean.
 *
 * @returns {[boolean, function, function]} - A tuple containing the current value, a function to toggle the value, and a function to set the value.
 */
export function useBoolean(defaultValue?: boolean) {
  const [value, setValue] = useState(!!defaultValue);

  const toggle = useCallback(() => {
    setValue((x) => !x);
  }, []);

  return [value, toggle, setValue] as const;
}
