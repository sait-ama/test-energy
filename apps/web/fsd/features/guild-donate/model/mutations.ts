import { useOptimisticMutationWithClubInvalidate } from '~entities/guild/api/mutations';
import { ClubRepository } from '~entities/guild/api/repository';
import { useDirDepClub } from '~entities/guild/model/hooks';
import { changeSessionParamsLocally } from '~entities/user/model/mutations';
import type { ClubExpDonateAPIViewCreateRequestSchema } from '~shared/api/models/guild-club';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const useDonateClub = () => {
  const dir = useDirDepClub();

  return useOptimisticMutationWithClubInvalidate<void, ClubExpDonateAPIViewCreateRequestSchema>({
    mutationFn: (data) => ClubRepository.clubsDonateCreate({ params: { dir }, data }),
    onSuccess: async (_, { coins }) => {
      const toast = await importToastAsync();
      toast.success('Молнии успешно доставлены!');
      changeSessionParamsLocally((v) => ({ ...v, coins: v.coins - coins }));
    },
  });
};
