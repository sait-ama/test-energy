'use client';

import { lazy, Suspense } from 'react';

import Feedback from '@re/ui-kit/icons/feedback';

import type { FeedbackButtonProps } from './feedback';
import { FeedbackTriggerButton } from './feedback-trigger-button';

const FeedbackButton = lazy(() =>
  import(/* webpackChunkName: "FeedbackButton" */ './feedback').then((m) => ({
    default: m.FeedbackButton,
  }))
);

export const FeedbackButtonAsync = (props: FeedbackButtonProps) => (
  <Suspense fallback={<FeedbackTriggerButton {...props} />}>
    <FeedbackButton {...props} />
  </Suspense>
);
export const FeedbackButtonQuickButton = () => {
  return (
    <FeedbackButton>
      <Feedback />
    </FeedbackButton>
  );
};
