import { CharacterQueryKeys } from '~entities/character/model/query-keys';
import { CharacterRepository } from '~entities/character/model/repository';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type {
  CharacterByTitleParamsSchema,
  RetrieveCharacterByTitleListResponseSchema,
  RetrieveCharacterParamsSchema,
  RetrieveCharacterResponseSchema,
} from '~shared/api/models/character';
import { queryKit } from '~shared/api/react-query';

export const { useQuery: useCharacterQuery, getKey: getCharacterKey } = queryKit.createQuery<
  EndpointMeta<RetrieveCharacterParamsSchema, void>,
  RetrieveCharacterResponseSchema
>(({ variables, fetchOptions }) => ({
  queryKey: CharacterQueryKeys.getCharacter(variables),
  queryFn: () => CharacterRepository.getCharacter(variables, fetchOptions),
}));

export const { useQuery: useCharacterByTitleListQuery, getKey: getCharacterByTitleListKey } =
  queryKit.createQuery<
    EndpointMeta<CharacterByTitleParamsSchema, void>,
    RetrieveCharacterByTitleListResponseSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: CharacterQueryKeys.byTitle(variables),
    queryFn: () => CharacterRepository.getCharacterByTitleList(variables, fetchOptions),
  }));
