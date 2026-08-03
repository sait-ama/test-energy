import { ReactNode } from 'react';
import { useParams } from 'next/navigation';

import { useUserSuspenseQuery } from '~entities/user/model/queries';
import { EmptyView } from '~shared/ui/empty-view';

export interface ExchangesDisabledBoundaryProps {
  children: ReactNode;
}

export const ExchangesDisabledBoundary = ({ children }: ExchangesDisabledBoundaryProps) => {
  const { id: targetId } = useParams<{ id: string }>();

  const { data: target } = useUserSuspenseQuery({
    variables: { params: { userId: String(targetId) } },
  });
  return (
    <EmptyView isEmpty={!target.is_exchanges_enable} text="Не принимает обмены">
      {children}
    </EmptyView>
  );
};
