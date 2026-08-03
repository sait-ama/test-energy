export enum BOOKMARK_ORDERING {
  SMART = 'smart',
  CHAPTER_DATE_DESC = '-chapter_date',
  DATE_DESC = '-date',
  DATE = 'date',
  NAME = 'name',
  NAME_DESC = '-name',
  COUNT_CHAPTERS_DESC = '-count_chapters',
}

export const BOOKMARK_ORDERING_DEFAULT = BOOKMARK_ORDERING.CHAPTER_DATE_DESC;

export const BOOKMARK_ORDERING_OPTIONS = [
  { value: BOOKMARK_ORDERING.SMART, label: 'Сначала непрочитанные' },
  { value: BOOKMARK_ORDERING.CHAPTER_DATE_DESC, label: 'По дате обновлений глав' },
  { value: BOOKMARK_ORDERING.DATE_DESC, label: 'Сначала новые' },
  { value: BOOKMARK_ORDERING.DATE, label: 'Сначала старые' },
  { value: BOOKMARK_ORDERING.NAME, label: 'По алфавиту (А-Я)' },
  { value: BOOKMARK_ORDERING.NAME_DESC, label: 'По алфавиту (Я-А)' },
  { value: BOOKMARK_ORDERING.COUNT_CHAPTERS_DESC, label: 'По количеству эпизодов' },
] as const;
