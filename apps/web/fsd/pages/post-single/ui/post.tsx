'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { client } from '~shared/api/client';
import { v2ForumRetrieve2Options } from '~shared/api/generated/tanstack';
import { PostSingle } from '~widgets/post/(forum)/(post)/post-single';

export interface PostSinglePageProps {
  dir: string;
}

export const PostSinglePageContent = ({ dir }: PostSinglePageProps) => {
  const { data: post } = useSuspenseQuery(v2ForumRetrieve2Options({ path: { dir }, client }));
  return <PostSingle model={post} />;
};
