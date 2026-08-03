'use client';

import { lazy, Suspense } from 'react';

import type { AddSimilarFormModalProps } from './add-similar-form-modal';

const AddSimilarFormModal = lazy(() =>
  import(/* webpackChunkName: "AddSimilarFormModal" */ './add-similar-form-modal').then((m) => ({
    default: m.AddSimilarFormModal,
  }))
);

export type AddSimilarFormModalAsyncProps = AddSimilarFormModalProps;

export const AddSimilarFormModalAsync = (props: AddSimilarFormModalAsyncProps) => (
  <Suspense fallback="">
    <AddSimilarFormModal {...props} />
  </Suspense>
);
