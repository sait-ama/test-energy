import { createContext, ReactNode, useCallback, useMemo, useState } from 'react';
import { SubmitHandler, useForm, useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import {
  AttachmentCreateRequest,
  PostCreateRequest,
  PostEntity,
} from '@re/api/generated/types.gen';
import { useMutation } from '@tanstack/react-query';

import { POST_ATTACHMENT_TYPE } from '~entities/post-attachment/model/const';
import { transformPostAttachments } from '~entities/post-attachment/model/utils';
import { client } from '~shared/api/client';
import { v2ForumCreateMutation, v2ForumUpdateMutation } from '~shared/api/generated/tanstack';
import { useErrorHandler } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useSession } from '~shared/lib/session/use-session';
import { Form, useDebouncedFormChange } from '~shared/ui/form';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { arrayOptional } from '~shared/utils/array-optional';
import { useStrictContext } from '~shared/utils/use-strict-context';

import { PostFormSchema } from './schema';
import { serializeFormValues } from './utils';

interface PostDataContextSchema {
  post?: PostEntity;
}

export const PostDataContext = createContext<PostDataContextSchema | null>(null);

interface PostDataProviderProps {
  post?: PostEntity;
  children: ReactNode;
}

const PostDataProvider = ({ post, children }: PostDataProviderProps) => {
  const context = {
    post,
  };

  return <PostDataContext.Provider value={context}>{children}</PostDataContext.Provider>;
};

interface PostAttachmentsContextSchema {
  attachments: Array<AttachmentCreateRequest>;
  add: (type: string, model: any) => void;
  remove: () => void;
}

export const PostAttachmentsContext = createContext<PostAttachmentsContextSchema | null>(null);

interface PostAttachmentsProviderProps {
  children: ReactNode;
}

const PostAttachmentsProvider = ({ children }: PostAttachmentsProviderProps) => {
  const { post } = useStrictContext(PostDataContext);
  const [attachments, setAttachments] = useState(() => transformPostAttachments(post?.attachments));

  const handleRemove = () => {};

  const handleAdd = (type: string, model: any) => {
    const getId = (type: string, model: any) =>
      type === POST_ATTACHMENT_TYPE.quiz ? model.quiz.id : model.id;

    setAttachments((prev) => {
      const prevTypeValue = prev[type] ?? [];

      if (prevTypeValue.find((it) => getId(type, it) == getId(type, model))) return prev;

      const newValue = {
        ...prev,
        [type]: [...prevTypeValue, model],
      };

      return newValue;
    });
  };

  const context = {
    attachments,
    add: handleAdd,
    remove: handleRemove,
  };

  return (
    <PostAttachmentsContext.Provider value={context}>{children}</PostAttachmentsContext.Provider>
  );
};

export const useAvailableAuthors = () => {
  const { post } = useStrictContext(PostDataContext);

  const session = useSession();
  const publishers = session?.publishers || [];
  const clubs = session?.clubs || [];

  const availableAuthors = useMemo(
    () =>
      ({
        user: [
          ...arrayOptional(!!session, session!),
          ...arrayOptional(
            !!post?.author_user && post?.author_user.id !== session?.id,
            post?.author_user!
          ),
        ].map(
          (it) =>
            ({
              id: it.id,
              name: it!.username,
              type: 'user',
              cover: it.avatar,
            }) as const
        ),
        publisher: [
          ...publishers,
          ...arrayOptional(
            !!post?.author_publisher &&
              !publishers.find((it) => it.id === post.author_publisher?.id),
            post?.author_publisher!
          ),
        ].map(
          (publisher) =>
            ({
              id: publisher.id,
              name: publisher.name,
              type: 'publisher',
              cover: publisher.cover,
            }) as const
        ),
        club: [
          ...clubs,
          ...arrayOptional(
            !!post?.author_club && !clubs.find((it) => it.id === post.author_club?.id),
            post?.author_club!
          ),
        ].map(
          (club) =>
            ({
              id: club.id,
              name: club.name,
              type: 'club',
              cover: club.avatar,
            }) as const
        ),
      }) as const,
    [session, post]
  );

  return availableAuthors;
};

interface PostMutationContextSchema {
  mode: 'create' | 'edit';
  state: { isPending: boolean; isSubmitSuccess: boolean };
  actions: {
    handleSubmit: () => void;
  };
}

export const PostMutationContext = createContext<PostMutationContextSchema | null>(null);

interface PostCreateMutationProviderProps {
  children: ReactNode;
  onSuccess?: (data: PostEntity) => void;
}

