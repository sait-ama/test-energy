import { createJSONStorage, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createStore } from 'zustand/vanilla';
import { querystring } from 'zustand-querystring';

import { cookieStorage } from '~shared/utils/cookie-service';

import { TAGS_COOKIE_NAME, TAGS_COOKIE_VERSION } from './consts';

interface ForumTagsState {
  includes: number[];
  excludes: number[];
}
export interface ForumTagsStateExternal {
  state: ForumTagsState;
}

interface ForumTagsActions {
  toggle: (id: number) => void;
  remove: (id: number) => void;
  restore: () => void;
}

export interface ForumTagsStore extends ForumTagsState, ForumTagsActions {}

const persistConfig = {
  name: TAGS_COOKIE_NAME,
  storage: createJSONStorage(() => cookieStorage),
  version: TAGS_COOKIE_VERSION,
  // skipHydration: true,
};

const queryStringConfig = {
  select() {
    return {
      includes: true,
      excludes: true,
    };
  },
};

export const createForumTagsStore = (initialState?: Partial<ForumTagsState>) => {
  return createStore<ForumTagsStore>()(
    subscribeWithSelector(
      persist(
        querystring(
          immer((set) => ({
            includes: initialState?.includes || [],
            excludes: initialState?.excludes || [],

            toggle: (id: number) =>
              set((state) => {
                if (state.includes.includes(id)) {
                  state.includes = state.includes.filter((item) => item !== id);
                  if (!state.excludes.includes(id)) {
                    state.excludes.push(id);
                  }
                } else if (state.excludes.includes(id)) {
                  state.excludes = state.excludes.filter((item) => item !== id);
                } else {
                  state.includes.push(id);
                }
              }),

            remove: (id: number) =>
              set((state) => {
                state.includes = state.includes.filter((item) => item !== id);
                state.excludes = state.excludes.filter((item) => item !== id);
              }),

            restore: () =>
              set(() => ({
                includes: [],
                excludes: [],
              })),
          })),
          queryStringConfig
        ),
        persistConfig
      )
    )
  );
};
