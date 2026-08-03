import type { HeroCardSchema } from '~shared/api/models/inventory';
import type { TitleSchema } from '~shared/api/models/title';
import type {
  PaginationQuerySchema,
  ResponseResults,
  UpdateImageTransformer,
} from '~shared/types/buisines';

export interface CharacterParam {
  characterId: NumberIsomorphic;
}

export interface UpdateCharacterParamsSchema extends CharacterParam {}

export interface UpdateCharacterRequestSchema {
  data: Partial<UpdateImageTransformer<CharacterSchema>>;
}

export interface CreateCharacterRequestSchema {
  data: Omit<UpdateImageTransformer<CharacterSchema>, 'titles' | 'id'> & {
    titles: number[];
  };
}

export interface CharacterSchema {
  id: number;
  name: string;
  description?: string;
  alt_name: string | undefined;
  titles: TitleSchema[];
  cover: {
    high: string;
    mid: string;
  };
  details: {
    power?: string;
    sex?: string;
    classification?: string;
    affiliation?: string;
    age?: string;
    skills?: string;
  };
}

export type CharacterSchemaFragment = Pick<
  CharacterSchema,
  'id' | 'name' | 'alt_name' | 'title' | 'cover'
> & { title: string };

export type RetrieveCharacterResponseSchema = CharacterSchema;
export type RetrieveCharacterByTitleListResponseSchema = CharacterSchema[];
export type RetrieveCharacterParamsSchema = CharacterParam;

export interface CardsByCharacterResponseSchema extends ResponseResults<HeroCardSchema[]> {}

export interface CardsByCharacterQuerySchema extends Partial<PaginationQuerySchema> {}

export interface CardsByCharacterParamsSchema extends CharacterParam {}

export interface CharacterByTitleParamsSchema {
  titleId: NumberIsomorphic;
}
