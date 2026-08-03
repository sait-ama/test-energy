import type { ToolkitEndpointBuilder } from '~shared/api/api-toolkit';
import type {
  CardsByCharacterParamsSchema,
  CardsByCharacterQuerySchema,
  CharacterByTitleParamsSchema,
  RetrieveCharacterParamsSchema,
  UpdateCharacterParamsSchema,
} from '~shared/api/models/character';
import { UrlBuilder } from '~shared/utils/url-formatter';

export namespace CharacterEndpoints {
  export const character: ToolkitEndpointBuilder<RetrieveCharacterParamsSchema, void> = (
    variables
  ) => `/api/v2/titles/characters/${variables.params!.characterId}/`;

  export const characterCards: ToolkitEndpointBuilder<
    CardsByCharacterParamsSchema,
    CardsByCharacterQuerySchema
  > = (variables) =>
    `/api/inventory/character/${variables.params!.characterId}/cards/?page=1&count=20`;

  export const updateCharacter: ToolkitEndpointBuilder<UpdateCharacterParamsSchema, void> = (
    variables
  ) => `/api/v2/titles/characters/${variables.params!.characterId}/`;

  export const byTitle: ToolkitEndpointBuilder<CharacterByTitleParamsSchema, void> = (variables) =>
    new UrlBuilder(`/api/v2/titles/${variables.params!.titleId}/characters/`).build();

  export const createCharacter = () => '/api/v2/titles/characters/';
}
