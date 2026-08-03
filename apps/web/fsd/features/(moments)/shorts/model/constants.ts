import { MomentListOrdering } from '~shared/api/models/inventory';

export const FILTERS_ORDERING_MAP: Record<MomentListOrdering, string> = {
  [MomentListOrdering.TRENDING]: 'В тренде',
  [MomentListOrdering.COUNT_COMMENTS]: 'По количеству комментариев',
  [MomentListOrdering.CREATED_AT]: 'По новизне',
  [MomentListOrdering.SCORE]: 'По популярности',
  [MomentListOrdering.RANDOM]: 'Случайное',
};
