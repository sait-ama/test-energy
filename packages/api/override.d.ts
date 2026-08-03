import type { Cover, MinimalUser, TitleList } from '@re/api/generated/types.gen';

declare module '@re/api/generated/types.gen' {
  export type ForumPostsSearchListData = {
    body?: never;
    path?: never;
    query?: {
      /**
       * A search term.
       */
      search?: string;
      count: number;
    };
    url: '/api/forum/posts/search/';
  };
  export type Collection = {
    rated: number | null;
    readonly id: number;
    user?: MinimalUser;
    /**
     * Название коллекции
     */
    name: string;
    score: number;
    /**
     * Описание
     */
    description?: string;
    titles: Array<TitleList>;
    /**
     * Постеры json
     */
    cover?: Cover;
  };
  export type V2TitlesCollectionsListData = {
    body?: never;
    path?: never;
    query?: {
      /**
       * Number of results to return per page.
       */
      count?: number;
      user_id?: number;
      title_id?: number;
      /**
       * A page number within the paginated result set.
       */
      page?: number;
    };
    url: '/api/v2/titles/collections/';
  };
  export type CollectionCreateUpdate = {
    /**
     * Название коллекции
     */
    name: string;
    /**
     * Описание
     */
    description?: string;
    /**
     * Постеры json
     */
    cover?: unknown;
    titles: { title: number; pos: number }[];
  };
  export type V2TitlesCollectionsRetrieveResponses = {
    200: Collection;
  };
}
