'use client';

import { Profiler as ReactProfiler, ReactNode } from 'react';

function onRenderCallback(
  id, // the "id" prop of the Profiler tree that has just committed
  phase, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
  actualDuration, // time spent rendering the committed update
  baseDuration // estimated time to render the entire subtree without memoization
  // startTime, // when React started rendering this update
  // commitTime // when React committed this update
) {
  if (phase === 'mount') {
    console.log(
      `[${id}] Actual Duration: ${actualDuration.toFixed(0)}, Base Duration: ${baseDuration.toFixed(0)}`
    );
  }
}

export const Profiler = (props: { children: ReactNode; id: string }) => {
  const { children, id } = props;

  return (
    <ReactProfiler id={id} onRender={onRenderCallback}>
      {children}
    </ReactProfiler>
  );
};
