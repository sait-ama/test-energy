'use client';
import { useMemo } from 'react';

import { createContextSelector } from '@re/core/utils/create-context-selector';

import { useCurrentPublisher } from '~entities/publisher/model/hooks';

interface PublisherDeps {
  publisherId: number;
  isMember: boolean;
}
export const { useStore: useCurPublisherDeps, Provider: CurPublisherDeps } = createContextSelector<
  PublisherDeps,
  number
>((publisherId) => {
  const { data: isMember = false } = useCurrentPublisher((v) => v.props.is_member);
  return useMemo(
    () => ({
      isMember,
      publisherId,
    }),
    [isMember, publisherId]
  );
});
