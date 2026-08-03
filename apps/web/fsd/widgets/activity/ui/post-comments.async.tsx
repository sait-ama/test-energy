'use client';

import dynamic from 'next/dynamic';

import { DefaultLoading } from './fragments/default-loading';

export const PostCommentsAsync = dynamic(
  () =>
    import(/* webpackChunkName: "PostComments" */ './post-comments').then((m) => ({
      default: m.PostComments,
    })),
  {
    ssr: false,
    loading: () => <DefaultLoading />,
  }
);
