import { ReadonlyURLSearchParams } from 'next/navigation';

import { HeroCardFiltersSchema } from './types';

export const pickQueryFromHeroCardsFilters = (filters: HeroCardFiltersSchema) => {
  const resolvedFilters: Partial<Record<keyof HeroCardFiltersSchema, string>> = {};

  Object.entries(filters).forEach(([filterName, filterSchema]) => {
    if (!filterSchema.value) return;

    let value = filterSchema.value;

    if (
      filterName === 'is_favorite' ||
      filterName === 'is_exchangeable' ||
      filterName === 'card__is_exchangeable'
    ) {
      value = String(Number(!!filterSchema.value));
    }

    if (filterName === 'wish_type' && filterSchema.value === 'all') return;
    //@ts-ignore
    resolvedFilters[filterName] = value;
  });

  return resolvedFilters;
};

export const createHeroCardsDefaultFilters = () => ({
  ordering: {
    value: null,
  },
  card__rank: {
    value: null,
  },
  card__title_id: {
    value: null,
  },
  card_id: {
    value: null,
  },
  card__character_id: {
    value: null,
  },
  wish_type: {
    value: null,
  },
  is_exchangeable: {
    value: null,
  },
  card__is_exchangeable: {
    value: null,
  },
  is_favorite: {
    value: null,
  },
});

export const getHeroCardsFiltersFromSearchParams = (
  searchParams: ReadonlyURLSearchParams
): HeroCardFiltersSchema => {
  const filters = createHeroCardsDefaultFilters();

  Object.entries(filters).forEach(([filterName, filterSchema]) => {
    const param = searchParams.get(filterName);

    if (!param) return;

    let value = param;

    if (
      filterName === 'is_favorite' ||
      filterName === 'is_exchangeable' ||
      filterName === 'card__is_exchangeable'
    ) {
      value = param === '1';
    }

    if (filterName === 'wish_type') {
      value = Number(param) ?? null;
    }
    // if ('variants' in filterSchema && !filterSchema.variants.find((v) => v.id == param)) return;

    //@ts-ignore
    filters[filterName] = { value };
  });

  return filters;
};
