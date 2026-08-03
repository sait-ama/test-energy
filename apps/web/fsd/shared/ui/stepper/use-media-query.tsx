import * as React from 'react';

export function useMediaQuery<T extends true | false | undefined = boolean>(
  query: string,
  options?: { defaultValue?: T }
) {
  const [value, setValue] = React.useState(!options ? false : options?.defaultValue);

  React.useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    const result = matchMedia(query);
    result.addEventListener('change', onChange);
    setValue(result.matches);

    return () => {
      result.removeEventListener('change', onChange);
    };
  }, [query]);

  return value;
}
