import { CatalogTitleOrderingSchema } from '~shared/api/models/title';

export class QueryFormatter {
  static multiValue = <V extends URLSearchParams>(
    query: V,
    key: string,
    deserializer: (v: any) => any = String
  ) => {
    const value = query.getAll(key);

    return Array.isArray(value) ? value.map(deserializer) : value ? [deserializer(value)] : [];
  };

  static singleValue = <V extends URLSearchParams>(query: V, key: string) => {
    const value = query[key] as string;

    return value ?? '';
  };
}

export const getTransformedValues = (q: string) => {
  const searchParams = new URLSearchParams(q);

  const query = {
    page: Number(searchParams.get('page') || 1),
    ordering:
      (QueryFormatter.singleValue(searchParams, 'ordering') as CatalogTitleOrderingSchema) ||
      CatalogTitleOrderingSchema.SCORE_DESC,
    search: QueryFormatter.singleValue(searchParams, 'search'),
    last_chapter_uploaded_gte: QueryFormatter.singleValue(
      searchParams,
      'last_chapter_uploaded_gte'
    ),
    last_chapter_uploaded_lte: QueryFormatter.singleValue(
      searchParams,
      'last_chapter_uploaded_lte'
    ),
    genres: QueryFormatter.multiValue(searchParams, 'genres'),
    categories: QueryFormatter.multiValue(searchParams, 'categories'),
    types: QueryFormatter.multiValue(searchParams, 'types'),
    status: QueryFormatter.multiValue(searchParams, 'status'),
    age_limit: QueryFormatter.multiValue(searchParams, 'age_limit'),
    exclude_types: QueryFormatter.multiValue(searchParams, 'exclude_types'),
    exclude_genres: QueryFormatter.multiValue(searchParams, 'exclude_genres'),
    exclude_categories: QueryFormatter.multiValue(searchParams, 'exclude_categories'),
    issue_year_gte: QueryFormatter.singleValue(searchParams, 'issue_year_gte'),
    issue_year_lte: QueryFormatter.singleValue(searchParams, 'issue_year_lte'),
    rating_gte: QueryFormatter.singleValue(searchParams, 'rating_gte'),
    rating_lte: QueryFormatter.singleValue(searchParams, 'rating_lte'),
    count_chapters_lte: QueryFormatter.singleValue(searchParams, 'count_chapters_lte'),
    count_chapters_gte: QueryFormatter.singleValue(searchParams, 'count_chapters_gte'),
    bookmarks: QueryFormatter.multiValue(searchParams, 'bookmarks', Number),
    exclude_bookmarks: QueryFormatter.multiValue(searchParams, 'exclude_bookmarks', Number),
  };

  return query;
};
