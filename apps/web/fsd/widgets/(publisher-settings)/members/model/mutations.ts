import { PublisherRepository } from '~entities/publisher/model/repository';
import { useOptimisticMutation } from '~shared/api/react-query';

export const useCurrentPublisherMemberUpdateMutation = () =>
  useOptimisticMutation({
    mutationFn: PublisherRepository.editMember,
  });
