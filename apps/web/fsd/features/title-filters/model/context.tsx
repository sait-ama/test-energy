'use client';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { createContext } from '@re/core/utils/create-context';

import { useUserBookmarksTypes } from '~entities/user/model/queries';
import type { FilterKey } from '~features/title-filters/model/const';
import type { Type } from '~shared/api/models/forms';
import { FormsTypes } from '~shared/api/models/forms';
import { useSession } from '~shared/lib/session/use-session';
import { getTypesBaseKey } from '~shared/lib/use-types-base';

export const { Provider: CatalogOptionsProvider, useStore: useCatalogOptions } = createContext<
  Record<FilterKey, Type[]>,
  {}
>(() => {
  const session = useSession();

  const { data: list } = useQuery(
    getTypesBaseKey({
      get: ['status', 'categories', 'genres', 'types', 'age_limit', 'translate_status'],
      type: FormsTypes.TITLES,
    })
  );

  const { data: bookmarks } = useUserBookmarksTypes(
    { variables: { params: { userId: session?.id! } } },
    { enabled: !!session?.id }
  );

  return {
    types: list!.content.types,
    categories: list!.content.categories,
    genres: list!.content.genres,
    age_limit: list!.content.age_limit,
    status: list!.content.status,
    translate_status: list!.content.translate_status,
    last_chapter_uploaded: [
      { id: '1-', name: 'Сегодня' },
      { id: '7-', name: 'Эта неделя' },
      {
        id: '31-',
        name: 'Этот месяц',
      },
    ],
    count_chapters: [
      { id: '-20', name: '<20' },
      { id: '20-50', name: '<50' },
      {
        id: '50-',
        name: '50+',
      },
      { id: '100-', name: '100+' },
    ],
    issue_year: [
      {
        id: `${dayjs().year()}-${dayjs().year()}`,
        name: 'Текущий год',
      },
      { id: `${dayjs().year() - 2}`, name: 'За 2 года' },
    ],
    rating: [
      { id: '9-10', name: 'Лучшее' },
      { id: '7-', name: 'Хорошее' },
    ],
    bookmarks: bookmarks?.results ?? [],
  };
});
