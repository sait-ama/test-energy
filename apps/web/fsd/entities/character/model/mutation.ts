import type { DefaultError } from '@tanstack/query-core';
import { useMutation } from '@tanstack/react-query';

import { CharacterRepository } from '~entities/character/model/repository';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type {
  CreateCharacterRequestSchema,
  UpdateCharacterParamsSchema,
  UpdateCharacterRequestSchema,
} from '~shared/api/models/character';

export const useUpdateCharacter = (variables: EndpointMeta<UpdateCharacterParamsSchema, void>) =>
  useMutation<void, DefaultError, UpdateCharacterRequestSchema>({
    mutationFn: (data) => CharacterRepository.updateCharacter({ ...variables, data }),
  });

export const useCreateCharacter = () =>
  useMutation<void, DefaultError, CreateCharacterRequestSchema>({
    mutationFn: (data) => CharacterRepository.createCharacter({ data }),
  });
