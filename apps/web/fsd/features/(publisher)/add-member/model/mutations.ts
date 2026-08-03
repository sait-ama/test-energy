import { PublisherRepository } from '~entities/publisher/model/repository';
import { useOptimisticMutation } from '~shared/api/react-query';

export const useCreateMemberMutation = () =>
  useOptimisticMutation({
    mutationFn: PublisherRepository.createMember,
  });
