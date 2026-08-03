export {};
export declare module './generated/models' {
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
}
