'use client';

import dynamic from 'next/dynamic';

import { DefaultLoading } from './fragments/default-loading';

export const CommentsAsync = dynamic(
  () =>
    import(/* webpackChunkName: "Comments" */ './comments').then((m) => ({
      default: m.Comments,
    })),
  {
    ssr: false,
    loading: () => <DefaultLoading />,
  }
);
