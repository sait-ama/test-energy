import dayjs from 'dayjs';
import { nanoid } from 'nanoid';

import { ChapterSchema } from '~shared/api/models/chapter';

export const generateName = (...values: any) => {
  let name = '';

  for (const subName of values) {
    if (!subName) continue;

    name = name ? `${name}.${subName}` : subName;
  }

  return name;
};

export const cutFileName = (fileName: string, length: number) => {
  if (!fileName || fileName.length <= length) return fileName;
  const [name, extension] = fileName.split('.');

  const substringSize = Math.floor(length / 2) - 5;

  if (!name) return '-';

  return `${name.substring(0, substringSize)}...${name.substring(name.length - substringSize)}.${extension}`;
};

export const isEmptyFields = (value: any) =>
  !Object.values(value).some((v) => {
    if (Array.isArray(v)) return !!v.length;
    if (typeof v !== 'number') return !!v;

    return true;
  });

export const generateNewItem = (defaultValues?: any) => ({
  id: nanoid(4),
  fields: {
    tome: null,
    chapter: null,
    name: null,
    file: null,
    is_paid: 0,
    publishers: [],
    ...(defaultValues || {}),
  },
});

type ChapterCompareFields = [
  tome: NumberIsomorphic | null | undefined,
  chapter: NumberIsomorphic | null | undefined,
];

export const compareChapters = (args: [ChapterCompareFields, ChapterCompareFields]) => {
  const [chapterFields1, chapterFields2] = args.map((fields) =>
    fields.map((field) => {
      if (typeof field === 'number') return field;
      if (typeof field === 'string' && !!field) return Number(field);

      return NaN;
    })
  );

  const isInvalid = (v: number) => Object.is(v, NaN);

  const compareValue = (v1: number, v2: number) => {
    const isInvalid1 = isInvalid(v1);
    const isInvalid2 = isInvalid(v2);

    if (isInvalid1 && isInvalid2) return 0;
    if (isInvalid1) return 1;
    if (isInvalid2) return -1;

    return v1 - v2;
  };

  const [tom1, chapter1] = chapterFields1!;
  const [tom2, chapter2] = chapterFields2!;

  const tomComparisonValue = compareValue(tom1!, tom2!);

  if (tomComparisonValue !== 0) return tomComparisonValue;

  return compareValue(chapter1!, chapter2!);
};

export const getNextChapterIndex = (chapter?: NumberIsomorphic | null): string | null => {
  if (chapter == null) return null;

  const currentIndex = Number(chapter);
  if (Number.isNaN(currentIndex)) return null;

  const isFloat = currentIndex % 1 !== 0;
  if (isFloat) {
    const [digit, decimal] = String(chapter)
      .split('.')
      .map((v) => parseInt(v, 10));

    const newDecimal = decimal! + 1;

    const numbersAfterDecimal = String(newDecimal).length;

    return Number(
      (digit! * 10 ** numbersAfterDecimal + newDecimal) / 10 ** numbersAfterDecimal
    ).toFixed(numbersAfterDecimal);
  }

  return `${currentIndex + 1}`;
};

export const getNextChapterDefaultValues = (chapter?: ChapterSchema | null) => ({
  tome: chapter?.tome || 1,
  chapter: getNextChapterIndex(chapter?.chapter) || '1',
  is_paid: Number(!!chapter?.is_paid) as 0 | 1,
  price: chapter?.price,
  pub_date: chapter?.pub_date
    ? dayjs(chapter.pub_date).add(1, 'week').format('YYYY-MM-DDTHH:ss:mm')
    : undefined,
});
