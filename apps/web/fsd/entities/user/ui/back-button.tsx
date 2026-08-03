import Link from 'next/link';
import { useTranslations } from 'next-intl';

import ArrowIcon from '@re/ui-kit/icons/arrow-left';
import { Button } from '@re/ui-kit/ui/button';

import { Routing } from '~shared/config/routing';

export const BackButton = ({ userId }: { userId: NumberIsomorphic }) => {
  const t = useTranslations('reusable.routing');

  return (
    <div>
      <Button variant="outline" asChild startIcon={<ArrowIcon />}>
        <Link
          shallow={false}
          prefetch={false}
          href={Routing.User.detail({ params: { id: userId, tab: 'about' } })}
        >
          {t.raw('back')}
        </Link>
      </Button>
    </div>
  );
};
