import type { Rewrite } from 'next/dist/lib/load-custom-routes';

export const rewrites = async (): Promise<Rewrite[]> => {
  return [] satisfies Rewrite[];
};
