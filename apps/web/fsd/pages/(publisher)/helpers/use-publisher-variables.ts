import { useParams } from 'next/navigation';

import { useCurPublisherDeps } from '~entities/publisher/model/context';

export const usePublisherVariables = (): {
  publisherId: number;
  titleDir?: string | null;
} => {
  const params = useParams<{ titleDir: string }>();
  const publisherId = useCurPublisherDeps((v) => v.publisherId);

  return {
    publisherId,
    titleDir: params.titleDir || null,
  };
};
