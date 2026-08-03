import type { Type } from '~shared/api/models/forms';
import type { UpdateImageTransformer } from '~shared/types/buisines';

interface CreatorParam {
  creatorId: NumberIsomorphic;
}

export interface CreatorSchema {
  id: number;
  name: string;
  alt_name: string;
  description: string;
  type: CreatorType;
  country: Type;
  cover: {
    mid?: string;
    high?: string;
  };
}

export type CreatorSchemaFragment = Pick<
  CreatorSchema,
  'id' | 'alt_name' | 'type' | 'country' | 'cover' | 'name'
>;

export interface UpdateCreatorRequestSchema {
  data: Partial<CreatorFormData>;
}

export interface UpdateCreatorParamsSchema extends CreatorParam {}

export interface CreateCreatorRequestSchema {
  user_message?: string | undefined;
  data: CreatorFormData;
}

export type CreatorFormData = Omit<
  UpdateImageTransformer<CreatorSchema>,
  'id' | 'type' | 'country'
> & {
  country: number;
  type: number;
};

export enum CreatorType {
  AUTHOR = 1,
  STUDIO = 2,
  PUBLISHER = 3,
  ARTIST = 4,
  WRITER = 5,
}

export interface CreatorRetrieveResponseSchema extends CreatorSchema {}

export interface CreatorRetrieveParamsSchema {
  id: NumberIsomorphic;
}
