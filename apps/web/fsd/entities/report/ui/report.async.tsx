import type { ReactNode } from 'react';
import { lazy, Suspense } from 'react';

import { noop } from '~shared/utils/noop';

import type { ReportModalProps } from './report-modal';

const Report = lazy(() =>
  import(/* webpackChunkName: "Report" */ './report-modal').then((m) => ({
    default: m.ReportModal,
  }))
);

export const ReportModalAsync = (props: ReportModalProps & { fallback?: ReactNode }) => (
  <Suspense
    fallback={
      props.fallback ||
      (typeof props.children === 'function' ? props.children(noop) : props.children)
    }
  >
    <Report {...props} />
  </Suspense>
);
