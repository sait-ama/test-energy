import Link from 'next/link';

import ArrowIcon from '@re/ui-kit/icons/arrow-left';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { PublisherCard } from '~entities/publisher/ui/publisher-card';
import type { UserSchema } from '~shared/api/models/user';
import { Routing } from '~shared/config/routing';
import { Underline } from '~shared/ui/underline';

export interface PublishersProps {
  user: UserSchema;
}

export const Publishers = ({ user }: PublishersProps) => (
  <div className="flex flex-col">
    <div className="mb-4">
      <Button variant="outline" asChild startIcon={<ArrowIcon />}>
        <Link
          shallow={false}
          prefetch={false}
          href={Routing.User.detail({ params: { id: user.id, tab: 'about' } })}
        >
          Назад
        </Link>
      </Button>
    </div>

    <Underline>
      <ReText size="2xl" weight="semibold" component="h2">
        Паблишеры
      </ReText>
    </Underline>

    <div className="mt-6 grid auto-rows-fr grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
      {user.publishers.map((it) => (
        <Link
          prefetch={false}
          href={Routing.Publisher.detail({ params: { dir: it.dir, tab: 'about' } })}
          key={it.dir}
        >
          <PublisherCard withBorder key={it.id} model={it} />
        </Link>
      ))}
    </div>
  </div>
);
