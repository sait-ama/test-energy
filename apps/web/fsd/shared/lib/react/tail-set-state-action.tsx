import { Dispatch, SetStateAction } from 'react';

export const tailSetStateAction =
  <T,>(
    setStateAction: Dispatch<SetStateAction<T>>,
    tailFunc: (value: T) => void
  ): Dispatch<SetStateAction<T>> =>
  (stateValueOrFunc) => {
    if (typeof stateValueOrFunc !== 'function') {
      const stateValue = stateValueOrFunc as T;

      tailFunc(stateValue);
      return;
    }

    const stateFunc = stateValueOrFunc as (v: T) => T;

    setStateAction((prev) => {
      const stateValue = stateFunc(prev);

      tailFunc(stateValue);

      return stateValue;
    });
  };
