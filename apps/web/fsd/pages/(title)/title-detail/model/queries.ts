import { useParams } from 'next/navigation';

import { useSuspenseTitleDetail } from '~entities/title/model/queries';

import type { TitleDetailPageParams } from './type';

export const useCurrentPageSuspenseTitleDetail = () => {
  const params = useParams<TitleDetailPageParams>();

  return useSuspenseTitleDetail({ variables: { params: { dir: params.dir } } });
};
