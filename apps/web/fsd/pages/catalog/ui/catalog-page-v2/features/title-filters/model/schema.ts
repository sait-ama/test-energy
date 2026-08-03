import { id2NameMap } from '~features/select-catalog-ordering/model/const';
import { CatalogTitleOrderingSchema } from '~shared/api/models/title';
import {
  createInputFilter,
  createMultiSelectFilter,
  createRangeFilter,
  createRangeRequestSerializerWithTransform,
  createSelectFilter,
  standardRangeRequestSerializer,
} from '~shared/lib/filters';

import { daysToDateString } from './../lib/utils';

const daysToDateStringTransformValue = createRangeRequestSerializerWithTransform(daysToDateString);

import { TitleFiltersOptions } from './types';

export function createBaseTitleFiltersSchema(data: TitleFiltersOptions) {
  return {
    search: createInputFilter({
      name: 'search',
      label: 'Поиск',
      withUrlSync: true,
    }),
    ordering: createSelectFilter<string | null>({
      name: 'ordering',
      label: 'Сортировка',
      options: [
        ...Object.entries(id2NameMap).map(([id, name]) => ({ value: id, label: name })),
        ...Object.entries(id2NameMap).map(([id, name]) => ({ value: '-' + id, label: name })),
      ],
      defaultValue: CatalogTitleOrderingSchema.SCORE_DESC,
      withUrlSync: true,
      isActive: true,
    }),
  } as const;
}

/**
 * Создает схему фильтров для каталога тайтлов
 * @param data - данные для options селектов
 * @returns схема фильтров готовая для использования
 */
export function createTitleFiltersSchema(data: TitleFiltersOptions) {
  const typesOptions = data?.types?.map((type) => ({ value: type.id, label: type.name }));

  const genresOptions = data?.genres?.map((genre) => ({ value: genre.id, label: genre.name }));

  const categoriesOptions = data?.categories?.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  return {
    ...createBaseTitleFiltersSchema(data),

    types: createMultiSelectFilter<NumberIsomorphic>({
      name: 'types',
      label: 'Тип',
      options: typesOptions,
      withUrlSync: true,
    }),

    genres: createMultiSelectFilter<NumberIsomorphic>({
      name: 'genres',
      label: 'Жанры',
      options: genresOptions,
      maxSelections: 5,
      valueOption: 'value',
      labelOption: 'label',
      withUrlSync: true,
    }),

    categories: createMultiSelectFilter<NumberIsomorphic>({
      name: 'categories',
      label: 'Категории',
      options: categoriesOptions,
      maxSelections: 3,
      withUrlSync: true,
    }),

    bookmarks: createMultiSelectFilter<NumberIsomorphic>({
      name: 'bookmarks',
      label: 'Закладки',
      withUrlSync: true,
      options: [],
    }),

    status: createMultiSelectFilter<NumberIsomorphic>({
      name: 'status',
      label: 'Статус',
      options: data?.status?.map((status) => ({ value: status.id, label: status.name })),
      withUrlSync: true,
    }),

    translate_status: createMultiSelectFilter<NumberIsomorphic>({
      name: 'translate_status',
      label: 'Статус перевода',
      options: data?.translate_status?.map((status) => ({ value: status.id, label: status.name })),
      withUrlSync: true,
    }),

    count_chapters: createRangeFilter({
      name: 'count_chapters',
      label: 'Количество глав',
      min: 1,
      max: 1000,
      step: 1,
      unitLabel: 'эпизодов',
      withUrlSync: true,
      serializeToRequest: standardRangeRequestSerializer,
      options: [
        { value: { min: null, max: 20 }, label: '<20' },
        { value: { min: null, max: 50 }, label: '<50' },
        { value: { min: 50, max: null }, label: '50+' },
        { value: { min: 100, max: null }, label: '100+' },
      ],
    }),

    rating: createRangeFilter({
      name: 'rating',
      label: 'Рейтинг',
      min: 0,
      max: 10,
      step: 0.1,
      unitLabel: '★',
      withUrlSync: true,
      serializeToRequest: standardRangeRequestSerializer,
      options: [
        { value: { min: 9, max: 10 }, label: 'Лучшее' },
        { value: { min: 7, max: null }, label: 'Хорошее' },
      ],
    }),

    age_limit: createMultiSelectFilter<NumberIsomorphic>({
      name: 'age_limit',
      label: 'Возрастное ограничение',
      options: data?.age_limit?.map((limit) => ({ value: limit.id, label: limit.name })),
      withUrlSync: true,
    }),

    issue_year: createRangeFilter({
      name: 'issue_year',
      label: 'Год выпуска',
      min: 1950,
      max: new Date().getFullYear(),
      step: 1,
      unitLabel: 'год',
      withUrlSync: true,
      serializeToRequest: standardRangeRequestSerializer,
      options: [
        {
          value: { min: new Date().getFullYear(), max: new Date().getFullYear() },
          label: 'Текущий год',
        },
        {
          value: { min: new Date().getFullYear() - 2, max: null },
          label: 'За 2 года',
        },
      ],
    }),

    last_chapter_uploaded: createRangeFilter({
      name: 'last_chapter_uploaded',
      label: 'Последняя глава (дней назад)',
      min: 0,
      max: 365,
      step: 1,
      unitLabel: 'дней',
      withUrlSync: true,
      serializeToRequest: daysToDateStringTransformValue,
      options: [
        { value: { min: null, max: 1 }, label: 'Сегодня' },
        { value: { min: null, max: 7 }, label: 'Эта неделя' },
        { value: { min: null, max: 31 }, label: 'Этот месяц' },
      ],
    }),

    exclude_types: createMultiSelectFilter<NumberIsomorphic>({
      name: 'exclude_types',
      label: 'Исключить типы',
      options: typesOptions,
      withUrlSync: true,
    }),

    exclude_genres: createMultiSelectFilter<NumberIsomorphic>({
      name: 'exclude_genres',
      label: 'Исключить жанры',
      options: genresOptions,
      maxSelections: 5,
      valueOption: 'value',
      labelOption: 'label',
      withUrlSync: true,
    }),

    exclude_categories: createMultiSelectFilter<NumberIsomorphic>({
      name: 'exclude_categories',
      label: 'Исключить категории',
      options: categoriesOptions,
      maxSelections: 3,
      withUrlSync: true,
    }),

    exclude_bookmarks: createMultiSelectFilter<NumberIsomorphic>({
      name: 'exclude_bookmarks',
      label: 'Исключить закладки',
      withUrlSync: true,
      options: [],
    }),
  } as const;
}

export function isRangeFilter(filter: keyof TitleFiltersSchema, schema: TitleFiltersSchema) {
  return schema[filter]?.type === 'range';
}

export type TitleFiltersSchema = ReturnType<typeof createTitleFiltersSchema>;
