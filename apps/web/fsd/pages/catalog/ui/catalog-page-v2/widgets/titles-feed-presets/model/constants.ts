import dayjs from 'dayjs';

import { CatalogTitleOrderingSchema } from '~shared/api/models/title';

import { Preset } from './types';

export const CUSTOM_PRESETS_COOKIE_KEY = 'custom-presets';

export const DEFAULT_PRESETS: Preset[] = [
  {
    name: 'Фэнтези на каждый день',
    filters: {
      ordering: CatalogTitleOrderingSchema.CHAPTER_DATE_DESC,
      genres: [38],
      rating: { min: 8, max: null },
      status: [2],
      exclude_genres: [28, 42, 40],
      exclude_categories: [63],
      issue_year: { min: dayjs().year() - 2, max: null },
      count_chapters: { min: 20, max: 200 },
      exclude_types: [3, 4, 6],
    },
  },
  //   {
  //     name: 'Лучшее для леди',
  //     filters: {
  //       exclude_genres: ['30', '33', '39', '19'],
  //       issue_year_gte: `${dayjs().year() - 4}`,
  //       count_chapters_gte: '20',
  //       rating_gte: '9',
  //       genres: ['28'],
  //       exclude_types: ['3'],
  //     },
  //   },

  {
    name: 'Лучшее для леди',
    filters: {
      exclude_genres: [30, 33, 39, 19],
      issue_year: { min: dayjs().year() - 4, max: null },
      count_chapters: { min: 20, max: null },
      rating: { min: 9, max: null },
      genres: [28],
      exclude_types: [3],
    },
  },
  {
    name: 'Для самых романтичных',
    filters: {
      ordering: CatalogTitleOrderingSchema.CHAPTER_DATE_DESC,
      status: [2],
      exclude_genres: [30, 33, 40, 42],
      exclude_categories: [64],
      issue_year: { min: dayjs().year() - 2, max: null },
      count_chapters: { min: 20, max: 200 },
      rating: { min: 8.5, max: null },
      genres: [25, 30],
      exclude_types: [2, 4, 3, 6],
    },
  },
];
