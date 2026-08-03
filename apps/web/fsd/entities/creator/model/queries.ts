import { CreatorQueryKeys } from '~entities/creator/model/query-keys';
import { CreatorRepository } from '~entities/creator/model/repository';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type {
  CreatorRetrieveParamsSchema,
  CreatorRetrieveResponseSchema,
} from '~shared/api/models/creator';
import { FormsTypes } from '~shared/api/models/forms';
import { queryKit } from '~shared/api/react-query';
import { getTypesBaseKey } from '~shared/lib/use-types-base';

export const { getKey: getCreatorFormsKey, useQuery: useCreatorForms } = queryKit.createQuery(() =>
  getTypesBaseKey({
    type: FormsTypes.CREATORS,
    get: ['country', 'type'],
  })
);

export const { useQuery: useCreatorQuery, getKey: getCreatorKey } = queryKit.createQuery<
  EndpointMeta<CreatorRetrieveParamsSchema, void>,
  CreatorRetrieveResponseSchema
>(({ variables, fetchOptions }) => ({
  queryKey: CreatorQueryKeys.getCreator(variables),
  queryFn: () => CreatorRepository.getCreator(variables, fetchOptions),
}));
