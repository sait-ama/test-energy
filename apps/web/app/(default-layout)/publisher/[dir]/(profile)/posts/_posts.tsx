'use client';

import { useParams } from 'next/navigation';

import { useSuspenseQuery } from '@tanstack/react-query';

import { getPublisherQuery } from '~entities/publisher/model/queries';
import { PostFeedSubject } from '~widgets/post/post-feed-subject';

export const PublisherPosts = () => {
  const params = useParams<{ dir: string }>();

  const { dir } = params;
  // @ts-ignore
  const { data } = useSuspenseQuery(getPublisherQuery({ variables: { params: { dir } } }));

  return (
    <PostFeedSubject
      query={{
        publisher: data.content.id.toString(),
      }}
    />
  );
};
