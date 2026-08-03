import { useCallback } from 'react';

import { BOOKMARK_ORDERING, BOOKMARK_ORDERING_DEFAULT } from '~entities/bookmarks/model/const';
import { useCookie } from '~shared/hooks/use-cookie';
import { useQueryState } from '~shared/hooks/use-query-state-v2';

export const useBookmarkOrderingQueryState = (queryStateKey: string) => {
  const [bookmarkCookie, setBookmarkCookie] = useCookie(queryStateKey);
  const [bookmarkQuery, _setBookmarkQuery] = useQueryState<string, string>({
    key: 'ordering',
    variants: Object.values(BOOKMARK_ORDERING),
    defaultValue: bookmarkCookie || BOOKMARK_ORDERING_DEFAULT,
  });

  const setBookmarkQuery = useCallback(
    (valueOrFunction: Parameters<typeof _setBookmarkQuery>[0]) => {
      _setBookmarkQuery((prev) => {
        const value =
          typeof valueOrFunction === 'function' ? valueOrFunction(prev) : valueOrFunction;
        setBookmarkCookie(value);

        return value!;
      });
    },
    [_setBookmarkQuery, setBookmarkCookie]
  );

  return [bookmarkQuery!, setBookmarkQuery] as const;
};
