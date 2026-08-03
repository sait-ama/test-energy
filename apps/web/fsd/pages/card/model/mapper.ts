import { HeroCardCatalogOrderings } from '~shared/api/models/inventory';
import { isEmpty } from '~shared/utils/is-empty';

const resolveValue = (
  value: string | string[] | null | undefined,
  fallback?: string | string[]
) => {
  return isEmpty(value) ? fallback : value!;
};

export const getTransformedValues = (q: string) => {
  const searchParams = new URLSearchParams(q);

  const query = {
    ordering: resolveValue(searchParams.get('ordering'), HeroCardCatalogOrderings.RANK_DESC),
    title: resolveValue(searchParams.getAll('title')),
    exclude_title: resolveValue(searchParams.getAll('exclude_title')),
    character: resolveValue(searchParams.getAll('character')),
    exclude_character: resolveValue(searchParams.getAll('exclude_character')),
    author: resolveValue(searchParams.getAll('author')),
    exclude_author: resolveValue(searchParams.getAll('exclude_author')),
    rank: resolveValue(searchParams.get('rank')),
    exclude_rank: resolveValue(searchParams.get('exclude_rank')),
    power_lte: resolveValue(searchParams.get('power_lte')),
    power_gte: resolveValue(searchParams.get('power_gte')),
  };

  return query;
};
