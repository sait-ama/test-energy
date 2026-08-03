import type { ChapterSchema } from '~shared/api/models/chapter';

import { getNextChapterDefaultValues } from '../utils';
import type {
  AddMangaFormFieldsSchema,
  AddNovelFormFieldsSchema,
  EditMangaFormSchema,
  EditNovelFormSchema,
} from './form-shema';

interface GetEditDefaultValueOptions {
  defaultData: ChapterSchema;
}

export const getEditMangaDefaultValues = ({ defaultData }: GetEditDefaultValueOptions) => {
  const isPublished = defaultData.is_published;

  const defaultValues: EditMangaFormSchema = {
    tome: defaultData.tome,
    name: defaultData.name,
    is_paid: Number(!!defaultData.is_paid) as 0 | 1,
    chapter: defaultData.chapter,
    price: defaultData.price,
    pub_date: defaultData.pub_date ? defaultData.pub_date : undefined,
    publisher: defaultData.publishers.map((v) => Number(v.id)) || [],
  };

  if (!isPublished) {
    defaultValues.delay_pub_date = defaultData.delay_pub_date
      ? defaultData.delay_pub_date
      : undefined;
  }

  defaultValues.file = undefined;

  //@ts-ignore
  defaultValues.content = defaultData.content;

  return defaultValues;
};

export const getEditNovelDefaultValues = ({ defaultData }: GetEditDefaultValueOptions) => {
  const isPublished = defaultData.is_published;

  const defaultValues: EditNovelFormSchema = {
    tome: defaultData.tome,
    name: defaultData.name,
    is_paid: Number(!!defaultData.is_paid) as 0 | 1,
    chapter: defaultData.chapter,
    price: defaultData.price,
    pub_date: defaultData.pub_date ? defaultData.pub_date : undefined,
    publisher: defaultData.publishers.map((v) => Number(v.id)) || [],
    content: defaultData.content,
  };

  if (!isPublished) {
    defaultValues.delay_pub_date = defaultData.delay_pub_date
      ? defaultValues.delay_pub_date
      : undefined;
  }

  //@ts-ignore
  defaultValues.content = defaultData.content;

  return defaultValues;
};

interface GetAddDefaultValueOptions {
  defaultData?: ChapterSchema; // last chapter (uploaded/not uploaded)
  publishers: any[];
}

export const getAddMangaDefaultValues = ({
  defaultData,
  publishers /* , contentType */,
}: GetAddDefaultValueOptions) => {
  const fields: Partial<AddMangaFormFieldsSchema> = {
    publisher: publishers?.[0] ? [publishers[0].id] : [],
    ...getNextChapterDefaultValues(defaultData),
  };

  return {
    value: {
      first: { id: 'first', fields },
    },
  };
};

export const getAddNovelDefaultValues = ({
  defaultData,
  publishers /* , contentType */,
}: GetAddDefaultValueOptions) => {
  const fields: Partial<AddNovelFormFieldsSchema> = {
    publisher: publishers?.[0] ? [publishers[0].id] : [],
    ...getNextChapterDefaultValues(defaultData),
  };

  const defaultValues = {
    value: {
      first: { id: 'first', fields },
    },
  };

  return defaultValues;
};
