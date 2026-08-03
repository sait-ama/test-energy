import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import omit from 'lodash.omit';

import { createContextSelector } from '@re/core/utils/create-context-selector';

import { compareChapters, generateNewItem, getNextChapterDefaultValues } from '../utils';

export const useCreateEditChapterStoreValue = (data) => {
  const constants = {
    ...data.constants,
    isPublished: data.constants.defaultData.is_published,
  };

  const [variables, setVariables] = useState({
    isPreviewed: false,
    fileProgress: null,
  });

  const value = {
    constants,
    variables: variables,
    setVariables,
  };

  return value;
};

export const useCreateAddChapterStoreValue = (data) => {
  'use no memo';

  const [variables, setVariables] = useState({
    previewId: null,
    fileProgress: null,
    disableDeleteWarning: false,
  });

  const form = useFormContext();

  const { watch } = form;

  const formValue = watch('value');

  const formValueSorted = Object.values(formValue).sort((chapter1, chapter2) =>
    compareChapters([
      [chapter1.fields.tome, chapter1.fields.chapter],
      [chapter2.fields.tome, chapter2.fields.chapter],
    ])
  );

  const constants = {
    isPublished: false,
    formValueSorted,
  };

  const value = {
    constants: {
      ...data.constants,
      ...constants,
    },
    variables: {
      ...data.variables,
      ...variables,
    },
    setVariables,
  };

  return value;
};

// export namespace ChapterStore {
//     export type Edit = {};

//     export type Add = {};
// }

export const {
  Provider: ChapterContextProvider,
  useStore: useChapterContext,
  Consumer: ChapterContextConsumer,
} = createContextSelector<any, any>((value) => value);

export type ChapterUploadStateValue = number | 'success' | null;
export type ChapterUploadState = Map<string, ChapterUploadStateValue>;

export interface ChapterUploadContextInit {
  uploadState: ChapterUploadState;
}

export interface ChapterUploadContextValue {
  uploadState: ChapterUploadState;
  getProgress: (id: string) => number | null;
  hasError: (id: string) => boolean;
  isChapterUploaded: (id: string) => boolean;
}

export const {
  Provider: ChapterUploadContextProvider,
  useStore: useChapterUploadContext,
  Consumer: ChapterUploadContextConsumer,
} = createContextSelector<ChapterUploadContextValue, ChapterUploadContextInit>((options) => {
  const { uploadState } = options;
  const {
    formState: { errors },
  } = useFormContext();

  const getProgress = (id: string): number | null => {
    const value = uploadState.get(id);

    return typeof value === 'number' ? value : null;
  };

  //@ts-ignore
  const hasError = (id: string) => !!errors.value?.[id];

  const isChapterUploaded = (id: string) => uploadState.get(id) === 'success';

  return {
    uploadState,
    getProgress,
    hasError,
    isChapterUploaded,
  };
});

interface ChapterItemActionsContextValue {
  addItem: () => void;
  removeItems: (ids: string[]) => void;
}

export const {
  Provider: ChapterItemActionsContextProvider,
  useStore: useChapterItemActionsContext,
  Consumer: ChapterItemActionsContextConsumer,
} = createContextSelector<ChapterItemActionsContextValue, void>(() => {
  const { getValues, setValue } = useFormContext();

  const formValueSorted = useChapterContext((v) => v.constants.formValueSorted);

  const addItem = () => {
    const formValue = getValues('value');
    const last = formValueSorted.length
      ? formValueSorted[formValueSorted.length - 1]?.fields
      : null;

    const defaultValues = last
      ? {
          publisher: last.publisher,
          ...getNextChapterDefaultValues(last),
        }
      : null;

    const newItem = generateNewItem(defaultValues);

    const newValue = { ...formValue, [newItem.id]: newItem };

    setValue('value', newValue);
  };

  const removeItems = (ids: string[]) => {
    const value = getValues(`value`);

    const newValue = omit(value, ids);

    if (Object.keys(newValue).length) {
      setValue('value', newValue);
    } else {
      const emptyItem = generateNewItem();
      const newValue = {
        [emptyItem.id]: emptyItem,
      };

      setValue('value', newValue);
    }
  };

  return {
    addItem,
    removeItems,
  };
});

export const usePreviewIdFallback = () => {
  const previewId = useChapterContext((v) => v.variables.previewId);
  const formValueSorted = useChapterContext((v) => v.constants.formValueSorted);
  const isChapterUploaded = useChapterUploadContext((v) => v.isChapterUploaded);
  const formValueSortedUnuploaded = formValueSorted.filter((v) => !isChapterUploaded(v.id));

  const previewIdFallback = previewId ?? formValueSortedUnuploaded[0]?.id ?? formValueSorted[0]?.id;

  return previewIdFallback;
};
