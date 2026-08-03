import { CatalogTitleOrderingSchema } from '~shared/api/models/title';

export const id2NameMap: Record<CatalogTitleOrderingSchema, string> = {
  [CatalogTitleOrderingSchema.ID_ASC]: 'По новизне',
  [CatalogTitleOrderingSchema.COUNT_CHAPTERS_ASC]: 'По кол-ву эпизодов',
  [CatalogTitleOrderingSchema.CHAPTER_DATE_ASC]: 'По дате обновления',
  [CatalogTitleOrderingSchema.SCORE_ASC]: 'По популярности',
  [CatalogTitleOrderingSchema.RATING_ASC]: 'По оценке',
  [CatalogTitleOrderingSchema.COUNT_RATING_ASC]: 'По кол-ву оценок',
  [CatalogTitleOrderingSchema.VOTES_ASC]: 'По лайкам',
  [CatalogTitleOrderingSchema.VIEWS_ASC]: 'По просмотрам',
};
