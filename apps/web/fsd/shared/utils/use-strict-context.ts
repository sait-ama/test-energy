import type { Context } from 'react';
import { useContext } from 'react';

export function useStrictContext<T>(context: Context<T | null>) {
  const value = useContext(context);

  if (value === null) throw new Error('Strict context not passed');

  return value as T;
}
