import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { cookieStorage } from '~shared/utils/cookie-service';

import {
  READER_PROMO_MODAL_CHAPTERS_TO_NEXT_OPEN,
  READER_PROMO_MODAL_COOKIE_NAME,
  READER_PROMO_MODAL_COOKIE_VERSION,
} from './constants';

type ReaderPromoModalState = {
  isOpen: boolean;
  readedChapters: number[];
};

type ReaderPromoModalActions = {
  addChapterRead: (chapterId: number) => void;
  onSubmit: () => void;
  onClose: () => void;
};

type ReaderPromoModalStore = ReaderPromoModalState & ReaderPromoModalActions;

export const useReaderPromoModalStore = create<ReaderPromoModalStore>()(
  persist(
    immer((set) => ({
      isOpen: false,
      readedChapters: [],
      timeouts: [],
      addChapterRead: (chapterId: number) => {
        set((state) => {
          if (state.readedChapters.includes(chapterId)) return;
          if (state.readedChapters.length >= READER_PROMO_MODAL_CHAPTERS_TO_NEXT_OPEN - 1) {
            state.isOpen = true;
            state.readedChapters = [];
          } else {
            state.readedChapters.push(chapterId);
          }
        });
      },
      onSubmit: () => {
        set((state) => {
          state.isOpen = false;
          state.readedChapters = [];
        });
      },
      onClose: () => {
        set((state) => {
          state.isOpen = false;
          state.readedChapters = [];
        });
      },
    })),
    {
      name: READER_PROMO_MODAL_COOKIE_NAME,
      storage: createJSONStorage(() => cookieStorage),
      version: READER_PROMO_MODAL_COOKIE_VERSION,
      partialize: (state) => ({
        readedChapters: state.readedChapters,
      }),
    }
  )
);
