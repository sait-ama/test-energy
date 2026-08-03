'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import Coin from '@re/ui-kit/icons/coin';
import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';

import { useCurrentPublisher } from '~entities/publisher/model/hooks';
import { Routing } from '~shared/config/routing';

export const PublisherBalance = (props: ButtonProps) => {
  const { dir } = useParams<{ dir: string }>();
  const { balance, withdraw_total_sum } = useCurrentPublisher((v) => v?.content).data!;
  if (balance === undefined) return null;

  return (
    <Link
      shallow={false}
      prefetch={false}
      href={Routing.Publisher.settings({ params: { dir, tab: 'monetization' } })}
    >
      <Button variant="outline" endIcon={<Coin />} {...props}>
        {parseInt(balance, 10)}
      </Button>
    </Link>
  );
};
