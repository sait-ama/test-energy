import React from 'react';
import Link from 'next/link';

import { Button } from '@re/ui-kit/ui/button';

import type { HeroCardAuthor } from '~shared/api/models/inventory';
import { Routing } from '~shared/config/routing';

export const AuthorButton = ({ author }: { author: HeroCardAuthor | undefined }) => {
  if (!author) return null;

  return (
    <div className="flex items-center justify-center md:justify-start">
      <Button asChild color="secondary">
        <Link
          href={Routing.User.detail({
            params: {
              id: author.id,
              tab: 'about',
            },
          })}
        >
          Автор:
          {author.username.length > 20 ? `${author.username.slice(0, 18)}...` : author.username}
        </Link>
      </Button>
    </div>
  );
};
