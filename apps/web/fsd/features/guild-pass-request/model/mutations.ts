import type { DefaultError } from '@tanstack/query-core';

import { ClubKeys } from '~entities/guild/api/query-keys';
import { ClubRepository } from '~entities/guild/api/repository';
import { useDirDepClub, useGuildSuspenseQuery } from '~entities/guild/model/hooks';
import { useOptimisticMutation } from '~shared/api/react-query';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const useclubsCreateRequest2Club = () => {
  const { data: club } = useGuildSuspenseQuery();

  const { is_public, name, dir } = club ?? {};

  return useOptimisticMutation({
    invalidateV2: ClubKeys.clubsRetrieveQueryKey({ path: { dir: dir! } }),
    onSuccess: async () => {
      const toast = await importToastAsync();
      if (is_public) {
        toast.success(`Вы вступили в гильдию ${name}`);
      } else {
        toast.success('Заявка создана, ожидайте рассмотрения');
      }
    },
    mutationFn: () => ClubRepository.clubsCreateRequest2Club({ params: { dir: dir! } }),
  });
};

export const useLeaveClub = () => {
  const dir = useDirDepClub();

  return useOptimisticMutation({
    onSuccess: async () => {
      const toast = await importToastAsync();
      toast.success('Вы покинули гильдию, успехов!');
    },
    invalidateV2: ClubKeys.clubsRetrieveQueryKey({ path: { dir } }),
    mutationFn: () => ClubRepository.clubsLeaveClub({ params: { dir } }),
  });
};
export const useDestroyClub = () => {
  const dir = useDirDepClub();

  return useOptimisticMutation<void, DefaultError, { password: string }>({
    invalidateV2: ClubKeys.clubsRetrieveQueryKey({ path: { dir } }),
    mutationFn: (data) => ClubRepository.clubsDestroy({ params: { dir }, data }),
  });
};
