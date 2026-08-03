import { ComponentPropsWithoutRef, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { useEventCallback } from '~shared/hooks/use-event-callback';

interface InViewTriggerProps extends ComponentPropsWithoutRef<'div'> {
  onTrigger: (options?: { cancelRefetch?: boolean }) => Promise<unknown> | void;
  canTrigger?: boolean;
}

export const InViewTrigger = (props: InViewTriggerProps) => {
  const { onTrigger, canTrigger = false, children, ...rest } = props;

  const [inView, setInView] = useState(false);
  const [inViewRef] = useInView({
    threshold: 0.5,
    trackVisibility: true,
    delay: 300,
    onChange: setInView,
  });

  const memoizedTriggerFunction = useEventCallback(onTrigger);

  const triggerReady = inView && canTrigger;

  useEffect(() => {
    if (triggerReady) {
      memoizedTriggerFunction();
    }
  }, [triggerReady, memoizedTriggerFunction]);

  return (
    <div ref={inViewRef} {...rest}>
      {triggerReady ? children : null}
    </div>
  );
};
