'use client';

import { ComponentProps, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useIsFirstRender } from '@artsy/fresnel/dist/Utils';

import { PostEntity } from '@re/api/generated/types.gen';

import { Routing } from '~shared/config/routing';
import { useLocalStorageState } from '~shared/hooks/use-local-storage-state';
import { logger } from '~shared/lib/logger';

import { PostForm, PostFormProvider } from '../base/post-form';

const persistKey = 'v1-persist-forum-creating';

export const CreatePostForm = () => {
  const tReusable = useTranslations('reusable');
  const router = useRouter();
  const setDefaultValuesPersisted = (
    val: ComponentProps<typeof PostFormProvider.Create>['defaultValues']
  ) => {
    try {
      if (typeof window !== 'undefined') {
        if (!val) {
          localStorage.removeItem(persistKey);
        } else {
          localStorage.setItem(persistKey, JSON.stringify(val));
        }
      }
    } catch (e: unknown) {
      logger.error(e, { scope: ['local'] });
      localStorage.removeItem(persistKey);
    }
  };
  const [persisted] = useLocalStorageState<
    ComponentProps<typeof PostFormProvider.Create>['defaultValues']
  >(persistKey, undefined, { onError: () => setDefaultValuesPersisted(undefined) });

  //todo вживить в useForm? пока nit!
  const handleSuccess = (value: PostEntity) => {
    setDefaultValuesPersisted(undefined);
    router.push(Routing.Forum.ByDir.get({ params: { dir: value.dir } }));
  };
  const isFirst = useIsFirstRender();
  //useEffect into useLocalstorageState
  const hasInitialized = !!persisted;
  //тут так надо, чтобы попусту не ререндерить PostFormProvider.Create, передавать рефку не хочу
  const memoizedDefaultValuesPersisted = useMemo(() => persisted, [hasInitialized, isFirst]);
  return (
    <PostFormProvider.Create
      onDebouncedChange={setDefaultValuesPersisted}
      defaultValues={memoizedDefaultValuesPersisted}
      onSuccess={handleSuccess}
    >
      <PostForm.Root className="flex w-full flex-col">
        <div className="flex justify-between gap-2">
          <PostForm.AuthorField />
          <PostForm.TagsField className="w-full max-w-100" />
        </div>
        <PostForm.EditorField className="mt-4" />
        {/*<PostForm.RelatedField className="mt-4" />*/}
        <PostForm.MainImageField className="mt-4" />
        <PostForm.SubmitButton className="mt-4 self-end">
          {tReusable('actions.submit')}
        </PostForm.SubmitButton>
      </PostForm.Root>
    </PostFormProvider.Create>
  );
};
