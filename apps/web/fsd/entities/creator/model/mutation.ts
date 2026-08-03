import type { DefaultError } from '@tanstack/query-core';
import { useMutation } from '@tanstack/react-query';

import { CreatorRepository } from '~entities/creator/model/repository';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type {
  CreateCreatorRequestSchema,
  UpdateCreatorParamsSchema,
  UpdateCreatorRequestSchema,
} from '~shared/api/models/creator';

export const useUpdateCreator = (variables: EndpointMeta<UpdateCreatorParamsSchema, void>) =>
  useMutation<void, DefaultError, UpdateCreatorRequestSchema>({
    mutationFn: (data) => CreatorRepository.updateCreator({ ...variables, data }),
  });

export const useCreateCreator = () =>
  useMutation<void, DefaultError, CreateCreatorRequestSchema>({
    mutationFn: (data) => CreatorRepository.createCreator({ data }),
  });
