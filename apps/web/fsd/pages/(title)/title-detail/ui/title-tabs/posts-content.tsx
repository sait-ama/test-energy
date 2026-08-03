'use client';

import Link from 'next/link';

import ExternalLink from '@re/ui-kit/icons/external-link';
import { Button } from '@re/ui-kit/ui/button';

import { Routing } from '~shared/config/routing';
import { PostFeedSubject } from '~widgets/post/post-feed-subject';

import { useCurrentPageSuspenseTitleDetail } from '../../model/queries';

export const PostsContent = () => {
  const { data: title } = useCurrentPageSuspenseTitleDetail();
  const { id, dir } = title!;

  return (
    <PostFeedSubject
      additional2Ordering={
        <div className="flex w-full gap-2">
          <Button asChild color="secondary" size="lg" variant="default">
            <Link
              shallow={false}
              prefetch={false}
              href={Routing.Forum.Create.create({
                query: { tags: ['2'], title: dir },
              })}
            >
              Создать обсуждение
            </Link>
          </Button>
          <div className="flex-1" />
          <Button
            asChild
            endIcon={<ExternalLink className="size-3" />}
            className="self-center justify-self-end"
          >
            <Link
              shallow={false}
              prefetch={false}
              href={Routing.Forum.Feed.get({ query: { title: id } })}
            >
              На форум
            </Link>
          </Button>
        </div>
      }
      query={{ target_type: 'title', target_id: id.toString() }}
    />
  );
};
