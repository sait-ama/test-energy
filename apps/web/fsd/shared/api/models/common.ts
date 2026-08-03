import type { Type } from '~shared/api/models/forms';
import type { PublisherSchema } from '~shared/api/models/publisher';
import type { UserSchema } from '~shared/api/models/user';

export enum RatedStatus {
  LIKED,
  DISLIKED,
}
export type RatedStatusType = RatedStatus | null;
export type UserSchemaFragment = Pick<
  UserSchema,
  'avatar' | 'id' | 'username' | 'frame' | 'tagline'
>;
export interface TitleSchema {
  id: number;
  dir: string;
  cover: Record<'mid' | 'high', string>;
  wallpaper: Record<'mid' | 'high', string>;
  bookmark_type: string | null;
  avg_rating: string;
  is_licensed: boolean;
  secondary_name: string;
  another_name: string;
  main_name: string;
  type: { name: string; id: number };
  description: string;
  is_erotic: boolean;
  count_chapters: number;
  is_yaoi: boolean;
  issue_year: string;
  admin_rating: string | undefined;
  total_votes: number;
  total_views: number;
  count_bookmarks: number;
  count_rating: number;
  age_limit: {
    id: number;
    name: string;
  };
  genres: Type[]; // ?
  publishers: PublisherSchema[]; // ?
}
