import React, { memo } from 'react';
import { useFormContext } from 'react-hook-form';

import { useRouter } from '@bprogress/next';
import ArrowIcon from '@re/ui-kit/icons/arrow-left';
import { Button, type ButtonProps } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import type { ChapterSchema } from '~shared/api/models/chapter';
import type { PublisherSchema } from '~shared/api/models/publisher';
import { ContentTypes } from '~shared/config/constants';
import { Form, useForm } from '~shared/ui/form';
import { ProgressCircular } from '~shared/ui/progress-circular';

import { EditMangaFormValidator, EditNovelFormValidator } from '../../model/form-shema';
import { getEditMangaDefaultValues, getEditNovelDefaultValues } from '../../model/mappers';
import {
  ChapterContextProvider,
  useChapterContext,
  useCreateEditChapterStoreValue,
} from '../../model/store';

import { FormItem } from './chapter-edit-form-item';

interface ChapterEditFormProps {
  onSubmit: (...args: any) => void;
  onError?: (...args: any) => void;
  defaultValues: any;
  contentType: ContentTypes;
  disabled?: boolean;
}

const StatusLoading = memo(({ progress }: { progress: number }) => (
  <ProgressCircular.Root className="size-7" value={progress}>
    <ProgressCircular.Content className="text-xs"></ProgressCircular.Content>
  </ProgressCircular.Root>
));

const ChapterStatus = () => {
  const { variables } = useChapterContext();
  const uploadProgress = variables.uploadProgress;

  if (uploadProgress) return <StatusLoading progress={uploadProgress} />;

  return null;
};

export const BackButton = (props: ButtonProps) => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Button {...props} variant="outline" startIcon={<ArrowIcon />} onClick={handleGoBack}>
      Назад
    </Button>
  );
};

const ChapterEditForm = (props: ChapterEditFormProps) => {
  const { onSubmit, onError = console.error, contentType } = props;

  const {
    handleSubmit: handleSubmitForm,
    formState: { dirtyFields, isSubmitting, defaultValues },
  } = useFormContext();

  const handleSubmit = handleSubmitForm((values) => {
    const pureValues: typeof values = {};

    Object.keys(dirtyFields).forEach((key) => {
      // if server value and current are falsy - skip
      const isPureField = !defaultValues?.[key] && !values?.[key];
      if (!isPureField) {
        pureValues[key] = values[key];
      }
    });

    onSubmit(pureValues);
  }, onError);

  const haveUnsavedChanges = Object.keys(dirtyFields).length !== 0 && !isSubmitting;

  // useBeforeUnload(haveUnsavedChanges);

  return (
    <form className="mx-3 flex flex-col gap-4 sm:mx-0">
      <BackButton className="self-start">Назад</BackButton>
      <div className="border-border flex flex-col gap-4 rounded-md border p-5">
        <header className="flex justify-between">
          <ReText size="xl" component="h2" weight="semibold">
            Редактировать главу
          </ReText>
        </header>

        <div className="flex flex-[1] flex-wrap items-center gap-2">
          <FormItem contentType={contentType} />
        </div>

        <div className="flex gap-4">
          <Button loading={isSubmitting} onClick={handleSubmit} disabled={!haveUnsavedChanges}>
            Сохранить изменения
          </Button>
          <ChapterStatus />
        </div>
      </div>
    </form>
  );
};

interface ChapterEditFormRootProps extends Omit<ChapterEditFormProps, 'contentType'> {
  defaultData: ChapterSchema;
  contentType?: ContentTypes;
  titleDir: string;
  uploadProgress: number | null;
  publishers: PublisherSchema[];
}

const ChapterEditFormRoot = (props: ChapterEditFormRootProps) => {
  const {
    defaultData,
    contentType = ContentTypes.MANGA,
    titleDir,
    uploadProgress,
    publishers,
    disabled,
    ...rest
  } = props;

  const Validator =
    contentType === ContentTypes.MANGA ? EditMangaFormValidator : EditNovelFormValidator;
  const getEditDefaultValues =
    contentType === ContentTypes.MANGA ? getEditMangaDefaultValues : getEditNovelDefaultValues;

  const form = useForm({
    defaultValues: getEditDefaultValues({ defaultData }),
    schema: Validator,
  });

  const chapterContextValue = useCreateEditChapterStoreValue({
    constants: {
      defaultData,
      contentType,
      publishers,
      disabled,
    },
    variables: {
      uploadProgress,
    },
  });

  return (
    <ChapterContextProvider value={chapterContextValue}>
      <Form {...form}>
        <ChapterEditForm contentType={contentType} {...rest} />
      </Form>
    </ChapterContextProvider>
  );
};
//todo ну и залупа, why?
export { ChapterEditFormRoot as ChapterEditForm };
