import React, { memo, ReactNode, useId, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { useRouter } from '@bprogress/next';
import AddIcon from '@re/ui-kit/icons/add';
import ArrowIcon from '@re/ui-kit/icons/arrow-left';
import CheckIcon from '@re/ui-kit/icons/check';
import CoinIcon from '@re/ui-kit/icons/coin';
import DocumentIcon from '@re/ui-kit/icons/document';
import ReportIcon from '@re/ui-kit/icons/report';
import { Button, type ButtonProps } from '@re/ui-kit/ui/button';
import { Checkbox } from '@re/ui-kit/ui/checkbox';
import { Dialog, DialogContent, DialogTitle } from '@re/ui-kit/ui/dialog';
import { ReText } from '@re/ui-kit/ui/text';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@re/ui-kit/ui/tooltip';
import { cn } from '@re/ui-kit/utils/cn';

import type { ChapterSchema } from '~shared/api/models/chapter';
import type { PublisherSchemaFragment } from '~shared/api/models/publisher';
import { ContentTypes } from '~shared/config/constants';
import { useErrorHandler } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { Media } from '~shared/lib/media';
import { Display } from '~shared/lib/media/const';
import { SelectionProvider, useSelection } from '~shared/lib/selection';
import { Form, useForm } from '~shared/ui/form';
import { ProgressCircular } from '~shared/ui/progress-circular';

import { AddMangaFormValidator, AddNovelFormValidator } from '../../model/form-shema';
import { getAddMangaDefaultValues, getAddNovelDefaultValues } from '../../model/mappers';
import type { ChapterUploadState } from '../../model/store';
import {
  ChapterContextProvider,
  ChapterItemActionsContextProvider,
  ChapterUploadContextProvider,
  useChapterContext,
  useChapterItemActionsContext,
  useChapterUploadContext,
  useCreateAddChapterStoreValue,
  usePreviewIdFallback,
} from '../../model/store';
import { isEmptyFields } from '../../utils';
import { NovelEditor } from '../fragments/novel-editor';
import { SelectionCheckbox } from '../fragments/selection-checkbox';

import { FormItem } from './chapter-add-form-item';

export interface DeleteButtonProps extends ButtonProps {}

const DeleteButton = memo((props: DeleteButtonProps) => {
  const { selection, unselectAll, getSelection } = useSelection();
  //@ts-ignore
  const selectedAmount = selection.include.size;

  const [open, setOpen] = useState(false);
  const setVariables = useChapterContext((v) => v.setVariables);
  const { disableDeleteWarning } = useChapterContext((v) => v.variables);

  const removeItems = useChapterItemActionsContext((v) => v.removeItems);

  const removeSelectedItems = async () => {
    removeItems(getSelection<string>().ids);

    unselectAll();
  };

  const handleClick = () => {
    if (disableDeleteWarning) {
      removeSelectedItems();
    } else {
      setOpen(true);
    }
  };

  const labelId = useId();

  return (
    <>
      <Button {...props} variant="destructive" onClick={handleClick} disabled={!selectedAmount}>
        Удалить выбранное {selectedAmount ? `(${selectedAmount})` : null}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogTitle>Удалить главу?</DialogTitle>
          <div className="flex items-center justify-between">
            <div className="item-center flex gap-2">
              <Checkbox
                id={labelId}
                onCheckedChange={(v) =>
                  setVariables((prev: any) => ({
                    ...prev,
                    disableDeleteWarning: !!v,
                  }))
                }
                value={disableDeleteWarning}
              />
              <ReText component="label" className="cursor-pointer select-none" htmlFor={labelId}>
                Больше не показывать
              </ReText>
            </div>
            <Button
              className="self-end"
              variant="destructive"
              onClick={() => {
                setOpen(false);
                removeSelectedItems();
              }}
            >
              Удалить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

const StatusSuccess = memo(() => {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen} delayDuration={0}>
        <TooltipTrigger asChild>
          <CheckIcon onClick={() => setOpen(true)} size={24} className="text-success" />
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-4">
          Глава загружена
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
const StatusError = memo(() => {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen} delayDuration={0}>
        <TooltipTrigger asChild>
          <ReportIcon onClick={() => setOpen(true)} size={16} className="text-destructive" />
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-4">
          Ошибка загрузки
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

const StatusLoading = memo(({ progress }: { progress: number }) => (
  <ProgressCircular.Root className="size-7" value={progress}>
    <ProgressCircular.Content className="text-xs">{progress}</ProgressCircular.Content>
  </ProgressCircular.Root>
));

const ChapterStatus = ({ id }: { id: string }) => {
  const { isChapterUploaded, getProgress, hasError } = useChapterUploadContext();

  const chapterUploadProgress = getProgress(id);

  if (hasError(id)) return <StatusError />;
  if (isChapterUploaded(id)) return <StatusSuccess />;
  if (chapterUploadProgress) return <StatusLoading progress={chapterUploadProgress} />;

  return null;
};

interface ChapterTabsProps {
  contentType: ContentTypes;
}

const IsPaidStatus = ({ id }: { id: string }) => {
  'use no memo';

  const form = useFormContext();

  const { watch } = form;

  const [open, setOpen] = useState(false);

  const isPaid = watch(`value.${id}.fields.is_paid`);

  return isPaid ? (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen} delayDuration={0}>
        <TooltipTrigger asChild>
          <CoinIcon size={16} onClick={() => setOpen(true)} />
        </TooltipTrigger>
        <TooltipContent side="bottom" className="flex items-center gap-4">
          Платная глава
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : null;
};

const HasFileStatus = ({ id }: { id: string }) => {
  'use no memo';

  const form = useFormContext();

  const { watch } = form;

  const [open, setOpen] = useState(false);

  const file = watch(`value.${id}.fields.file`);

  return file ? (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen} delayDuration={0}>
        <TooltipTrigger asChild>
          <DocumentIcon size={16} onClick={() => setOpen(true)} />
        </TooltipTrigger>
        <TooltipContent side="bottom" className="flex items-center gap-4">
          Прикреплен файл
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : null;
};

const ChapterTabs = memo(({ contentType }: ChapterTabsProps) => {
  const setVariables = useChapterContext((v) => v.setVariables);

  const previewIdFallback = usePreviewIdFallback();
  const { formDisabled, formValueSorted } = useChapterContext((v) => v.constants);

  const isChapterUploaded = useChapterUploadContext((v) => v.isChapterUploaded);

  return (
    <div className="md:border-r-border flex flex-[1] flex-col gap-3 p-4 md:flex-[0_0_20%] md:border-r md:pr-3">
      {formValueSorted.map((value: any) => {
        const chapterUploaded = isChapterUploaded(value.id);
        const tabDisabled = formDisabled || chapterUploaded;

        return (
          <div className="flex items-center gap-2" key={value.id}>
            <SelectionCheckbox id={value.id} disabled={tabDisabled} />
            <ReText
              align="start"
              className={cn(
                'text-foreground w-[160px] flex-[1] overflow-hidden text-ellipsis',
                previewIdFallback == value.id ? 'md:text-primary' : 'md:text-foreground',
                tabDisabled ? 'opacity-50' : 'cursor-pointer'
              )}
              onClick={() => setVariables((v) => ({ ...v, previewId: value.id }))}
            >
              Том: {value.fields.tome || '-'} Глава: {value.fields.chapter || '-'}
            </ReText>

            <div className="flex size-4 items-center justify-center">
              <IsPaidStatus id={value.id} />
            </div>
            {contentType === ContentTypes.MANGA ? (
              <div className="flex size-4 items-center justify-center">
                <HasFileStatus id={value.id} />
              </div>
            ) : null}
            <div className="flex size-8 items-center justify-center">
              <ChapterStatus id={value.id} />
            </div>
          </div>
        );
      })}
    </div>
  );
});

interface ChapterAddFormProps {
  defaultValues: any;
  contentType?: ContentTypes;
  onSubmit: (values: any, onError: any) => void;
  onError?: (values: any) => void;
  disabled?: boolean;
}

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

const ChapterAddForm = (props: ChapterAddFormProps) => {
  'use no memo';

  const {
    contentType = ContentTypes.MANGA,
    onSubmit,
    onError = (e: unknown) => logger.error(e, { scope: ['local'] }),
  } = props;

  const form = useFormContext();

  const {
    handleSubmit: handleSubmitForm,
    watch,
    getValues,
    setValue,
    formState: { dirtyFields, isSubmitSuccessful, errors },
  } = form;

  const haveUnsavedChanges = Object.keys(dirtyFields).length !== 0 && !isSubmitSuccessful;

  // useBeforeUnload(haveUnsavedChanges);

  const formValue = watch('value');
  const resolveError = useErrorHandler({ form });

  const unselectAll = useSelection((v) => v.unselectAll);

  const setVariables = useChapterContext((v) => v.setVariables);

  const formDisabled = useChapterContext((v) => v.constants.disabled);

  const previewIdFallback = usePreviewIdFallback();

  const addItem = useChapterItemActionsContext((v) => v.addItem);

  const handleSubmit = handleSubmitForm((formValue) => {
    const pureValue = Object.values(formValue.value).map((item) => {
      const newFields = { ...item.fields };

      Object.entries(item.fields).forEach(([key, value]) => {
        if (typeof value === 'undefined') delete newFields[key];
      });

      if (!newFields.is_paid) {
        delete newFields.pub_date;
        delete newFields.price;
      }

      return {
        id: item.id,
        fields: newFields,
      };
    });

    unselectAll();

    const onError = (error: unknown, id: string) => {
      resolveError(error, (field) => `value.${id}.fields.${field}`, true);
      setVariables((v) => ({ ...v, previewId: id }));
    };

    onSubmit(pureValue, onError);
  }, onError);

  const hasEmptyFields = Object.values(formValue).some((v) => isEmptyFields(v.fields));

  return (
    <form className="mx-3 flex flex-col">
      <BackButton className="self-start">Назад</BackButton>
      <div className="border-border mt-2 flex flex-col rounded-md border">
        <header className="flex justify-between border-b p-4">
          <ReText size="xl" component="h2" weight="semibold">
            Добавление новых глав
          </ReText>
        </header>
        {/* <Separator className="mb-3" /> */}

        <div className="flex flex-[1] items-stretch gap-5">
          <ChapterTabs contentType={contentType} />
          <FormItem id={previewIdFallback} key={previewIdFallback} contentType={contentType} />
        </div>

        <div
          className={cn(
            'sm:bottom-xs sticky bottom-[56px] flex flex-col justify-between rounded-b-md border-t p-4 sm:flex-row'
            //backdrop-blur-xs
          )}
        >
          <div className="flex items-center justify-stretch gap-2">
            <Button
              startIcon={<AddIcon />}
              color="secondary"
              onClick={addItem}
              disabled={formDisabled || hasEmptyFields}
            >
              Добавить
            </Button>
            <DeleteButton disabled={formDisabled} />
          </div>
          <Button disabled={formDisabled} onClick={handleSubmit} className="mt-3 sm:mt-0">
            Загрузить все
          </Button>
        </div>
      </div>

      {contentType === ContentTypes.NOVEL ? (
        <Media greaterThanOrEqual={Display.md}>
          <NovelEditor
            key={previewIdFallback}
            previewedName={`value.${previewIdFallback}.fields`}
            textName={`value.${previewIdFallback}.fields.content`}
            controlledValueName={`value.${previewIdFallback}.fields.file`}
            className="border-border mt-4 rounded-md border p-4"
          />
        </Media>
      ) : null}
    </form>
  );
};

interface ChapterAddContextProviderProps {
  children: ReactNode;
  value: any;
}

const ChapterAddContextProvider = ({ children, value }: ChapterAddContextProviderProps) => {
  const chapterContextValue = useCreateAddChapterStoreValue(value);

  return <ChapterContextProvider value={chapterContextValue}>{children}</ChapterContextProvider>;
};

interface ChapterAddFormRootProps extends ChapterAddFormProps {
  defaultData?: ChapterSchema;
  contentType?: ContentTypes;
  uploadState: ChapterUploadState;
  publishers: PublisherSchemaFragment[];
}

const ChapterAddFormRoot = (props: ChapterAddFormRootProps) => {
  const {
    defaultData,
    contentType = ContentTypes.MANGA,
    uploadState,
    publishers,
    disabled,
    ...rest
  } = props;

  const Validator =
    contentType === ContentTypes.MANGA ? AddMangaFormValidator : AddNovelFormValidator;
  const getAddDefaultValues =
    contentType === ContentTypes.MANGA ? getAddMangaDefaultValues : getAddNovelDefaultValues;

  const form = useForm({
    defaultValues: getAddDefaultValues({ defaultData, publishers }),
    schema: Validator,
  });

  const chapterContextInit = {
    constants: {
      defaultData,
      contentType,
      publishers,
      disabled,
    },
  };

  const uploadContextInit = {
    uploadState,
  };

  return (
    <Form {...form}>
      <ChapterAddContextProvider value={chapterContextInit}>
        <ChapterUploadContextProvider value={uploadContextInit}>
          <ChapterItemActionsContextProvider>
            <SelectionProvider value={{ config: { storeIdArray: true } }}>
              <ChapterAddForm contentType={contentType} {...rest} />
            </SelectionProvider>
          </ChapterItemActionsContextProvider>
        </ChapterUploadContextProvider>
      </ChapterAddContextProvider>
    </Form>
  );
};

export {
  ChapterAddFormRoot as ChapterAddForm,
  type ChapterAddFormRootProps as ChapterAddFormProps,
};
