'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { fetchClientHeaders } from './request-state-provider.server';

export const useRequestState = () => {
  const { data } = useSuspenseQuery({
    queryKey: ['request-state'],
    queryFn: fetchClientHeaders,
  });

  return {
    headers: data,
  };
};
