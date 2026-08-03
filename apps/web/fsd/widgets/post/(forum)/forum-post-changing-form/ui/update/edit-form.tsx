'use client';
import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useSuspenseQuery } from '@tanstack/react-query';

import { client } from '~shared/api/client';
import { v2ForumRetrieve2Options } from '~shared/api/generated/tanstack';
import { Routing } from '~shared/config/routing';

import { deserializeFormValues } from '../../model/utils';
import { PostForm, PostFormProvider } from '../base/post-form';

export const EditPostForm = () => {
  const { dir } = useParams<{ dir: string }>();

  const tReusable = useTranslations('reusable');

  const router = useRouter();

  const { data: post } = useSuspenseQuery(v2ForumRetrieve2Options({ client, path: { dir } }));

  const defaultValues = useMemo(() => deserializeFormValues(post), [post]);

  const handleSuccess = () => {
    router.push(Routing.Forum.ByDir.get({ params: { dir: post.dir } }));
  };

  return (
    <PostFormProvider.Edit
      dir={post.dir}
      defaultValues={defaultValues}
      onSuccess={handleSuccess}
      post={post}
    >
      <PostForm.Root className="flex w-full flex-col">
        <div className="flex justify-between">
          <PostForm.AuthorField />
          <PostForm.TagsField />
        </div>
        <PostForm.EditorField className="mt-4" />
        {/*<PostForm.RelatedField className="mt-4" />*/}
        <PostForm.MainImageField className="mt-4" />
        <PostForm.SubmitButton className="mt-4 self-end">
          {tReusable('actions.update')}
        </PostForm.SubmitButton>
      </PostForm.Root>
    </PostFormProvider.Edit>
  );
};
