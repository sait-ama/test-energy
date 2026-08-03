import { ContentTypes } from '~shared/config/constants';

export type FilterKey =
  | 'types'
  | 'genres'
  | 'categories'
  | 'age_limit'
  | 'status'
  | 'translate_status'
  | 'last_chapter_uploaded'
  | 'count_chapters'
  | 'issue_year'
  | 'rating'
  | 'bookmarks';

export interface FilterSchema {
  key: FilterKey;
  name: string;
  field: string;
  type: 'select' | 'slider' | 'radio' | 'checkbox' | 'date-slider';
  logged?: boolean;
  excludable?: boolean;
  extended?: boolean;
  contentType?: ContentTypes[];
}

export const filters: FilterSchema[] = [
  {
    key: 'types',
    field: 'types',
    name: 'Тип',
    type: 'select',
    excludable: true,
  },
  {
    key: 'genres',
    field: 'genres',
    name: 'Жанры',
    type: 'select',
    excludable: true,
  },
  {
    key: 'categories',
    field: 'categories',
    name: 'Категории',
    type: 'select',
    excludable: true,
  },
  {
    key: 'age_limit',
    field: 'age_limit',
    name: 'Возрастное ограничение',
    type: 'select',
  },
  {
    key: 'status',
    field: 'status',
    name: 'Статус',
    type: 'select',
  },
  {
    key: 'translate_status',
    field: 'translate_status',
    name: 'Статус перевода',
    type: 'select',
    extended: true,
    contentType: [ContentTypes.MANGA, ContentTypes.NOVEL],
  },
  {
    key: 'last_chapter_uploaded',
    field: 'last_chapter_uploaded',
    name: 'Последний эпизод (дней назад)',
    type: 'date-slider',
    extended: true,
  },
  {
    key: 'count_chapters',
    field: 'count_chapters',
    name: 'Количество эпизодов',
    type: 'slider',
    extended: true,
  },
  {
    key: 'issue_year',
    field: 'issue_year',
    name: 'Год выпуска',
    type: 'slider',
    extended: true,
  },
  {
    key: 'rating',
    field: 'rating',
    name: 'Рейтинг',
    type: 'slider',
    extended: true,
  },
  {
    key: 'bookmarks',
    field: 'bookmarks',
    name: 'Закладки',
    logged: true,
    excludable: true,
    type: 'checkbox',
    extended: true,
  },
] as const;
