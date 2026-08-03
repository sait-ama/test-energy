import { useParams, useSearchParams } from 'next/navigation';

export const useTopParams = () => {
  const { tab = 'all' } = useParams<{ tab?: string }>() ?? {};
  const searchParams = useSearchParams();
  const period = searchParams.get('period') ?? 'new';

  return {
    period,
    tab,
  };
};
