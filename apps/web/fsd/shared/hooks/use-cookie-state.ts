import { useState } from 'react';

import { CookieOptions, CookieService } from '~shared/utils/cookie-service';

type Serializer<T> = (object: T | undefined) => string;
type Parser<T> = (val: string) => T | undefined;

type Options<T> = Partial<{
  serializer: Serializer<T>;
  parser: Parser<T>;
  logger: (error: unknown) => void;
  syncData: boolean;
  encode: CookieOptions;
}>;

const defaultEncode: CookieOptions = {
  path: '/',
  expires: new Date('9999'),
  secure: true,
  maxAge: 31536000,
  domain: '',
  sameSite: 'lax',
  httpOnly: false,
};

type GetCookieValue<T> = {
  key: string;
  parser: (value: string) => T | undefined;
  defaultValue: T;
};

function getCookieValue<T>({ key, defaultValue, parser }: GetCookieValue<T>): string | T {
  const value = CookieService.get(key);

  if (typeof value === 'undefined') return defaultValue;

  return parser(value) ?? defaultValue;
}

type SetCookieValue<T> = {
  key: string;
  value: T;
  serializer: (value: T) => string;
  encode?: CookieOptions;
};

function setCookieValue<T>({ key, value, serializer, encode }: SetCookieValue<T>) {
  const stringified = typeof value === 'string' ? value : serializer(value);

  CookieService.set(key, stringified, Object.assign({}, defaultEncode, encode));
}

export function useCookieState<T = string>(
  key: string,
  initialValue: T,
  options?: Options<T>
): [T, (value: React.SetStateAction<T>) => void] {
  const getInitialValue = (): T => {
    const defaultValue = typeof initialValue === 'function' ? initialValue() : initialValue;

    if (typeof window === 'undefined') return defaultValue;

    const parser = options?.parser ?? JSON.parse;

    return getCookieValue({
      key,
      parser,
      defaultValue,
    }) as T;
  };

  const [value, setValue] = useState<T>(getInitialValue);

  const setNextValue = (newValue: React.SetStateAction<T>) => {
    const serializer = options?.serializer ?? JSON.stringify;

    if (typeof newValue === 'function') {
      setValue((prev) => {
        const nextValue = (newValue as (prev: T) => T)(prev);
        setCookieValue({ key, value: nextValue, serializer, encode: options?.encode });
        return nextValue;
      });
    } else {
      setCookieValue({ key, value: newValue, serializer, encode: options?.encode });
      setValue(newValue);
    }
  };

  return [value, setNextValue];
}
