import { TitleSchema } from './title';

interface YearSummaryBookmark {
  id: number;
  name: string;
  is_default: boolean;
  bookmarks_count: number;
}

interface YearSummaryCategory {
  id: number;
  name: string;
  views_count: number;
}

interface Comment {
  count: number;
  likes: number;
  replay_comments: number;
}

interface Genre {
  id: number;
  name: string;
  views_count: number;
}

interface YearTotals {
  views: number;
  votes: number;
}

export interface YearSummaryByUserSchema {
  bookmarks: YearSummaryBookmark[];
  categories: YearSummaryCategory[];
  comments: Comment;
  rating: {
    avg: number;
    count: number;
  };
  genres: Genre[];
  year_totals: YearTotals;
}

export type YearSummaryAllFieldTypes = 'votes' | 'bookmarks' | 'comments' | 'views';
export interface YearSummaryAllSchema {
  titles: Record<YearSummaryAllFieldTypes, TitleSchema[]>;
}

export interface YearSummaryByUserRetrieveResponseSchema extends YearSummaryByUserSchema {}
export interface YearSummaryByUserRetrieveParamsSchema {
  userId: number;
}

export interface YearSummaryAllRetrieveResponseSchema extends YearSummaryAllSchema {}
