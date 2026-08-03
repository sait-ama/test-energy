import type { CharacterSchemaFragment } from '~shared/api/models/character';
import type { CreatorSchemaFragment } from '~shared/api/models/creator';
import type { PublisherSchemaFragment } from '~shared/api/models/publisher';
import type { TitleSchemaFragment } from '~shared/api/models/title';
import type { UserSchemaFragment } from '~shared/api/models/user';
import type { ResponseResultsV2 } from '~shared/types/buisines';

export interface PopularTitle {
  daily_views: number;
  title: TitleSchemaFragment;
}

export type PopularTitlesResponseSchema = PopularTitle[];

export enum SearchField {
  creators = 'creators',
  titles = 'titles',
  publishers = 'publishers',
  cards = 'cards',
  users = 'users',
  characters = 'characters',
}

export type SearchQuerySchema = {
  count: number;
  query: string;
  page?: number;
} & (
  | { field: Exclude<SearchField, SearchField.users> }
  | { field: SearchField.users; friends?: 1 | 0 }
);

export type SearchItem<Field extends SearchField> = Field extends SearchField.titles
  ? TitleSchemaFragment
  : Field extends SearchField.creators
    ? CreatorSchemaFragment
    : Field extends SearchField.publishers
      ? PublisherSchemaFragment
      : Field extends SearchField.characters
        ? CharacterSchemaFragment
        : Field extends SearchField.users
          ? UserSchemaFragment
          : never;

export interface SearchResponseSchema<Field extends SearchField>
  extends ResponseResultsV2<
    SearchItem<Field>[],
    {
      page: number;
      total_items: number;
      total_pages: number;
    }
  > {}
