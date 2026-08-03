// Типы данных для опций фильтров
export interface TitleFiltersOptions {
  types: Array<{ id: string; name: string }>;
  genres: Array<{ id: number; name: string }>;
  categories: Array<{ id: number; name: string }>;
  age_limit: Array<{ id: number; name: string }>;
  status: Array<{ id: number; name: string }>;
  translate_status: Array<{ id: number; name: string }>;
  count_chapters: Array<{ id: string; name: string }>;
  last_chapter_uploaded: Array<{ id: string; name: string }>;
  issue_year: Array<{ id: string; name: string }>;
  rating: Array<{ id: string; name: string }>;
}
