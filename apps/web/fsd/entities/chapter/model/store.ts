'use client';

import { create } from 'zustand';

//todo
interface Options {
  state: CHAPTER_ASIDE | null;
  payload?: any;
}

export enum CHAPTER_ASIDE {
  CHAPTERS = 1,
  COMMENTS = 2,
  SETTINGS = 5,
}

export type State = Options & {
  open: (options: Options) => void;
  close: () => void;
  toggle: (options: Options) => void;
};

export const useChapterAside = create<State>((set) => ({
  state: null,
  payload: null,
  open: (options: Options) => {
    set((prev) => ({ ...prev, payload: null, ...options }));
  },
  toggle: (options: Options) => {
    set((prev) => ({
      ...prev,
      payload: null,
      ...options,
      state: options.state === prev.state ? null : options.state,
    }));
  },
  close: () => {
    set((prev) => ({ ...prev, payload: null, state: null }));
  },
}));
