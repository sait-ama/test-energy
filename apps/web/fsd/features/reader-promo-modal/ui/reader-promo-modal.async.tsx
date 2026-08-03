import dynamic from 'next/dynamic';

import { useSession } from '~shared/lib/session/use-session';

const ReaderPromoModal = dynamic(
  () => import('./reader-promo-modal').then((mod) => mod.ReaderPromoModal),
  {
    ssr: false,
  }
);

export const ReaderPromoModalAsync = () => {
  const session = useSession();

  if (session?.is_premium || session?.is_staff) return null;

  return <ReaderPromoModal />;
};
