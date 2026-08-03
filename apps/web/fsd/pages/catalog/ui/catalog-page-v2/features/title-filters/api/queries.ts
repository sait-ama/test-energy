import { cache } from 'react';

import { FormsTypes } from '~shared/api/models/forms';
import { getTypesBaseKey } from '~shared/lib/use-types-base';

import { TitleFiltersOptions } from '../model/types';

type ItemType = {
  id: string | number;
  name: string;
};

// TODO: УЧИТЫВАТЬ АВТОРИЗАЦИЮ
export const getTitlesFiltersOptions = cache(async (): Promise<TitleFiltersOptions> => {
  const { queryFn } = getTypesBaseKey({
    get: ['status', 'categories', 'genres', 'types', 'age_limit', 'translate_status'],
    type: FormsTypes.TITLES,
  });
  const list = await queryFn().then((v) => v.content);
  return {
    // @ts-expect-error: TODO: fix this
    types: (list.types as ItemType[])
      // .filter((item) => parseInt(item.id as string) !== 6)
      .sort((a, b) => (a.id < b.id ? -1 : 1)),
    // @ts-expect-error: TODO: fix this
    categories: list.categories as ItemType[],
    // @ts-expect-error: TODO: fix this
    genres: list.genres as ItemType[],
    // @ts-expect-error: TODO: fix this
    age_limit: list.age_limit as ItemType[],
    // @ts-expect-error: TODO: fix this
    status: list.status as ItemType[],
    // @ts-expect-error: TODO: fix this
    translate_status: list!.translate_status,
    // last_chapter_uploaded: [
    //   { id: '1-', name: 'Сегодня' },
    //   { id: '7-', name: 'Эта неделя' },
    //   {
    //     id: '31-',
    //     name: 'Этот месяц',
    //   },
    // ],
    // count_chapters: [
    //   { id: '-20', name: '<20' },
    //   { id: '20-50', name: '<50' },
    //   {
    //     id: '50-',
    //     name: '50+',
    //   },
    //   { id: '100-', name: '100+' },
    // ],
    // issue_year: [
    //   {
    //     id: `${dayjs().year()}-${dayjs().year()}`,
    //     name: 'Текущий год',
    //   },
    //   { id: `${dayjs().year() - 2}`, name: 'За 2 года' },
    // ],
    // rating: [
    //   { id: '9-10', name: 'Лучшее' },
    //   { id: '7-', name: 'Хорошее' },
    // ],
  };
});
