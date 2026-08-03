export enum HotkeyAction {
  NEXT_PAGE,
  PREV_PAGE,
  SCROLL_TOP,
  SCROLL_BOTTOM,
  NEXT_CHAPTER,
  PREV_CHAPTER,
  INCREASE_CONTAINER_WIDTH,
  DECREASE_CONTAINER_WIDTH,
}

export const BACK_ACTION_STRATEGY = {
  TITLE: 1,
  PREVIOUS_CHAPTER: 2,
} as const;

export type BackActionStrategy = (typeof BACK_ACTION_STRATEGY)[keyof typeof BACK_ACTION_STRATEGY];

export const IMAGE_SERVER = {
  MAIN: 1,
  RESERVED: 2,
} as const;

export type ImageServer = (typeof IMAGE_SERVER)[keyof typeof IMAGE_SERVER];

export const READER_MAX_CHAPTERS = 3;

export enum ReaderBottomActionId {
  ERRORS_IN_VIEW = '1',
}
