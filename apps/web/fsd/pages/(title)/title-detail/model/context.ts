'use client';

import { createContext } from '@re/core/utils/create-context';

import { TitleRetrieveResponseSchema } from '~shared/api/models/title';

export const { Provider: TitleAsyncProvider, useStore: useTitleAsyncContext } = createContext<
  Promise<TitleRetrieveResponseSchema>,
  Promise<TitleRetrieveResponseSchema>
>((v) => v);