export const PostCreateMutationProvider = ({
  children,
  onSuccess,
}: PostCreateMutationProviderProps) => {
  const tReusable = useTranslations('reusable');

  const form = useFormContext<PostFormSchema>();

  const { handleSubmit: handleSubmitForm } = form;
  const { mutateAsync: handleCreatePost, isPending } = useMutation(
    v2ForumCreateMutation({ client })
  );
  const [fullSuccess, setFullSuccess] = useState(false);
  const resolveErrors = useErrorHandler({ form });

  const handleSubmit: SubmitHandler<PostFormSchema> = async (values) => {
    const body = serializeFormValues(values);

    const toast = await importToastAsync();

    try {
      const data = await handleCreatePost({ body });

      toast.success(tReusable('messages.success'));
      onSuccess?.(data);
      setFullSuccess(true);
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrors(e, (f) => f, false, true);
    }
  };

  const context: PostMutationContextSchema = {
    mode: 'create',
    state: { isPending, isSubmitSuccess: fullSuccess },
    actions: {
      handleSubmit: handleSubmitForm(handleSubmit, (e) =>
        logger.error(e, { scope: ['local', 'forum-create'] })
      ),
    },
  };

  return <PostMutationContext.Provider value={context}>{children}</PostMutationContext.Provider>;
};

interface PostEditMutationProviderProps {
  children: ReactNode;
  dir: string;
  onSuccess?: () => void;
}
//todo post-create branch fixes this any
export const PostEditMutationProvider = ({
  children,
  onSuccess,
  dir,
}: PostEditMutationProviderProps) => {
  const tReusable = useTranslations('reusable');
  const form = useFormContext<PostFormSchema>();
  const { handleSubmit: handleSubmitForm } = form;
  const [fullSuccess, setFullSuccess] = useState(false);

  const { mutateAsync: handleUpdatePost, isPending } = useMutation(
    v2ForumUpdateMutation({ client })
  );

  const resolveErrors = useErrorHandler({ form });

  const handleSubmit: SubmitHandler<PostFormSchema> = async (values) => {
    const body = serializeFormValues(values);

    const toast = await importToastAsync();

    try {
      await handleUpdatePost({ body, path: { dir } });

      toast.success(tReusable('messages.success'));
      onSuccess?.();
      setFullSuccess(true);
    } catch (e) {
      logger.error(e);
      await resolveErrors(e);
    }
  };

  const context: PostMutationContextSchema = {
    mode: 'edit',
    state: {
      isPending,
      isSubmitSuccess: fullSuccess,
    },
    actions: {
      handleSubmit: handleSubmitForm(handleSubmit, (e) =>
        logger.error(e, { scope: ['locale', 'forum-edit'] })
      ),
    },
  };

  return <PostMutationContext.Provider value={context}>{children}</PostMutationContext.Provider>;
};
export interface PostFormProviderProps {
  defaultValues?: Partial<PostCreateRequest>;
  children: ReactNode;
  onDebouncedChange?: (val: Partial<PostCreateRequest>) => void;
}
const WithDebounceValuesHandler = ({
  onDebouncedChange,
}: Pick<PostFormProviderProps, 'onDebouncedChange'>) => {
  const form = useFormContext();
  const onFormChangeWithSerializing = useCallback((val: PostFormProviderProps['defaultValues']) => {
    onDebouncedChange?.(serializeFormValues(val));
  }, []);
  useDebouncedFormChange({ form, onFormChange: onFormChangeWithSerializing, debounceTimeout: 600 });
  return <></>;
};
export const PostFormProvider = (props: PostFormProviderProps) => {
  'use no memo';

  const { defaultValues = {}, children, onDebouncedChange } = props;
  const sessionId = useSession((v) => v?.id!);
  const form = useForm({
    mode: 'onSubmit',
    defaultValues: {
      tags: [],
      author: {
        type: 'user',
        id: sessionId,
      },
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <>
        {children}
        {!!onDebouncedChange && (
          <WithDebounceValuesHandler onDebouncedChange={onDebouncedChange} key="debounce-handler" />
        )}
      </>
    </Form>
  );
};

export type PostFormCreateRootProviderProps = PostFormProviderProps &
  PostCreateMutationProviderProps &
  PostDataProviderProps & { onDebouncedChange?: (val: PostFormSchema) => void };

export const PostFormCreateRootProvider = ({
  children,
  onSuccess,
  onDebouncedChange,
  defaultValues,
}: PostFormCreateRootProviderProps) => (
  <PostDataProvider>
    <PostFormProvider onDebouncedChange={onDebouncedChange} defaultValues={defaultValues}>
      <PostAttachmentsProvider>
        <PostCreateMutationProvider onSuccess={onSuccess}>{children}</PostCreateMutationProvider>
      </PostAttachmentsProvider>
    </PostFormProvider>
  </PostDataProvider>
);

export type PostFormEditRootProviderProps = PostFormProviderProps &
  PostEditMutationProviderProps &
  Required<PostDataProviderProps>;

export const PostFormEditRootProvider = ({
  children,
  dir,
  onSuccess,
  defaultValues,
  post,
}: PostFormEditRootProviderProps) => (
  <PostDataProvider post={post}>
    <PostFormProvider defaultValues={defaultValues}>
      <PostAttachmentsProvider>
        <PostEditMutationProvider dir={dir} onSuccess={onSuccess}>
          {children}
        </PostEditMutationProvider>
      </PostAttachmentsProvider>
    </PostFormProvider>
  </PostDataProvider>
);
