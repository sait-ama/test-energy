import { CharacterEndpoints } from '~entities/character/model/endpoints';
import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';
import type {
  CardsByCharacterParamsSchema,
  CardsByCharacterQuerySchema,
  CardsByCharacterResponseSchema,
  CharacterByTitleParamsSchema,
  CreateCharacterRequestSchema,
  RetrieveCharacterByTitleListResponseSchema,
  RetrieveCharacterParamsSchema,
  RetrieveCharacterResponseSchema,
  UpdateCharacterParamsSchema,
  UpdateCharacterRequestSchema,
} from '~shared/api/models/character';
import { sanitizeAsync } from '~shared/lib/sanitize/sanitize-async';

const createCharacterRouter = apiToolkit(({ api, toolbox }) => ({
  getCharacter: toolbox.createMethod<
    RetrieveCharacterResponseSchema,
    void,
    RetrieveCharacterParamsSchema,
    void
  >((variables, opts) =>
    api
      .get<RetrieveCharacterResponseSchema>(CharacterEndpoints.character(variables), opts)
      .then(async (v) => ({
        ...v,
        description: await sanitizeAsync(v.description),
      }))
  ),
  getCharacterByTitleList: toolbox.createMethod<
    RetrieveCharacterByTitleListResponseSchema,
    void,
    CharacterByTitleParamsSchema,
    void
  >((variables, opts) =>
    api.get<RetrieveCharacterByTitleListResponseSchema>(CharacterEndpoints.byTitle(variables), opts)
  ),
  getCharacterCards: toolbox.createMethod<
    CardsByCharacterResponseSchema,
    void,
    CardsByCharacterParamsSchema,
    CardsByCharacterQuerySchema
  >((variables, opts) => api.get(CharacterEndpoints.characterCards(variables), opts)),
  updateCharacter: toolbox.createMethod<
    void,
    UpdateCharacterRequestSchema,
    UpdateCharacterParamsSchema,
    void
  >((variables, opts) =>
    api.put(CharacterEndpoints.updateCharacter(variables), variables.data, opts)
  ),
  createCharacter: toolbox.createMethod<void, CreateCharacterRequestSchema, void, void>(
    (variables, opts) => api.post(CharacterEndpoints.createCharacter(), variables.data, opts)
  ),
}));

export namespace CharacterRepository {
  export const {
    getCharacter,
    getCharacterCards,
    updateCharacter,
    createCharacter,
    getCharacterByTitleList,
  } = createCharacterRouter({ api });
}
